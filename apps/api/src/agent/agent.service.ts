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

  async findOne(id: number): Promise<Agent> {
    return this.agentModel.findByPk(id);
  }

  async update(id: number, data: Partial<Agent>) {
    const [numberOfAffectedRows, [updatedAgent]] = await this.agentModel.update(data, {
      where: { id },
      returning: true,
    });
    return { numberOfAffectedRows, updatedAgent };
  }
}
