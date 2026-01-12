import { SetMetadata } from '@nestjs/common';

/**
 * Options cho Rate Limiting
 *
 * - max: Số request tối đa được phép
 * - windowMs: Khoảng thời gian tính bằng millisecond
 *
 * Ví dụ: { max: 3, windowMs: 60000 }
 * = Cho phép 3 requests trong 60 giây
 */
export interface RateLimitOptions {
  max: number; // Số request tối đa
  windowMs: number; // Khoảng thời gian (millisecond)
}

// Tên key để lưu metadata
export const RATE_LIMIT_KEY = 'rateLimit';

/**
 * Decorator để giới hạn số lần request đến endpoint
 *
 * Dùng để bảo vệ các endpoint nhạy cảm:
 * - Login (brute force attack)
 * - Send OTP/Email (spam)
 * - File upload (DOS attack)
 * - API key generation
 *
 * Ví dụ:
 * @Post('login')
 * @RateLimit({ max: 5, windowMs: 60000 })  // 5 requests per minute
 * login(@Body() authDto: AuthDto) {
 *   return this.authService.login(authDto);
 * }
 *
 * @Post('send-otp')
 * @RateLimit({ max: 3, windowMs: 300000 })  // 3 requests per 5 minutes
 * sendOtp(@Body() body: SendOtpDto) {
 *   return this.authService.sendOtp(body);
 * }
 *
 * Cách hoạt động:
 * 1. Decorator gắn rate limit options vào metadata
 * 2. RateLimitInterceptor đọc metadata
 * 3. Kiểm tra số request từ IP/User trong timeframe
 * 4. Nếu vượt limit, return 429 Too Many Requests
 * 5. Nếu trong giới hạn, cho request đi tiếp
 */
export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);
