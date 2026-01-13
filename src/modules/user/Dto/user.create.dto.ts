import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserCreate {
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
}
