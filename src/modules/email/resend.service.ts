import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as Handlebars from 'handlebars';
import type { EmailResult, EmailOptions, TemplateContext } from './email.types';
import {
  EMAIL_CONFIG,
  EMAIL_SUBJECTS,
  EMAIL_TEMPLATES,
  DEMO_MESSAGES,
} from './email.constants';

@Injectable()
export class ResendService {
  private readonly resend: Resend;
  private readonly isDemoMode: boolean;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.isDemoMode = process.env.EMAIL_MODE === EMAIL_CONFIG.DEMO_MODE_ENV;
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

  private logDemoEmail(
    type: string,
    to: string,
    name: string,
    url: string,
  ): void {
    console.log('\n' + DEMO_MESSAGES.SEPARATOR);
    console.log(`🔗 [DEMO MODE] ${type}`);
    console.log('📧 To:', to);
    console.log('👤 Name:', name);
    console.log('🔑 Link:', url);
    console.log('✅ Click this link (no email needed in demo)');
    console.log(DEMO_MESSAGES.SEPARATOR + '\n');
  }

  private async sendEmail(
    options: EmailOptions,
    url?: string,
  ): Promise<EmailResult> {
    try {
      const result = await this.resend.emails.send({
        from: process.env.MAIL_FROM || EMAIL_CONFIG.DEFAULT_FROM,
        ...options,
      });

      // Extract email ID and combine with URL if provided
      const emailResult: EmailResult = {
        id: result.data?.id,
      };

      return url ? { ...emailResult, ...this.getUrlKey(url) } : emailResult;
    } catch (error) {
      console.error('❌ Email sending error:', {
        message: error.message,
        statusCode: error.statusCode,
        to: options.to,
      });

      // In demo mode, return URL even if email fails
      if (this.isDemoMode && url) {
        console.log(DEMO_MESSAGES.EMAIL_FAILED);
        return this.getUrlKey(url);
      }

      throw error;
    }
  }

  private getUrlKey(url: string): EmailResult {
    if (url.includes('verify-email')) {
      return { verificationUrl: url };
    }
    if (url.includes('reset-password')) {
      return { resetUrl: url };
    }
    return {};
  }

  private getTemplateContext(
    name: string,
    additionalContext: any = {},
  ): TemplateContext {
    return {
      fullName: name,
      year: new Date().getFullYear(),
      timestamp: Date.now(),
      ...additionalContext,
    };
  }

  async sendVerificationEmail(
    to: string,
    token: string,
    name: string,
  ): Promise<EmailResult> {
    const verificationUrl = `${process.env.APP_URL}/auth/verify-email?token=${token}`;

    if (this.isDemoMode) {
      this.logDemoEmail('VERIFICATION EMAIL', to, name, verificationUrl);
    }

    const html = this.compileTemplate(
      EMAIL_TEMPLATES.VERIFICATION,
      this.getTemplateContext(name, { verificationUrl }),
    );

    return this.sendEmail(
      { to, subject: EMAIL_SUBJECTS.VERIFICATION, html },
      verificationUrl,
    );
  }

  async sendWelcomeEmail(to: string, name: string): Promise<EmailResult> {
    const html = this.compileTemplate(
      EMAIL_TEMPLATES.WELCOME,
      this.getTemplateContext(name),
    );
    return this.sendEmail({ to, subject: EMAIL_SUBJECTS.WELCOME, html });
  }

  async sendPasswordResetEmail(
    to: string,
    token: string,
    name: string,
  ): Promise<EmailResult> {
    const resetUrl = `${process.env.APP_URL}/auth/reset-password?token=${token}`;

    if (this.isDemoMode) {
      this.logDemoEmail('PASSWORD RESET EMAIL', to, name, resetUrl);
    }

    const html = this.compileTemplate(
      EMAIL_TEMPLATES.PASSWORD_RESET,
      this.getTemplateContext(name, { resetUrl }),
    );

    return this.sendEmail(
      { to, subject: EMAIL_SUBJECTS.PASSWORD_RESET, html },
      resetUrl,
    );
  }
}
