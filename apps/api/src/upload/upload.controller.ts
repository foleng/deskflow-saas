import { Controller, Post, Body, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

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
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      }
    })
  }))
  async uploadFile(@UploadedFile() file: any) {
    // Return relative URL which will be served by ServeStaticModule
    // The frontend should prepend the API base URL if needed, or we return absolute if we know the host
    // For now, returning relative path /uploads/filename
    return { url: `/uploads/${file.filename}` };
  }
}
