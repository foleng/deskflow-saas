import { Controller, Get, Param, Query, UseGuards, Request, ForbiddenException, NotFoundException } from '@nestjs/common';
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
