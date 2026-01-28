import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRegisterDto, AuthLoginDto } from './dto';
import 'dotenv/config';
import { IsCache, IsPublic, UserData } from 'src/common/decorator';
import type { User } from 'src/generated/prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @IsPublic()
  register(@Body() authDto: AuthRegisterDto) {
    return this.authService.register(authDto);
  }

  @Post('login')
  @IsPublic()
  login(@Body() authDto: AuthLoginDto) {
    return this.authService.login(authDto);
  }

  @Get('me')
  @IsCache('auth:me', 3600) // Cache 1 hour
  getMe(@UserData() user: User) {
    return this.authService.getMe(user);
  }
}
