import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, CreateBucketCommand, HeadBucketCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService implements OnModuleInit {
  private s3Client: S3Client | null = null;
  private bucketName: string;
  private uploadDir: string;
  private useMinio: boolean = false;
  private readonly logger = new Logger(StorageService.name);

  constructor(private configService: ConfigService) {
    // 1. Configure Local Storage Path (Fallback)
    this.uploadDir = path.join(__dirname, '..', '..', 'uploads');
    if (!path.isAbsolute(this.uploadDir)) {
         this.uploadDir = path.join(process.cwd(), 'apps', 'api', 'uploads');
    }

    // 2. Configure MinIO/S3
    const minioEndpoint = this.configService.get<string>('MINIO_ENDPOINT');
    const minioAccessKey = this.configService.get<string>('MINIO_ACCESS_KEY');
    const minioSecretKey = this.configService.get<string>('MINIO_SECRET_KEY');
    
    // Enable MinIO if configuration is present
    if (minioEndpoint && minioAccessKey && minioSecretKey) {
        this.useMinio = true;
        this.bucketName = this.configService.get<string>('MINIO_BUCKET', 'kefu-files');
        const minioPort = this.configService.get<number>('MINIO_PORT', 9000);
        const useSSL = this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true';
        const protocol = useSSL ? 'https' : 'http';

        this.s3Client = new S3Client({
            region: 'us-east-1', // MinIO requires a region, but ignores it
            endpoint: `${protocol}://${minioEndpoint}:${minioPort}`,
            credentials: {
                accessKeyId: minioAccessKey,
                secretAccessKey: minioSecretKey,
            },
            forcePathStyle: true,
        });
        this.logger.log(`StorageService configured to use MinIO at ${minioEndpoint}:${minioPort}`);
    } else {
        this.logger.log('StorageService configured to use Local Storage (MinIO config missing)');
    }
  }

  async onModuleInit() {
    if (this.useMinio && this.s3Client) {
        await this.ensureBucketExists();
    } else {
        this.ensureUploadDirExists();
    }
  }

  private ensureUploadDirExists() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      this.logger.log(`Created local upload directory: ${this.uploadDir}`);
    }
  }

  private async ensureBucketExists() {
    if (!this.s3Client) return;
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      this.logger.log(`Bucket ${this.bucketName} exists`);
    } catch (error) {
      try {
        await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucketName }));
        this.logger.log(`Bucket ${this.bucketName} created successfully`);
      } catch (createError) {
        this.logger.error(`Failed to create bucket ${this.bucketName}`, createError);
      }
    }
    
    // Always try to set the policy to ensure it's public
    await this.setBucketPolicy();
  }

  private async setBucketPolicy() {
      if (!this.s3Client) return;
      
      const policy = {
          Version: '2012-10-17',
          Statement: [
              {
                  Sid: 'PublicRead',
                  Effect: 'Allow',
                  Principal: '*',
                  Action: ['s3:GetObject'],
                  Resource: [`arn:aws:s3:::${this.bucketName}/*`],
              },
          ],
      };

      try {
          await this.s3Client.send(new PutBucketPolicyCommand({
              Bucket: this.bucketName,
              Policy: JSON.stringify(policy),
          }));
          this.logger.log(`Bucket policy set to public read for ${this.bucketName}`);
      } catch (error) {
           this.logger.error(`Failed to set bucket policy for ${this.bucketName}`, error);
      }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const extension = file.originalname.split('.').pop() || 'bin';
    const filename = `${uuidv4()}.${extension}`;

    if (this.useMinio && this.s3Client) {
        return this.uploadToMinio(file, filename, file.mimetype);
    } else {
        return this.uploadToLocal(file, filename);
    }
  }

  private async uploadToLocal(file: Express.Multer.File, filename: string): Promise<string> {
    const filepath = path.join(this.uploadDir, filename);
    try {
        fs.writeFileSync(filepath, file.buffer);
        return `/uploads/${filename}`;
    } catch (error) {
        this.logger.error('File write failed:', error);
        throw error;
    }
  }

  private async uploadToMinio(file: Express.Multer.File, filename: string, mimetype: string): Promise<string> {
    const key = `uploads/${filename}`;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: mimetype,
    });

    try {
        await this.s3Client!.send(command);
        
        // Construct public URL
        const endpoint = this.configService.get<string>('MINIO_ENDPOINT');
        const port = this.configService.get<number>('MINIO_PORT', 9000);
        const useSSL = this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true';
        const protocol = useSSL ? 'https' : 'http';
        
        // Return absolute URL for MinIO
        return `${protocol}://${endpoint}:${port}/${this.bucketName}/${key}`;
    } catch (error) {
        this.logger.error('MinIO upload failed:', error);
        throw error;
    }
  }

  async getPresignedUrl(fileType: string) {
     if (this.useMinio && this.s3Client) {
        const extension = fileType.split('/')[1] || 'bin';
        const key = `uploads/${uuidv4()}.${extension}`;
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            ContentType: fileType,
        });

        const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 300 });
        
        const endpoint = this.configService.get<string>('MINIO_ENDPOINT');
        const port = this.configService.get<number>('MINIO_PORT', 9000);
        const useSSL = this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true';
        const protocol = useSSL ? 'https' : 'http';

        const publicUrl = `${protocol}://${endpoint}:${port}/${this.bucketName}/${key}`;
        return { uploadUrl, publicUrl };
     }
     
     throw new Error('Presigned URLs not supported in local storage mode');
  }
}
