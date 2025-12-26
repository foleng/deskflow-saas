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

  async findAll(): Promise<Agent[]> {
    return this.agentModel.findAll({
      attributes: { exclude: ['password'] }
    });
  }

  async findOneByEmail(email: string): Promise<Agent> {
    return this.agentModel.findOne({ where: { email } });
  }

  async findOne(id: number): Promise<Agent> {
    return this.agentModel.findByPk(id);
  }

  async update(id: number, data: Partial<Agent>) {
    const [numberOfAffectedRows] = await this.agentModel.update(data, {
      where: { id },
    });
    return { numberOfAffectedRows };
  }
}
