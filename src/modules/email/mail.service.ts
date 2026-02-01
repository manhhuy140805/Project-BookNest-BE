import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  /**
   * Gửi email xác thực tài khoản
   * @param email - Email người nhận
   * @param fullName - Tên đầy đủ của người dùng
   * @param verificationToken - Token xác thực
   */
  async sendVerificationEmail(
    email: string,
    fullName: string,
    verificationToken: string,
  ): Promise<void> {
    const verificationUrl = `${process.env.APP_URL}/auth/verify-email?token=${verificationToken}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Xác thực tài khoản BookNest của bạn',
      template: './verification', // tên file template (không cần .hbs)
      context: {
        fullName,
        verificationUrl,
        url: process.env.APP_URL,
        year: new Date().getFullYear(),
        timestamp: new Date().getTime(), // Thêm timestamp để tránh Gmail clipping
      },
    });
  }

  /**
   * Gửi email reset mật khẩu
   * @param email - Email người nhận
   * @param fullName - Tên đầy đủ của người dùng
   * @param resetToken - Token reset password
   */
  async sendPasswordResetEmail(
    email: string,
    fullName: string,
    resetToken: string,
  ): Promise<void> {
    const resetUrl = `${process.env.APP_URL}/auth/reset-password?token=${resetToken}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Đặt lại mật khẩu BookNest',
      template: './reset-password',
      context: {
        fullName,
        resetUrl,
        url: process.env.APP_URL,
        year: new Date().getFullYear(),
        timestamp: new Date().getTime(), // Thêm timestamp
      },
    });
  }

  /**
   * Gửi email chào mừng sau khi xác thực thành công
   * @param email - Email người nhận
   * @param fullName - Tên đầy đủ của người dùng
   */
  async sendWelcomeEmail(email: string, fullName: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Chào mừng bạn đến với BookNest!',
      template: './welcome',
      context: {
        fullName,
        loginUrl: `${process.env.APP_URL}/auth/login`,
        url: process.env.APP_URL,
        year: new Date().getFullYear(),
        timestamp: new Date().getTime(), // Thêm timestamp
      },
    });
  }
}
