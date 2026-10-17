import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { Uploader, UploadParams } from '@/domain/forum/application/storage/uploader'
import { EnvService } from '../env/env.service'

// Funciona com Backblaze B2 e Cloudflare R2 (ambos S3-compatíveis).
@Injectable()
export class S3Storage implements Uploader {
  private client: S3Client

  constructor(private env: EnvService) {
    this.client = new S3Client({
      endpoint: env.get('STORAGE_ENDPOINT'),
      region: env.get('STORAGE_REGION'),
      credentials: {
        accessKeyId: env.get('STORAGE_ACCESS_KEY_ID'),
        secretAccessKey: env.get('STORAGE_SECRET_ACCESS_KEY'),
      },
    })
  }

  async upload({ fileName, fileType, body }: UploadParams) {
    const uniqueFileName = `${randomUUID()}-${fileName}`

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.env.get('STORAGE_BUCKET'),
        Key: uniqueFileName,
        ContentType: fileType,
        Body: body,
      }),
    )

    return { url: uniqueFileName }
  }
}
