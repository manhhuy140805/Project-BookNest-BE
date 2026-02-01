import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthRegisterDto,
  AuthLoginDto,
  VerifyEmailDto,
  ResendVerificationDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto';
import 'dotenv/config';
import { IsCache, IsPublic, UserData, Roles, Role, RateLimit } from 'src/common/decorator';
import type { User } from 'src/generated/prisma/client';
import { CleanupService } from './cleanup.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cleanupService: CleanupService,
  ) {}

  @Post('register')
  @IsPublic()
  @RateLimit({ max: 3, windowMs: 60000 }) // 3 đăng ký/phút
  register(@Body() authDto: AuthRegisterDto) {
    return this.authService.register(authDto);
  }

  @Post('login')
  @IsPublic()
  @RateLimit({ max: 5, windowMs: 60000 }) // 5 login attempts/phút
  login(@Body() authDto: AuthLoginDto) {
    return this.authService.login(authDto);
  }

  @Get('me')
  @IsCache('auth:me', 3600)
  getMe(@UserData() user: User) {
    return this.authService.getMe(user);
  }

  @Post('change-password')
  @RateLimit({ max: 5, windowMs: 60000 }) // 5 thay đổi/phút
  changePassword(@UserData() user: User, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(
      user,
      dto.currentPassword,
      dto.newPassword,
      dto.confirmPassword,
    );
  }

  @Get('verify-email')
  @IsPublic()
  @RateLimit({ max: 10, windowMs: 60000 }) // 10 xác thực/phút
  verifyEmail(@Query() query: VerifyEmailDto) {
    return this.authService.verifyEmail(query.token);
  }

  @Post('resend-verification')
  @IsPublic()
  @RateLimit({ max: 3, windowMs: 300000 }) // 3 gửi lại/5 phút
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerificationEmail(dto.email);
  }

  @Post('forgot-password')
  @IsPublic()
  @RateLimit({ max: 3, windowMs: 300000 }) // 3 yêu cầu/5 phút
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @IsPublic()
  @RateLimit({ max: 5, windowMs: 60000 }) // 5 reset/phút
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword, dto.confirmPassword);
  }

  @Post('cleanup-unverified')
  @Roles(Role.ADMIN)
  async cleanupUnverifiedUsers() {
    return this.cleanupService.manualCleanup();
  }
}
