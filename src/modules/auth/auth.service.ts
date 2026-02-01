import { ForbiddenException, Injectable } from '@nestjs/common';
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

    const user = await this.prisma.user.create({
      data: {
        email: authDto.email,
        hashPassword: hashPassword,
        fullName: authDto.fullName,
        avatarUrl:
          'https://thumbs.dreamstime.com/b/d-icon-avatar-cute-smiling-woman-cartoon-hipster-character-people-close-up-portrait-isolated-transparent-png-background-352288997.jpg',
        isVerified: false,
        isActive: true,
        role: 'USER',
        verificationToken,
        verificationExpires,
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

    try {
      await this.mailService.sendVerificationEmail(
        user.email,
        user.fullName || 'Người dùng',
        verificationToken,
      );
    } catch (error) {
      console.error('Lỗi khi gửi email xác thực:', error);
    }

    return {
      ...user,
      message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
    };
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
      throw new ForbiddenException(
        'Mật khẩu mới không được giống mật khẩu cũ',
      );
    }

    if (newPassword !== confirmPassword) {
      throw new ForbiddenException('Mật khẩu mới và mật khẩu xác nhận không khớp');
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

    try {
      await this.mailService.sendVerificationEmail(
        user.email,
        user.fullName || 'Người dùng',
        verificationToken,
      );
    } catch (error) {
      console.error('Lỗi khi gửi email xác thực:', error);
      throw new ForbiddenException('Không thể gửi email xác thực');
    }

    return {
      message: 'Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư.',
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        message:
          'Email của bạn chưa được đăng ký.',
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

    try {
      await this.mailService.sendPasswordResetEmail(
        user.email,
        user.fullName || 'Người dùng',
        resetToken,
      );
    } catch (error) {
      console.error('Lỗi khi gửi email reset password:', error);
    }

    return {
      message:
        'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được email hướng dẫn reset mật khẩu.',
    };
  }

  async resetPassword(token: string, newPassword: string, confirmPassword: string ) {
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
      throw new ForbiddenException('Mật khẩu mới và mật khẩu xác nhận không khớp');
    }

    const sameAsOld = await bcrypt.compare(newPassword, user.hashPassword);
    if (sameAsOld) {
      throw new ForbiddenException(
        'Mật khẩu mới không được giống mật khẩu cũ',
      );
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

    return {
      message: 'Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập ngay.',
    };
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    });
    return {
      access_token: token,
    };
  }
}
