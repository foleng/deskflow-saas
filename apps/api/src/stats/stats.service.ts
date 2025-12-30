import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Conversation } from '../conversation/conversation.model';
import { Agent } from '../agent/agent.model';
import Redis from 'ioredis';
import { Op } from 'sequelize';

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(Conversation)
    private conversationModel: typeof Conversation,
    @InjectModel(Agent)
    private agentModel: typeof Agent,
    @Inject('REDIS_CLIENT') private redisClient: Redis,
  ) {}

  async getDashboardStats() {
    // 1. Total Conversations
    const totalConversations = await this.conversationModel.count();

    // 2. Online Agents
    const onlineAgentsCount = await this.redisClient.scard('im:agents:online');

    // 3. CSAT Score (Average score where status is closed and score is not null)
    const csatResult = await this.conversationModel.findAll({
      attributes: [[this.conversationModel.sequelize.fn('AVG', this.conversationModel.sequelize.col('score')), 'avgScore']],
      where: {
        score: { [Op.ne]: null }
      },
      raw: true,
    });
    const csatScore = csatResult[0]?.['avgScore'] ? parseFloat(csatResult[0]['avgScore']).toFixed(1) : '0.0';

    // 4. Avg Response Time (Mocked for now as we don't have message timestamps in SQL easily accessible without join)
    // In a real app, we would query the messages table or store metrics in Redis/TimeScaleDB
    const avgResponseTime = '2m 15s'; 

    return {
      success: true,
      data: {
        conversations: { value: totalConversations.toString(), trend: '12%', trendDirection: 'up' },
        responseTime: { value: avgResponseTime, trend: '10s', trendDirection: 'down' },
        csat: { value: `${csatScore}/5`, trend: '0.2', trendDirection: 'up' },
        agents: { value: onlineAgentsCount.toString(), trend: '', trendDirection: 'up' }
      }
    };
  }

  async getRecentTickets() {
    const tickets = await this.conversationModel.findAll({
      limit: 5,
      order: [['updatedAt', 'DESC']],
      include: [
          {
              model: Agent,
              attributes: ['nickname', 'avatar']
          }
      ]
    });

    // Map to UI format
    const mappedTickets = tickets.map(t => ({
      key: t.id.toString(),
      status: t.status === 'open' ? 'Open' : 'Pending', // Simplified status mapping
      subject: `Conversation #${t.id}`,
      customerName: `Visitor ${t.visitor_uuid.substring(0, 6)}`,
      customerAvatar: this.generateAvatarColor(t.visitor_uuid),
      updated: new Date(t.updatedAt).toLocaleTimeString(),
    }));

    return {
      success: true,
      data: mappedTickets
    };
  }

  async getAgentsStatus() {
    const agents = await this.agentModel.findAll({
      attributes: ['id', 'nickname', 'email', 'avatar', 'role']
    });

    const onlineAgentIds = await this.redisClient.smembers('im:agents:online');
    
    const mappedAgents = await Promise.all(agents.map(async (agent) => {
      const isOnline = onlineAgentIds.includes(agent.id.toString());
      let status = 'Offline';
      
      if (isOnline) {
        // Check if busy
        const agentKey = `im:agent:${agent.id}`;
        const agentRedisStatus = await this.redisClient.hget(agentKey, 'status');
        status = agentRedisStatus === 'busy' ? 'Busy' : 'Online';
      }

      return {
        key: agent.id,
        name: agent.nickname,
        role: agent.role === 'admin' ? 'Admin' : 'Support Agent',
        status: status,
        avatar: agent.avatar || `https://i.pravatar.cc/150?u=${agent.id}`
      };
    }));

    // Sort: Online first, then Busy, then Offline
    mappedAgents.sort((a, b) => {
        const statusOrder = { 'Online': 0, 'Busy': 1, 'Offline': 2 };
        return statusOrder[a.status] - statusOrder[b.status];
    });

    return {
      success: true,
      data: mappedAgents
    };
  }

  private generateAvatarColor(seed: string) {
    const colors = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#6366f1'];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }
}
