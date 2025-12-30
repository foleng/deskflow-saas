import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/reports')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('dashboard')
  async getReports(
    @Query('startDate') startDateString: string,
    @Query('endDate') endDateString: string,
  ) {
    const startDate = startDateString ? new Date(startDateString) : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = endDateString ? new Date(endDateString) : new Date();

    const [overview, volume, agents] = await Promise.all([
      this.reportService.getOverviewStats(startDate, endDate),
      this.reportService.getVolumeChart(startDate, endDate),
      this.reportService.getAgentPerformance(startDate, endDate),
    ]);

    return {
      success: true,
      data: {
        overview,
        volume,
        agents,
      },
    };
  }
}
