import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class S3Service {
  private readonly region = 'eu-north-1';
  private readonly bucket = 'flesk-upload-bucket';

  private readonly s3 = new AWS.S3({
    region: this.region,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const fileKey = `${folder}/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;

    const params = {
      Bucket: this.bucket,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      // Retirez l'ACL si elle pose problème
      // ACL: 'public-read',
    };

    try {
      await this.s3.upload(params).promise();
      return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${fileKey}`;
    } catch (error) {
      console.error('S3 Upload Error:', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  // Méthode alternative avec URL pré-signée pour l'accès public
  getSignedUrl(key: string, expiresIn: number = 3600): string {
    const params = {
      Bucket: this.bucket,
      Key: key,
      Expires: expiresIn,
    };

    return this.s3.getSignedUrl('getObject', params);
  }
}
