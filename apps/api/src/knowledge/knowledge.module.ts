import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeService } from './knowledge.service';
import { Knowledge } from './knowledge.model';

@Module({
  imports: [SequelizeModule.forFeature([Knowledge])],
  controllers: [KnowledgeController],
  providers: [KnowledgeService],
  exports: [KnowledgeService],
})
export class KnowledgeModule {}
