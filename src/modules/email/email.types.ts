/**
 * Email service types and interfaces
 */

export interface EmailResult {
  id?: string;
  verificationUrl?: string;
  resetUrl?: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface TemplateContext {
  fullName: string;
  year: number;
  timestamp: number;
  [key: string]: any;
}

export enum EmailType {
  VERIFICATION = 'VERIFICATION EMAIL',
  PASSWORD_RESET = 'PASSWORD RESET EMAIL',
  WELCOME = 'WELCOME EMAIL',
}
