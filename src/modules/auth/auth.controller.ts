import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
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
import {
  IsCache,
  IsPublic,
  UserData,
  Roles,
  Role,
  RateLimit,
} from 'src/common/decorator';
import type { User } from 'src/generated/prisma/client';
import { CleanupService } from './cleanup.service';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';

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
    return this.authService.resetPassword(
      dto.token,
      dto.newPassword,
      dto.confirmPassword,
    );
  }

  @Post('cleanup-unverified')
  @Roles(Role.ADMIN)
  async cleanupUnverifiedUsers() {
    return this.cleanupService.manualCleanup();
  }

  @Get('google')
  @IsPublic()
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @IsPublic()
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    const user = req.user;
    const token = await this.authService.signToken(user.id, user.email);

    if (process.env.FRONTEND_URL) {
      res.redirect(
        `${process.env.FRONTEND_URL}/auth/callback?token=${token.access_token}`,
      );
    } else {
      res.json({
        message: 'Google login successful',
        access_token: token.access_token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
        },
      });
    }
  }

  @Post('google/token')
  @IsPublic()
  async googleTokenAuth(
    @Body()
    body: {
      googleId: string;
      email: string;
      fullName: string;
      avatarUrl?: string;
    },
  ) {
    const user = await this.authService.validateGoogleUser(body);
    return this.authService.signToken(user.id, user.email);
  }
}
