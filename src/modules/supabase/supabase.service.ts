import { Injectable, BadRequestException } from '@nestjs/common';
import { supabase } from '../../common/config/supabase.config';

@Injectable()
export class SupabaseService {
  private bucket = 'book';

  async upload(file: Express.Multer.File, folder: string = 'pdfs') {
    const sanitizedName = file.originalname
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-zA-Z0-9.-]/g, '_');

    const fileName = `${folder}/${Date.now()}_${sanitizedName}`;

    const { data, error } = await supabase.storage
      .from(this.bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      console.error('Supabase Upload Error:', JSON.stringify(error, null, 2));
      throw new BadRequestException(error.message);
    }

    const { data: urlData } = supabase.storage
      .from(this.bucket)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      url: urlData.publicUrl,
      size: file.size,
    };
  }

  async delete(path: string) {
    const { error } = await supabase.storage.from(this.bucket).remove([path]);
    if (error) {
      console.error('Supabase Delete Error:', JSON.stringify(error, null, 2));
      throw new BadRequestException(error.message);
    }
    return { message: 'File deleted successfully' };
  }
}
