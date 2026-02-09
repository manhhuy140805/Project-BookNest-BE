/**
 * Email service constants
 */

export const EMAIL_CONFIG = {
  DEFAULT_FROM: 'BookNest <onboarding@resend.dev>',
  DEMO_MODE_ENV: 'demo',
} as const;

export const EMAIL_SUBJECTS = {
  VERIFICATION: 'Xác thực email của bạn',
  WELCOME: 'Chào mừng đến với BookNest!',
  PASSWORD_RESET: 'Đặt lại mật khẩu',
} as const;

export const EMAIL_TEMPLATES = {
  VERIFICATION: 'verification',
  WELCOME: 'welcome',
  PASSWORD_RESET: 'reset-password',
} as const;

export const DEMO_MESSAGES = {
  EMAIL_FAILED: '⚠️ [DEMO MODE] Email failed but returning URL',
  SEPARATOR: '='.repeat(80),
} as const;
