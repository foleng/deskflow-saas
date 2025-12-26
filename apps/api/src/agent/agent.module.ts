import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Agent } from './agent.model';
import { AgentService } from './agent.service';

@Module({
  imports: [SequelizeModule.forFeature([Agent])],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
