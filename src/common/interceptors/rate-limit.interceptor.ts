import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { RATE_LIMIT_KEY, RateLimitOptions } from 'src/common/decorator';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

/**
 * RateLimitInterceptor - Giới hạn số lần request (Redis-backed)
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
 * 4. Kiểm tra Redis: có bao nhiêu request từ IP/User trong time window
 * 5. Nếu vượt quá limit, throw TooManyRequestsException (429)
 * 6. Nếu còn trong giới hạn, cho request đi và increment counter
 * 7. Tự động expire key sau khi hết time window
 *
 * Ví dụ sử dụng:
 * @Post('login')
 * @RateLimit({ max: 5, windowMs: 60000 })  // 5 requests per minute
 * login(@Body() authDto: AuthDto) {
 *   return this.authService.login(authDto);
 * }
 *
 * Lưu ý:
 * - Rate limiting lưu trong Redis (persistent, scalable)
 * - Identifier = IP address (nếu user chưa login) hoặc User ID
 * - windowMs = khoảng thời gian tính bằng milliseconds
 * - max = số request tối đa trong time window
 */

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  private redis: Redis;

  constructor(
    private reflector: Reflector,
    private readonly redisService: RedisService,
  ) {
    // Get Redis client from RedisService
    this.redis = this.redisService.getOrThrow();
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
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

    // Tạo Redis key
    const redisKey = `ratelimit:${identifier}:${context.getHandler().name}`;

    // Kiểm tra xem có vượt quá limit không
    const isLimitExceeded = await this.checkRateLimit(
      redisKey,
      rateLimitOptions.max,
      rateLimitOptions.windowMs,
    );

    if (isLimitExceeded) {
      // Lấy TTL còn lại để hiển thị cho user
      const ttl = await this.redis.ttl(redisKey);
      const retryAfter = ttl > 0 ? ttl : Math.ceil(rateLimitOptions.windowMs / 1000);

      // Vượt quá limit, throw 429 Too Many Requests
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Bạn đã gửi quá nhiều request. Vui lòng thử lại sau ${retryAfter}s`,
          retryAfter,
        },
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
   * Kiểm tra xem có vượt quá rate limit không (Redis)
   * - Sử dụng Redis INCR để atomic increment
   * - Set EXPIRE nếu là lần đầu tiên
   * - Return true nếu vượt quá limit
   */
  private async checkRateLimit(
    redisKey: string,
    maxRequests: number,
    windowMs: number,
  ): Promise<boolean> {
    try {
      // Increment counter (atomic operation)
      const currentCount = await this.redis.incr(redisKey);

      // Nếu là lần đầu tiên (count = 1), set expire time
      if (currentCount === 1) {
        await this.redis.pexpire(redisKey, windowMs);
      }

      // Kiểm tra xem có vượt quá limit không
      return currentCount > maxRequests;
    } catch (error) {
      // Nếu Redis lỗi, log và cho request đi (fail-open)
      console.error('❌ Redis Rate Limit Error:', error);
      return false; // Không block request nếu Redis lỗi
    }
  }

  /**
   * Manual method để reset rate limit của một identifier
   * Dùng nếu cần unblock user (admin panel)
   */
  async resetLimit(identifier: string, handlerName: string): Promise<void> {
    const redisKey = `ratelimit:${identifier}:${handlerName}`;
    await this.redis.del(redisKey);
    console.log(`🔓 Rate limit RESET: ${redisKey}`);
  }

  /**
   * Reset toàn bộ rate limit
   */
  async resetAllLimits(): Promise<void> {
    const keys = await this.redis.keys('ratelimit:*');
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
    console.log(`🔓 All rate limits RESET (${keys.length} keys)`);
  }

  /**
   * Kiểm tra rate limit stats (debugging)
   */
  async getStats(): Promise<{
    totalKeys: number;
    keys: { key: string; count: number; ttl: number }[];
  }> {
    const keys = await this.redis.keys('ratelimit:*');
    const stats = await Promise.all(
      keys.map(async (key) => ({
        key,
        count: parseInt((await this.redis.get(key)) || '0'),
        ttl: await this.redis.ttl(key),
      })),
    );

    return {
      totalKeys: keys.length,
      keys: stats,
    };
  }
}
