import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService implements OnModuleInit {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('MINIO_BUCKET', 'kefu-files');
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT', '127.0.0.1');
    const port = this.configService.get<number>('MINIO_PORT', 9000);
    const useSSL = this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true';
    const protocol = useSSL ? 'https' : 'http';

    this.s3Client = new S3Client({
      region: 'us-east-1', // MinIO ignores this but SDK requires it
      endpoint: `${protocol}://${endpoint}:${port}`,
      credentials: {
        accessKeyId: this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
        secretAccessKey: this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin'),
      },
      forcePathStyle: true,
    });
  }

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
    } catch (error) {
      try {
        await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucketName }));
        console.log(`Bucket ${this.bucketName} created successfully`);
      } catch (createError) {
        console.error(`Failed to create bucket ${this.bucketName}`, createError);
      }
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const extension = file.originalname.split('.').pop() || 'bin';
    const key = `uploads/${uuidv4()}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    // Construct public URL
    // If MinIO is local, we need to return the URL that is accessible from the browser
    // Assuming the browser can access MinIO directly via the endpoint
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT', '127.0.0.1');
    const port = this.configService.get<number>('MINIO_PORT', 9000);
    const useSSL = this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true';
    const protocol = useSSL ? 'https' : 'http';
    
    // NOTE: In production, this might be a CDN or a different public domain
    return `${protocol}://${endpoint}:${port}/${this.bucketName}/${key}`;
  }

  async getPresignedUrl(fileType: string) {
    const extension = fileType.split('/')[1] || 'bin';
    const key = `uploads/${uuidv4()}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 300 });
    
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT', '127.0.0.1');
    const port = this.configService.get<number>('MINIO_PORT', 9000);
    const useSSL = this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true';
    const protocol = useSSL ? 'https' : 'http';

    const publicUrl = `${protocol}://${endpoint}:${port}/${this.bucketName}/${key}`;

    return { uploadUrl, publicUrl };
  }
}
