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
    // Kiểm tra email đã tồn tại
    const existingUser = await this.prisma.user.findUnique({
      where: { email: authDto.email },
    });
    
    if (existingUser) {
      throw new ForbiddenException('Email đã được sử dụng');
    }

    // Hash password
    const hashPassword = await bcrypt.hash(authDto.password, 10);
    
    // Tạo verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24); // Hết hạn sau 24 giờ

    // Tạo user mới
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
    console.log(user.id);

    // Gửi email xác thực
    try {
      await this.mailService.sendVerificationEmail(
        user.email,
        user.fullName || 'Người dùng',
        verificationToken,
      );
    } catch (error) {
      console.error('Lỗi khi gửi email xác thực:', error);
      // Không throw error để không làm gián đoạn quá trình đăng ký
      // User vẫn được tạo, có thể gửi lại email sau
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
    
    // ✅ KIỂM TRA EMAIL ĐÃ XÁC THỰC
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

  /**
   * Đổi mật khẩu (user đã đăng nhập)
   * @param userId - ID của user
   * @param currentPassword - Mật khẩu hiện tại
   * @param newPassword - Mật khẩu mới
   */
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    // Lấy thông tin user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ForbiddenException('Không tìm thấy người dùng');
    }

    // Kiểm tra mật khẩu hiện tại
    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.hashPassword,
    );

    if (!passwordMatches) {
      throw new ForbiddenException('Mật khẩu hiện tại không đúng');
    }

    // Kiểm tra mật khẩu mới không được giống mật khẩu cũ
    const sameAsOld = await bcrypt.compare(newPassword, user.hashPassword);
    if (sameAsOld) {
      throw new ForbiddenException(
        'Mật khẩu mới không được giống mật khẩu cũ',
      );
    }

    // Hash mật khẩu mới
    const hashPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashPassword },
    });

    return {
      message: 'Đổi mật khẩu thành công',
    };
  }

  /**
   * Xác thực email bằng token
   * @param token - Verification token
   */
  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationExpires: {
          gt: new Date(), // Token chưa hết hạn
        },
      },
    });

    if (!user) {
      throw new ForbiddenException(
        'Token xác thực không hợp lệ hoặc đã hết hạn',
      );
    }

    // Cập nhật trạng thái xác thực
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationExpires: null,
      },
    });

    // Gửi email chào mừng
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

  /**
   * Gửi lại email xác thực
   * @param email - Email của người dùng
   */
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

    // Tạo token mới
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    // Cập nhật token mới
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationExpires,
      },
    });

    // Gửi email
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

  /**
   * Yêu cầu reset mật khẩu - Gửi email với token
   * @param email - Email của người dùng
   */
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Không tiết lộ thông tin user có tồn tại hay không (bảo mật)
    if (!user) {
      return {
        message:
          'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được email hướng dẫn reset mật khẩu.',
      };
    }

    // Tạo reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // Token hết hạn sau 1 giờ

    // Lưu token vào database
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    // Gửi email reset password
    try {
      await this.mailService.sendPasswordResetEmail(
        user.email,
        user.fullName || 'Người dùng',
        resetToken,
      );
    } catch (error) {
      console.error('Lỗi khi gửi email reset password:', error);
      // Không throw error để không tiết lộ thông tin user
    }

    return {
      message:
        'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được email hướng dẫn reset mật khẩu.',
    };
  }

  /**
   * Reset mật khẩu bằng token
   * @param token - Reset password token
   * @param newPassword - Mật khẩu mới
   */
  async resetPassword(token: string, newPassword: string) {
    // Tìm user với token hợp lệ
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(), // Token chưa hết hạn
        },
      },
    });

    if (!user) {
      throw new ForbiddenException(
        'Token reset mật khẩu không hợp lệ hoặc đã hết hạn',
      );
    }

    // Hash mật khẩu mới
    const hashPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu và xóa token
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
