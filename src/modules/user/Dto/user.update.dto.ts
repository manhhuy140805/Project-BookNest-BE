import { IsNotEmpty, IsString } from 'class-validator';

export class UserUpdate {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  avatarUrl: string;

  @IsString()
  bio: string;

  @IsString()
  role: string;
}
