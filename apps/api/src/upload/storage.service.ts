import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucketName = 'kefu-files';

  constructor() {
    this.s3Client = new S3Client({
      region: 'us-east-1',
      endpoint: 'http://127.0.0.1:9000',
      credentials: {
        accessKeyId: 'admin',
        secretAccessKey: 'password123',
      },
      forcePathStyle: true,
    });
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
    const publicUrl = `http://localhost:9000/${this.bucketName}/${key}`;

    return { uploadUrl, publicUrl };
  }
}
