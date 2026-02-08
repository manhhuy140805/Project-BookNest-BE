import { Injectable } from '@nestjs/common';
import { ResendService } from './resend.service';

@Injectable()
export class MailService {
  constructor(private readonly resendService: ResendService) {}

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
    try {
      await this.resendService.sendVerificationEmail(
        email,
        verificationToken,
        fullName,
      );
    } catch (error) {
      console.error('Lỗi khi gửi email xác thực:', error);
      throw error;
    }
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
    try {
      await this.resendService.sendPasswordResetEmail(
        email,
        resetToken,
        fullName,
      );
    } catch (error) {
      console.error('Lỗi khi gửi email reset password:', error);
      throw error;
    }
  }

  /**
   * Gửi email chào mừng sau khi xác thực thành công
   * @param email - Email người nhận
   * @param fullName - Tên đầy đủ của người dùng
   */
  async sendWelcomeEmail(email: string, fullName: string): Promise<void> {
    try {
      await this.resendService.sendWelcomeEmail(email, fullName);
    } catch (error) {
      console.error('Lỗi khi gửi email chào mừng:', error);
      throw error;
    }
  }
}
