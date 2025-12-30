import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Knowledge } from './knowledge.model';

@Injectable()
export class KnowledgeService {
  constructor(
    @InjectModel(Knowledge)
    private knowledgeModel: typeof Knowledge,
  ) {}

  async findAll(query: any = {}) {
    const where: any = {};
    if (query.status) {
      where.status = query.status;
    }
    if (query.category) {
      where.category = query.category;
    }
    
    return this.knowledgeModel.findAll({
      where,
      order: [['updatedAt', 'DESC']],
    });
  }

  async findOne(id: number) {
    return this.knowledgeModel.findByPk(id);
  }

  async create(data: any) {
    return this.knowledgeModel.create(data);
  }

  async update(id: number, data: any) {
    const knowledge = await this.knowledgeModel.findByPk(id);
    if (knowledge) {
      return knowledge.update(data);
    }
    return null;
  }

  async remove(id: number) {
    const knowledge = await this.knowledgeModel.findByPk(id);
    if (knowledge) {
      return knowledge.destroy();
    }
  }
}
