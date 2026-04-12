import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthLoginDto, AuthRegisterDto } from './dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import type { User } from 'src/generated/prisma/client';
import { MailService } from '../email/mail.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(authDto: AuthRegisterDto) {
    const hashPassword = await bcrypt.hash(authDto.password, 10);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    // 🎯 DEMO MODE: Bypass verification if enabled
    const isVerified = process.env.DEMO_BYPASS_VERIFY === 'true';

    const user = await this.prisma.user.create({
      data: {
        email: authDto.email,
        hashPassword: hashPassword,
        fullName: authDto.fullName,
        avatarUrl:
          'https://thumbs.dreamstime.com/b/d-icon-avatar-cute-smiling-woman-cartoon-hipster-character-people-close-up-portrait-isolated-transparent-png-background-352288997.jpg',
        isVerified,
        isActive: true,
        role: 'USER',
        verificationToken: isVerified ? null : verificationToken,
        verificationExpires: isVerified ? null : verificationExpires,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isVerified: true,
        isActive: true,
      },
    });

    let verificationUrl: string | undefined;

    if (!isVerified) {
      try {
        const emailResult = await this.mailService.sendVerificationEmail(
          user.email,
          user.fullName || 'Người dùng',
          verificationToken,
        );

        // Get verification URL from email result (ResendService returns it)
        verificationUrl = (emailResult as any)?.verificationUrl;
      } catch (error) {
        console.error('Lỗi khi gửi email xác thực:', error);
      }
    }

    const response: any = {
      ...user,
      message: isVerified
        ? '🎯 [DEMO MODE] Đăng ký thành công! Tài khoản đã được tự động xác thực (DEMO_BYPASS_VERIFY=true)'
        : 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
    };

    // 🎯 DEMO MODE: Return verification URL in response
    if (process.env.EMAIL_MODE === 'demo' && verificationUrl) {
      response.verificationUrl = verificationUrl;
      response.demoMode = true;
      response.message +=
        ' \n🔗 [DEMO] Verification link included in response.';
    }

    return response;
  }

  async login(authDto: AuthLoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: authDto.email },
    });

    if (!user) {
      throw new ForbiddenException('Tài khoản hoặc mật khẩu không đúng');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Tài khoản đã bị vô hiệu hóa');
    }

    if (!user.isVerified) {
      throw new ForbiddenException(
        'Vui lòng xác thực email trước khi đăng nhập. Kiểm tra hộp thư của bạn.',
      );
    }

    const passwordMatches = await bcrypt.compare(
      authDto.password,
      user.hashPassword,
    );

    if (!passwordMatches) {
      throw new ForbiddenException('Tài khoản hoặc mật khẩu không đúng');
    }

    return this.signToken(user.id, user.email);
  }

  getMe(user: User) {
    return user;
  }

  async changePassword(
    user: User,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.hashPassword,
    );

    if (!passwordMatches) {
      throw new ForbiddenException('Mật khẩu hiện tại không đúng');
    }

    const sameAsOld = await bcrypt.compare(newPassword, user.hashPassword);
    if (sameAsOld) {
      throw new ForbiddenException('Mật khẩu mới không được giống mật khẩu cũ');
    }

    if (newPassword !== confirmPassword) {
      throw new ForbiddenException(
        'Mật khẩu mới và mật khẩu xác nhận không khớp',
      );
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { hashPassword },
    });

    return {
      message: 'Đổi mật khẩu thành công',
    };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new ForbiddenException(
        'Token xác thực không hợp lệ hoặc đã hết hạn',
      );
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationExpires: null,
      },
    });

    try {
      await this.mailService.sendWelcomeEmail(
        user.email,
        user.fullName || 'Người dùng',
      );
    } catch (error) {
      console.error('Lỗi khi gửi email chào mừng:', error);
    }

    return {
      message: 'Email đã được xác thực thành công! Bạn có thể đăng nhập ngay.',
      redirectUrl: `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/login`,
    };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ForbiddenException('Không tìm thấy tài khoản với email này');
    }

    if (user.isVerified) {
      throw new ForbiddenException('Email đã được xác thực rồi');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationExpires,
      },
    });

    let verificationUrl: string | undefined;

    try {
      const emailResult = await this.mailService.sendVerificationEmail(
        user.email,
        user.fullName || 'Người dùng',
        verificationToken,
      );

      // Get verification URL from email result
      verificationUrl = (emailResult as any)?.verificationUrl;
    } catch (error) {
      console.error('Lỗi khi gửi email xác thực:', error);
      throw new ForbiddenException('Không thể gửi email xác thực');
    }

    const response: any = {
      message: 'Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư.',
    };

    // 🎯 DEMO MODE: Return verification URL in response
    if (process.env.EMAIL_MODE === 'demo' && verificationUrl) {
      response.verificationUrl = verificationUrl;
      response.demoMode = true;
      response.message +=
        ' \n🔗 [DEMO] Verification link included in response.';
    }

    return response;
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        message:
          'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được email hướng dẫn reset mật khẩu.',
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    let resetUrl: string | undefined;
    let emailSentSuccessfully = false;

    try {
      const emailResult = await this.mailService.sendPasswordResetEmail(
        user.email,
        user.fullName || 'Người dùng',
        resetToken,
      );

      // Get reset URL from email result
      resetUrl = (emailResult as any)?.resetUrl;
      emailSentSuccessfully = true;
    } catch (error) {
      console.error('Lỗi khi gửi email reset password:', error);
      // 🎯 DEMO MODE: Still return resetUrl even if email fails
      if (process.env.EMAIL_MODE === 'demo') {
        resetUrl = `${process.env.APP_URL}/auth/reset-password?token=${resetToken}`;
      }
    }

    const response: any = {
      message:
        'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được email hướng dẫn reset mật khẩu.',
    };

    // 🎯 DEMO MODE: Return reset URL in response for testing
    if (process.env.EMAIL_MODE === 'demo' && resetUrl) {
      response.resetUrl = resetUrl;
      response.demoMode = true;
      response.message +=
        ' \n🔗 [DEMO] Reset password link included in response.';
      if (emailSentSuccessfully) {
        response.emailStatus = 'sent';
      } else {
        response.emailStatus = 'fallback';
        response.message +=
          ' (Email sending failed, but demo link is available)';
      }
    } else if (emailSentSuccessfully) {
      response.emailStatus = 'sent';
    }

    return response;
  }

  async resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new ForbiddenException(
        'Token reset mật khẩu không hợp lệ hoặc đã hết hạn',
      );
    }

    if (newPassword !== confirmPassword) {
      throw new ForbiddenException(
        'Mật khẩu mới và mật khẩu xác nhận không khớp',
      );
    }

    const sameAsOld = await bcrypt.compare(newPassword, user.hashPassword);
    if (sameAsOld) {
      throw new ForbiddenException('Mật khẩu mới không được giống mật khẩu cũ');
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        hashPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    // 🎯 DEMO MODE: Log successful password reset
    if (process.env.EMAIL_MODE === 'demo') {
      console.log('\n🔐 [DEMO MODE] Password Reset Successful');
      console.log('📧 User:', user.email);
      console.log('✅ Password has been reset. You can now login.');
      console.log('---\n');
    }

    return {
      message:
        'Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập ngay.',
      redirectUrl: `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/login`,
    };
  }

  async validateGoogleUser(googleData: {
    googleId: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
  }) {
    let user = await this.prisma.user.findUnique({
      where: { googleId: googleData.googleId },
    });

    if (!user) {
      user = await this.prisma.user.findUnique({
        where: { email: googleData.email },
      });

      if (user) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleData.googleId,
            googleEmail: googleData.email,
          },
        });
      } else {
        user = await this.prisma.user.create({
          data: {
            googleId: googleData.googleId,
            googleEmail: googleData.email,
            email: googleData.email,
            hashPassword: '',
            fullName: googleData.fullName,
            avatarUrl: googleData.avatarUrl,
            isVerified: true,
            isActive: true,
            role: 'USER',
          },
        });
      }
    }

    return user;
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const access_token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    });

    const refresh_token = await this.createRefreshToken(userId);

    return {
      access_token,
      refresh_token,
    };
  }

  async createRefreshToken(userId: number): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    return token;
  }

  async validateRefreshToken(refreshToken: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    if (tokenRecord.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
      throw new UnauthorizedException('Refresh token đã hết hạn');
    }

    if (!tokenRecord.user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
    }

    return tokenRecord.user;
  }

  async refreshAccessToken(refreshToken: string) {
    console.log('🔄 Refresh token request received');
    const user = await this.validateRefreshToken(refreshToken);
    console.log('✅ Refresh token validated for user:', user.id);

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const access_token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    });

    console.log('✅ New access token generated for user:', user.id);
    return { access_token };
  }

  async revokeRefreshToken(refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
    return { message: 'Đăng xuất thành công' };
  }

  async revokeAllRefreshTokens(userId: number) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
    return { message: 'Đã đăng xuất khỏi tất cả thiết bị' };
  }
}
