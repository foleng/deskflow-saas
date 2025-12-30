import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Conversation } from '../conversation/conversation.model';
import { Agent } from '../agent/agent.model';
import { RedisModule } from '../common/redis/redis.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Conversation, Agent]),
    RedisModule,
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
