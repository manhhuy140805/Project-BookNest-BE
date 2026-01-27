import { Module } from '@nestjs/common';
import { UploadService } from './cloudinary.service';
import { UploadController } from './cloudinary.controller';

@Module({
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class CloudinaryModule {}
