import { Module } from '@nestjs/common'
import { Uploader } from '@/domain/forum/application/storage/uploader'
import { S3Storage } from './s3-storage'

@Module({
  providers: [{ provide: Uploader, useClass: S3Storage }],
  exports: [Uploader],
})
export class StorageModule {}
