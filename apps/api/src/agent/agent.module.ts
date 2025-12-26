import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Agent } from './agent.model';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { CaslModule } from '../casl/casl.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Agent]),
    CaslModule
  ],
  controllers: [AgentController],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
