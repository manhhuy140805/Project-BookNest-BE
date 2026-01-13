import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { RATE_LIMIT_KEY, RateLimitOptions } from 'src/common/decorator';

/**
 * RateLimitInterceptor - Giới hạn số lần request
 *
 * Dùng để:
 * - Bảo vệ chống brute force attack (login)
 * - Bảo vệ chống spam (send email, OTP)
 * - Bảo vệ chống DOS attack (file upload)
 * - Kiểm soát API usage
 *
 * Cách hoạt động:
 * 1. Kiểm tra decorator @RateLimit() có metadata không
 * 2. Nếu không có metadata, allow request
 * 3. Lấy IP address hoặc User ID từ request
 * 4. Kiểm tra có bao nhiêu request từ IP/User trong time window
 * 5. Nếu vượt quá limit, throw TooManyRequestsException (429)
 * 6. Nếu còn trong giới hạn, cho request đi
 * 7. Tự động xóa old requests sau khi hết time window
 *
 * Ví dụ sử dụng:
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
 * Lưu ý:
 * - Rate limiting lưu trong memory (restart sẽ reset)
 * - Production nên dùng Redis
 * - Identifier = IP address (nếu user chưa login) hoặc User ID
 * - windowMs = khoảng thời gian tính bằng milliseconds
 * - max = số request tối đa trong time window
 * - Headers trả về: Retry-After (khi exceed limit)
 */

// Interface để lưu request tracking
interface RequestRecord {
  timestamp: number;
}

interface RateLimitStore {
  [key: string]: RequestRecord[];
}

// In-memory storage để lưu request history
// Key: IP hoặc User ID, Value: Array of timestamps
const rateLimitStore: RateLimitStore = {};

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Lấy rate limit metadata từ @RateLimit() decorator
    const rateLimitOptions = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    // Nếu không có @RateLimit() decorator, skip rate limiting
    if (!rateLimitOptions) {
      return next.handle();
    }

    // Lấy request object
    const request = context.switchToHttp().getRequest();

    // Lấy identifier (IP hoặc User ID)
    const identifier = this.getIdentifier(request);

    // Kiểm tra xem có vượt quá limit không
    const isLimitExceeded = this.checkRateLimit(
      identifier,
      rateLimitOptions.max,
      rateLimitOptions.windowMs,
    );

    if (isLimitExceeded) {
      // Vượt quá limit, throw 429 Too Many Requests
      throw new HttpException(
        `Bạn đã gửi quá nhiều request. Vui lòng thử lại sau ${Math.ceil(rateLimitOptions.windowMs / 1000)}s`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Còn trong giới hạn, cho request đi
    return next.handle();
  }

  /**
   * Lấy identifier từ request
   * - Nếu user đã login, dùng user ID
   * - Nếu chưa login, dùng IP address
   */
  private getIdentifier(request: any): string {
    // Nếu user đã authenticate, dùng user ID
    if (request.user?.id) {
      return `user:${request.user.id}`;
    }

    // Nếu chưa authenticate, dùng IP address
    // Kiểm tra nhiều headers vì có thể có proxy/load balancer
    const ip =
      request.headers['x-forwarded-for'] ||
      request.headers['x-real-ip'] ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      '0.0.0.0';

    // x-forwarded-for có thể chứa multiple IPs, lấy IP đầu tiên
    const ipAddress = typeof ip === 'string' ? ip.split(',')[0].trim() : ip;

    return `ip:${ipAddress}`;
  }

  /**
   * Kiểm tra xem có vượt quá rate limit không
   * - Clean up old requests ngoài time window
   * - Đếm request trong time window
   * - Nếu >= max, return true (exceeded)
   * - Nếu < max, lưu request mới, return false (ok)
   */
  private checkRateLimit(
    identifier: string,
    maxRequests: number,
    windowMs: number,
  ): boolean {
    const now = Date.now();

    // Khởi tạo store nếu chưa có identifier
    if (!rateLimitStore[identifier]) {
      rateLimitStore[identifier] = [];
    }

    // Lấy array requests của identifier này
    const requests = rateLimitStore[identifier];

    // Clean up: xóa requests cũ (ngoài time window)
    const cutoffTime = now - windowMs;
    rateLimitStore[identifier] = requests.filter(
      (record) => record.timestamp > cutoffTime,
    );

    // Kiểm tra xem có vượt quá limit không
    const currentRequestCount = rateLimitStore[identifier].length;

    if (currentRequestCount >= maxRequests) {
      // Vượt quá limit, không thêm request này
      return true;
    }

    // Còn trong giới hạn, thêm request này vào store
    rateLimitStore[identifier].push({ timestamp: now });
    return false;
  }

  /**
   * Manual method để reset rate limit của một identifier
   * Dùng nếu cần unblock user (admin panel)
   */
  static resetLimit(identifier: string): void {
    delete rateLimitStore[identifier];
    console.log(`🔓 Rate limit RESET: ${identifier}`);
  }

  /**
   * Reset toàn bộ rate limit
   */
  static resetAllLimits(): void {
    for (const key in rateLimitStore) {
      delete rateLimitStore[key];
    }
    console.log('🔓 All rate limits RESET');
  }

  /**
   * Kiểm tra rate limit stats (debugging)
   */
  static getStats(): {
    totalIdentifiers: number;
    identifiers: {
      identifier: string;
      requestCount: number;
      oldestRequest: number;
    }[];
  } {
    const identifiers = Object.entries(rateLimitStore).map(
      ([identifier, requests]) => ({
        identifier,
        requestCount: requests.length,
        oldestRequest: requests.length > 0 ? requests[0].timestamp : 0,
      }),
    );

    return {
      totalIdentifiers: identifiers.length,
      identifiers,
    };
  }

  /**
   * Lấy request count của một identifier
   */
  static getRequestCount(identifier: string): number {
    return rateLimitStore[identifier]?.length || 0;
  }
}
