import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  async getDashboardStats() {
    return this.statsService.getDashboardStats();
  }

  @Get('tickets')
  async getRecentTickets() {
    return this.statsService.getRecentTickets();
  }

  @Get('agents')
  async getAgentsStatus() {
    return this.statsService.getAgentsStatus();
  }
}
