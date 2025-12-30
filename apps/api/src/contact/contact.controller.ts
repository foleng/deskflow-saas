import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/contacts')
@UseGuards(JwtAuthGuard)
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  async findAll() {
    return {
      success: true,
      data: await this.contactService.findAll(),
    };
  }

  @Post()
  async create(@Body() body: any) {
    return {
      success: true,
      data: await this.contactService.create(body),
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return {
      success: true,
      data: await this.contactService.update(+id, body),
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
      await this.contactService.remove(+id);
      return { success: true };
  }
}
