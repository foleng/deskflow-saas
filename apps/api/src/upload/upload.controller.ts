import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/upload')
export class UploadController {
  constructor(private storageService: StorageService) {}

  @Post('presign')
  @UseGuards(JwtAuthGuard)
  async getPresignedUrl(@Body('fileType') fileType: string) {
    return this.storageService.getPresignedUrl(fileType);
  }
}
