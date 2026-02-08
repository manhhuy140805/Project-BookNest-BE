import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as Handlebars from 'handlebars';

@Injectable()
export class ResendService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  private compileTemplate(templateName: string, context: any): string {
    const templatePath = join(
      process.cwd(),
      'dist',
      'modules',
      'email',
      'templates',
      `${templateName}.hbs`,
    );
    const templateContent = readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(templateContent);
    return template(context);
  }

  async sendVerificationEmail(to: string, token: string, name: string) {
    try {
      const verificationUrl = `${process.env.APP_URL}/auth/verify-email?token=${token}`;
      const html = this.compileTemplate('verification', {
        fullName: name,
        verificationUrl,
        year: new Date().getFullYear(),
        timestamp: Date.now(),
      });

      const result = await this.resend.emails.send({
        from: process.env.MAIL_FROM || 'BookNest <onboarding@resend.dev>',
        to,
        subject: 'Xác thực email của bạn',
        html,
      });

      return result;
    } catch (error) {
      console.error('❌ Resend error details:', {
        message: error.message,
        statusCode: error.statusCode,
        name: error.name,
        to,
      });
      throw error;
    }
  }

  async sendWelcomeEmail(to: string, name: string) {
    try {
      const html = this.compileTemplate('welcome', {
        fullName: name,
        year: new Date().getFullYear(),
        timestamp: Date.now(),
      });

      const result = await this.resend.emails.send({
        from: process.env.MAIL_FROM || 'BookNest <onboarding@resend.dev>',
        to,
        subject: 'Chào mừng đến với BookNest!',
        html,
      });

      return result;
    } catch (error) {
      console.error('❌ Welcome email error:', error.message);
      throw error;
    }
  }

  async sendPasswordResetEmail(to: string, token: string, name: string) {
    try {
      const resetUrl = `${process.env.APP_URL}/auth/reset-password?token=${token}`;
      const html = this.compileTemplate('reset-password', {
        fullName: name,
        resetUrl,
        year: new Date().getFullYear(),
        timestamp: Date.now(),
      });

      const result = await this.resend.emails.send({
        from: process.env.MAIL_FROM || 'BookNest <onboarding@resend.dev>',
        to,
        subject: 'Đặt lại mật khẩu',
        html,
      });

      return result;
    } catch (error) {
      console.error('❌ Reset password email error:', error.message);
      throw error;
    }
  }
}
