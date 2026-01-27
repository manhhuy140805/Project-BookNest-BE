import { Injectable } from '@nestjs/common';
import cloudinary from 'src/common/config/cloudinary.config';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class UploadService {
  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(new Error(error.message));
          if (!result) return reject(new Error('Upload failed'));
          resolve(result);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async deleteImage(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId);
  }
}
