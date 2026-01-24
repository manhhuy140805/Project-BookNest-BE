import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  // Cover Image
  @IsOptional()
  @IsString()
  coverUrl?: string;

  @IsOptional()
  @IsString()
  coverCloudinaryId?: string;

  // PDF File
  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @IsOptional()
  @IsString()
  pdfFileId?: string;

  @IsOptional()
  @IsString()
  pdfFileName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pdfSize?: number;
}

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  author?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  // Cover Image
  @IsOptional()
  @IsString()
  coverUrl?: string;

  @IsOptional()
  @IsString()
  coverCloudinaryId?: string;

  // PDF File
  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @IsOptional()
  @IsString()
  pdfFileId?: string;

  @IsOptional()
  @IsString()
  pdfFileName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pdfSize?: number;
}
