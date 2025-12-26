import { Controller, Get, UseGuards } from '@nestjs/common';
import { AgentService } from './agent.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/agents')
export class AgentController {
  constructor(private agentService: AgentService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.agentService.findAll();
  }
}
