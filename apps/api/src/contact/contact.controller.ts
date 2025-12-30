import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Res, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ContactService } from './contact.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/contacts')
@UseGuards(JwtAuthGuard)
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get('template')
  async downloadTemplate(@Res() res: Response) {
    const csvContent = 'Name,Email,Phone,Company,Tags\nJohn Doe,john@example.com,1234567890,Acme Inc,"VIP, Customer"';
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=contact_template.csv');
    res.send(csvContent);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importContacts(@UploadedFile() file: Express.Multer.File) {
    const count = await this.contactService.importContacts(file);
    return {
      success: true,
      message: `Successfully imported ${count} contacts`,
      count,
    };
  }

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
