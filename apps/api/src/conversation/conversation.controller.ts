import { Controller, Get, Param, Query, UseGuards, Request, ForbiddenException, NotFoundException, Patch } from '@nestjs/common';
import { InjectModel as InjectSequelizeModel } from '@nestjs/sequelize';
import { Conversation } from './conversation.model';
import { InjectModel as InjectMongooseModel } from '@nestjs/mongoose';
import { Message } from '../message/message.schema';
import { Model } from 'mongoose';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/conversations')
export class ConversationController {
  constructor(
    @InjectSequelizeModel(Conversation) private conversationModel: typeof Conversation,
    @InjectMongooseModel(Message.name) private messageModel: Model<Message>,
  ) {}

  @Patch(':conversationId/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(
    @Param('conversationId') conversationId: string,
    @Request() req,
  ) {
    const user = req.user;
    const conversation = await this.conversationModel.findByPk(conversationId);
    
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (user.role === 'visitor' && conversation.visitor_uuid !== user.id) {
      throw new ForbiddenException('Forbidden: You are not the owner');
    }

    // Determine whose messages to mark as read
    // If I am agent, I read 'visitor' messages.
    // If I am visitor, I read 'agent' messages.
    const senderRoleToRead = user.role === 'agent' ? 'visitor' : 'agent';

    await this.messageModel.updateMany(
      {
        conversationId: parseInt(conversationId, 10),
        'sender.role': senderRoleToRead,
        read: false
      },
      {
        $set: { read: true }
      }
    );

    return { success: true };
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyConversations(@Request() req) {
    const user = req.user;
    
    let whereClause: any = {};
    if (user.role === 'agent') {
      // Allow agents to see all conversations to support 'Unassigned' and 'All' tabs
      // Frontend will handle filtering
    } else if (user.role === 'visitor') {
      whereClause.visitor_uuid = user.id;
    }

    const conversations = await this.conversationModel.findAll({
      where: whereClause,
      order: [['updatedAt', 'DESC']],
    });

    // Enrich with unread count
    const enrichedConversations = await Promise.all(conversations.map(async (conv) => {
      const plainConv = conv.get({ plain: true });
      
      const countQuery: any = {
        conversationId: plainConv.id,
        read: false
      };

      if (user.role === 'agent') {
        countQuery['sender.role'] = 'visitor';
      } else {
        countQuery['sender.role'] = 'agent';
      }

      const unreadCount = await this.messageModel.countDocuments(countQuery);
      return { ...plainConv, unreadCount };
    }));

    return {
      success: true,
      data: enrichedConversations,
    };
  }

  @Get(':conversationId/messages')
  @UseGuards(JwtAuthGuard)
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Query('limit') limit: string,
    @Query('beforeId') beforeId: string,
    @Request() req,
  ) {
    const user = req.user;
    const limitNum = parseInt(limit || '20', 10);

    const conversation = await this.conversationModel.findByPk(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (user.role === 'visitor' && conversation.visitor_uuid !== user.id) {
      throw new ForbiddenException('Forbidden: You are not the owner');
    }

    const query: any = { conversationId: parseInt(conversationId, 10) };
    if (beforeId) {
      query._id = { $lt: beforeId };
    }

    const messages = await this.messageModel.find(query)
      .sort({ _id: -1 })
      .limit(limitNum);

    return {
      success: true,
      data: messages.reverse(),
    };
  }
}
