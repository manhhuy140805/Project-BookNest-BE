import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreateRatingDto {
  @IsNumber()
  bookId: number;

  @IsNumber()
  @Min(1, { message: 'Score must be at least 1' })
  @Max(5, { message: 'Score must be at most 5' })
  score: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class UpdateRatingDto {
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Score must be at least 1' })
  @Max(5, { message: 'Score must be at most 5' })
  score?: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
