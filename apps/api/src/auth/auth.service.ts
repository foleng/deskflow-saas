import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AgentService } from '../agent/agent.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private agentService: AgentService,
    private jwtService: JwtService,
  ) {}

  async validateAgent(email: string, pass: string): Promise<any> {
    const agent = await this.agentService.findOneByEmail(email);
    if (agent && (await bcrypt.compare(pass, agent.password))) {
      const { password, ...result } = agent.toJSON();
      return result;
    }
    return null;
  }

  async loginAgent(user: any) {
    const payload = { id: user.id, role: 'agent', nickname: user.nickname };
    return {
      success: true,
      token: this.jwtService.sign(payload),
      agent: { id: user.id, nickname: user.nickname, email: user.email },
    };
  }

  async registerAgent(body: any) {
    const hashedPassword = await bcrypt.hash(body.password, 10);
    const agent = await this.agentService.create({
      ...body,
      password: hashedPassword,
    });
    return { success: true, agentId: agent.id };
  }

  async getAgentProfile(id: number) {
    const agent = await this.agentService.findOne(id);
    if (!agent) return null;
    return {
      id: agent.id,
      nickname: agent.nickname,
      email: agent.email,
      role: 'agent'
    };
  }
  
  async visitorInit(uuid: string) {
     const payload = { id: uuid, role: 'visitor' };
     return {
         success: true,
         token: this.jwtService.sign(payload, { expiresIn: '7d' })
     };
  }

  async updateAgentProfile(id: number, body: any) {
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }
    await this.agentService.update(id, body);
    const updated = await this.agentService.findOne(id);
    return {
      success: true,
      agent: {
        id: updated.id,
        nickname: updated.nickname,
        email: updated.email,
        role: 'agent'
      }
    };
  }
}
