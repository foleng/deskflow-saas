import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { InjectModel } from '@nestjs/sequelize';
import { Conversation } from '../conversation/conversation.model';

@Injectable()
export class AcdService {
  constructor(
    @Inject('REDIS_CLIENT') private redisClient: Redis,
    @InjectModel(Conversation) private conversationModel: typeof Conversation,
  ) {}

  async allocateAgent(visitorUuid: string) {
    // 0. Check for active conversation
    const activeConversation = await this.conversationModel.findOne({
      where: {
        visitor_uuid: visitorUuid,
        status: 'open',
      },
    });

    if (activeConversation) {
      console.log(`♻️ Found active conversation ${activeConversation.id}, resuming...`);
      const agentId = activeConversation.agent_id;
      const agentKey = `im:agent:${agentId}`;
      const agentSocketId = await this.redisClient.hget(agentKey, 'socketId');

      return {
        success: true,
        data: {
          conversationId: activeConversation.id,
          agentId: agentId,
          agentSocketId: agentSocketId,
        },
      };
    }

    console.log(`🧠 ACD: Looking for agent for visitor ${visitorUuid}...`);

    // 1. Get all online agents
    const onlineAgentIds = await this.redisClient.smembers('im:agents:online');

    if (onlineAgentIds.length === 0) {
      return { success: false, message: 'No agents online' };
    }

    let bestAgent = null;
    let minChats = 9999;

    // 2. Find agent with least connections
    for (const agentId of onlineAgentIds) {
      const agentKey = `im:agent:${agentId}`;
      const agentData = await this.redisClient.hgetall(agentKey);

      if (!agentData || Object.keys(agentData).length === 0) {
        console.log(`💀 Found zombie agent ID: ${agentId}, cleaning up...`);
        await this.redisClient.srem('im:agents:online', agentId);
        continue;
      }
      
      const currentChats = parseInt(agentData.currentChats || '0', 10);
      
      if (currentChats < minChats) {
        minChats = currentChats;
        bestAgent = { id: agentId, currentChats };
      }
    }

    if (!bestAgent) {
      return { success: false, message: 'All agents busy' };
    }

    console.log(`🎯 ACD: Selected Agent ID ${bestAgent.id} (Chats: ${bestAgent.currentChats})`);

    // 3. Update Redis status
    const agentKey = `im:agent:${bestAgent.id}`;
    await this.redisClient.hincrby(agentKey, 'currentChats', 1);

    if (bestAgent.currentChats + 1 >= 5) {
      await this.redisClient.hset(agentKey, 'status', 'busy');
    }

    // 4. Create conversation in MySQL
    const conversation = await this.conversationModel.create({
      visitor_uuid: visitorUuid,
      agent_id: bestAgent.id,
      status: 'open',
    });

    // 5. Get Agent Socket ID
    const agentSocketId = await this.redisClient.hget(agentKey, 'socketId');

    return {
      success: true,
      data: {
        conversationId: conversation.id,
        agentId: bestAgent.id,
        agentSocketId: agentSocketId,
      },
    };
  }
}
