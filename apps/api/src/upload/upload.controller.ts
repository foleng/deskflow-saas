import { Controller, Post, Body, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { memoryStorage } from 'multer';

@Controller('api/upload')
export class UploadController {
  constructor(private storageService: StorageService) {}

  @Post('presign')
  @UseGuards(JwtAuthGuard)
  async getPresignedUrl(@Body('fileType') fileType: string) {
    return this.storageService.getPresignedUrl(fileType);
  }

  @Post('local')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage()
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const url = await this.storageService.uploadFile(file);
    return { url };
  }
}
