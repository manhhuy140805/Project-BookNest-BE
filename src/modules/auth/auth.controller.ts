import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRegisterDto, AuthLoginDto } from './dto';
import 'dotenv/config';
import { IsPublic } from 'src/common/decorator';

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
}
