import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Agent } from './agent.model';

@Injectable()
export class AgentService {
  constructor(
    @InjectModel(Agent)
    private agentModel: typeof Agent,
  ) {}

  async create(data: Partial<Agent>): Promise<Agent> {
    return this.agentModel.create(data);
  }

  async findOneByEmail(email: string): Promise<Agent> {
    return this.agentModel.findOne({ where: { email } });
  }

  async findById(id: number): Promise<Agent> {
    return this.agentModel.findByPk(id);
  }
}
