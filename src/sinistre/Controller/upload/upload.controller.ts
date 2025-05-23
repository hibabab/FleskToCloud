import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';
dotenv.config();

@Controller('upload')
export class UploadController {
  private s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<any> {
    const bucketName = process.env.AWS_BUCKET_NAME!;
    const key = `${Date.now()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3.send(command);

    return {
      message: 'Fichier uploadé avec succès',
      url: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    };
  }
}
