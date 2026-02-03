import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SearchQueryDto {
  @IsString()
  @IsNotEmpty()
  q: string;
}

export class SaveSearchDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsOptional()
  results?: number;
}
