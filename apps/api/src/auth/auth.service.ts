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
      role: agent.role
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

  async forgotPassword(email: string) {
    const agent = await this.agentService.findOneByEmail(email);
    if (!agent) {
        // For security, don't reveal if email exists, but for now we just return success
        return { success: true, message: 'If email exists, reset link sent.' };
    }

    const payload = { id: agent.id, type: 'reset' };
    const token = this.jwtService.sign(payload, { expiresIn: '1h' });
    
    // MOCK EMAIL SENDING
    console.log(`[MOCK EMAIL] Reset Password Link for ${email}: http://localhost:5173/reset-password?token=${token}`);

    return { success: true, message: 'Reset link sent' };
  }

  async resetPassword(token: string, newPass: string) {
      try {
          const payload = this.jwtService.verify(token);
          if (payload.type !== 'reset') {
              throw new UnauthorizedException('Invalid token type');
          }
          
          const hashedPassword = await bcrypt.hash(newPass, 10);
          await this.agentService.update(payload.id, { password: hashedPassword });
          
          return { success: true, message: 'Password updated successfully' };
      } catch (e) {
          console.error('Reset Password Error:', e);
          throw new UnauthorizedException('Invalid or expired token');
      }
  }

  async validateGoogleUser(details: { email: string; firstName: string; lastName: string; picture: string }) {
    const agent = await this.agentService.findOneByEmail(details.email);
    if (agent) {
      return agent;
    }
    
    // Create new agent
    const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newAgent = await this.agentService.create({
      email: details.email,
      nickname: `${details.firstName} ${details.lastName}`.trim() || details.email.split('@')[0],
      password: hashedPassword,
      avatar: details.picture,
      role: 'agent'
    });
    
    return newAgent;
  }
}
