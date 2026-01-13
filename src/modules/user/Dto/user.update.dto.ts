import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserUpdate {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  avatarUrl: string;

  @IsString()
  bio: string;

  @IsString()
  dateOfBirth: string;

  @IsString()
  role: string;
}
