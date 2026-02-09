import { Injectable, Logger } from '@nestjs/common';
import { ResendService } from './resend.service';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly resendService: ResendService) {}

  /**
   * Gửi email xác thực tài khoản
   */
  async sendVerificationEmail(
    email: string,
    fullName: string,
    verificationToken: string,
  ) {
    try {
      return await this.resendService.sendVerificationEmail(
        email,
        verificationToken,
        fullName,
      );
    } catch (error) {
      this.logger.error('Lỗi khi gửi email xác thực', error.stack);
      throw error;
    }
  }

  /**
   * Gửi email reset mật khẩu
   */
  async sendPasswordResetEmail(
    email: string,
    fullName: string,
    resetToken: string,
  ) {
    try {
      return await this.resendService.sendPasswordResetEmail(
        email,
        resetToken,
        fullName,
      );
    } catch (error) {
      this.logger.error('Lỗi khi gửi email reset password', error.stack);
      throw error;
    }
  }

  /**
   * Gửi email chào mừng sau khi xác thực thành công
   */
  async sendWelcomeEmail(email: string, fullName: string): Promise<void> {
    try {
      await this.resendService.sendWelcomeEmail(email, fullName);
    } catch (error) {
      this.logger.error('Lỗi khi gửi email chào mừng', error.stack);
      // Don't throw - welcome email is not critical
    }
  }
}
