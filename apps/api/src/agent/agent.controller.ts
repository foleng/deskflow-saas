import { Controller, Get, Put, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AgentService } from './agent.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PoliciesGuard } from '../casl/policies.guard';
import { CheckPolicies, Action } from '../casl/check-policies.decorator';
import { AppAbility } from '../casl/casl-ability.factory';
import { Agent } from './agent.model';

@Controller('api/agents')
export class AgentController {
  constructor(private agentService: AgentService) {}

  @Get()
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Agent))
  async findAll() {
    return this.agentService.findAll();
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Agent))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAgentDto: Partial<Agent>,
  ) {
    return this.agentService.update(id, updateAgentDto);
  }
}
