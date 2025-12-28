import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, UseGuards, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { AcdService } from './acd.service';
import { InjectModel as InjectMongooseModel } from '@nestjs/mongoose';
import { InjectModel as InjectSequelizeModel } from '@nestjs/sequelize';
import { Message } from '../message/message.schema';
import { Model } from 'mongoose';
import { Conversation } from '../conversation/conversation.model';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject('REDIS_CLIENT') private redisClient: Redis,
    private acdService: AcdService,
    @InjectMongooseModel(Message.name) private messageModel: Model<Message>,
    @InjectSequelizeModel(Conversation) private conversationModel: typeof Conversation,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        throw new UnauthorizedException('Token required');
      }

      const secret = this.configService.get<string>('JWT_SECRET');
      const decoded = this.jwtService.verify(token, { secret });
      socket.data.user = decoded; // Store in socket.data

      const { id, role, nickname } = decoded;
      const socketId = socket.id;

      console.log(`🔌 [${role.toUpperCase()}] ${nickname || id} Connected (SocketID: ${socketId})`);

      const EXPIRE_TIME = 60; // 60 seconds for heartbeat

      if (role === 'agent') {
        const key = `im:agent:${id}`;
        
        // Check if agent already exists in Redis to preserve currentChats
        const existingAgent = await this.redisClient.hgetall(key);
        const currentChats = existingAgent?.currentChats ? existingAgent.currentChats : 0;

        await this.redisClient.hset(key, {
          id,
          nickname,
          socketId,
          status: 'idle',
          currentChats: currentChats,
        });
        await this.redisClient.expire(key, EXPIRE_TIME);
        await this.redisClient.sadd('im:agents:online', id);
        socket.join(`agent:${id}`);
      } else if (role === 'visitor') {
        const key = `im:visitor:${id}`;
        await this.redisClient.hset(key, {
          id,
          socketId,
          status: 'online',
        });
        await this.redisClient.expire(key, EXPIRE_TIME);
        await this.redisClient.sadd('im:visitors:online', id);
        socket.join(`visitor:${id}`);
      }
    } catch (err) {
      console.error('Connection Auth Error:', err.message);
      socket.disconnect();
    }
  }

  async handleDisconnect(socket: Socket) {
    // Optional: Cleanup immediately or let Redis expire
    console.log(`Client disconnected: ${socket.id}`);
  }

  @SubscribeMessage('heartbeat')
  async handleHeartbeat(@ConnectedSocket() socket: Socket) {
    const user = socket.data.user;
    if (!user) return;

    const EXPIRE_TIME = 60;
    const { id, role } = user;

    if (role === 'agent') {
      const key = `im:agent:${id}`;
      await this.redisClient.expire(key, EXPIRE_TIME);
    } else if (role === 'visitor') {
      const key = `im:visitor:${id}`;
      await this.redisClient.expire(key, EXPIRE_TIME);
    }
  }

  @SubscribeMessage('join_chat')
  async handleJoinChat(@ConnectedSocket() socket: Socket) {
    const user = socket.data.user;
    if (!user || user.role !== 'visitor') {
      return { status: 'error', msg: 'Only visitors can join chat' };
    }

    const result = await this.acdService.allocateAgent(user.id);

    if (result.success) {
      const { conversationId, agentId, agentSocketId } = result.data;
      const roomName = `conversation_${conversationId}`;
      
      socket.join(roomName);

      // Notify Agent
      if (agentSocketId) {
        this.server.to(agentSocketId).emit('new_visitor', {
          conversationId,
          visitorId: user.id,
          roomName,
        });
        // Make agent join the room
        this.server.in(agentSocketId).socketsJoin(roomName);
      }

      console.log(`✅ Chat Started: ConvID ${conversationId} | Visitor ${user.id} <-> Agent ${agentId}`);
      return { status: 'ok', conversationId, agentId };
    } else {
      return { status: 'error', msg: result.message };
    }
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(@MessageBody() payload: any, @ConnectedSocket() socket: Socket) {
    const { conversationId } = payload;
    const user = socket.data.user;

    if (!conversationId) {
      return { status: 'error', msg: 'Missing conversationId' };
    }

    // Allow agents (and visitors?) to join specific conversation rooms
    // In a real app, check if user belongs to this conversation
    const roomName = `conversation_${conversationId}`;
    socket.join(roomName);
    
    console.log(`🔗 [JOIN] ${user.role} ${user.id} joined ${roomName}`);
    return { status: 'ok' };
  }

  @SubscribeMessage('send_msg')
  async handleSendMsg(@MessageBody() payload: any, @ConnectedSocket() socket: Socket) {
    try {
      const { conversationId, content, contentType = 'text', meta } = payload;
      const user = socket.data.user;

      if (!conversationId || !content) {
        return { status: 'error', msg: 'Missing parameters' };
      }

      const msgData = {
        conversationId,
        sender: {
          id: user.id,
          role: user.role,
          nickname: user.nickname || (user.role === 'visitor' ? 'Visitor' : 'Agent'),
        },
        content: {
          type: contentType,
          data: content,
          meta: meta || {},
        },
      };

      const message = await this.messageModel.create(msgData);
      const roomName = `conversation_${conversationId}`;
      
      socket.to(roomName).emit('receive_msg', message);

      console.log(`📨 [MSG] Conv ${conversationId}: ${user.role} sent message`);
      return { status: 'ok', data: message };
    } catch (err) {
      console.error('Send Msg Error:', err);
      return { status: 'error', msg: 'Server error' };
    }
  }

  @SubscribeMessage('end_chat')
  async handleEndChat(@MessageBody() payload: any, @ConnectedSocket() socket: Socket) {
    try {
      const { conversationId } = payload;
      const user = socket.data.user;

      const conversation = await this.conversationModel.findByPk(conversationId);
      if (!conversation) {
        return { status: 'error', msg: 'Conversation not found' };
      }

      conversation.status = 'closed';
      conversation.end_time = new Date();
      await conversation.save();

      const agentId = conversation.agent_id;
      const agentKey = `im:agent:${agentId}`;
      const currentChats = await this.redisClient.hincrby(agentKey, 'currentChats', -1);

      if (currentChats < 5) {
        await this.redisClient.hset(agentKey, 'status', 'idle');
      }

      const roomName = `conversation_${conversationId}`;
      this.server.to(roomName).emit('chat_ended', {
        conversationId,
        by: user.role,
      });

      this.server.in(roomName).socketsLeave(roomName);

      console.log(`🛑 Chat Ended: Conv ${conversationId} by ${user.role}`);
      return { status: 'ok' };
    } catch (err) {
      console.error(err);
      return { status: 'error', msg: 'End chat failed' };
    }
  }
}
