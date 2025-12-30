import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { Conversation } from '../conversation/conversation.model';
import { Agent } from '../agent/agent.model';

@Module({
  imports: [SequelizeModule.forFeature([Conversation, Agent])],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
