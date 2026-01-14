import { IsNotEmpty, IsString } from 'class-validator';

export class BookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsNotEmpty()
  categoryId: number;
}
