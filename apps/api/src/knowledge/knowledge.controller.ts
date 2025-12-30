import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/knowledge')
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get()
  async findAll(@Query() query: any) {
    return {
      success: true,
      data: await this.knowledgeService.findAll(query),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return {
      success: true,
      data: await this.knowledgeService.findOne(+id),
    };
  }

  @Post()
  async create(@Body() body: any) {
    return {
      success: true,
      data: await this.knowledgeService.create(body),
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return {
      success: true,
      data: await this.knowledgeService.update(+id, body),
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
      await this.knowledgeService.remove(+id);
      return { success: true };
  }
}
