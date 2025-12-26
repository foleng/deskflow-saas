import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Conversation } from './conversation.model';
import { ConversationController } from './conversation.controller';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [SequelizeModule.forFeature([Conversation]), MessageModule],
  controllers: [ConversationController],
  exports: [SequelizeModule],
})
export class ConversationModule {}
