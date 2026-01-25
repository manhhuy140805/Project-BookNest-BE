import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { createUpstashRedisClient } from '../config/upstash-redis.config';
import { CACHE_KEY_METADATA, CACHE_TTL_METADATA } from '../decorator';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private redis = createUpstashRedisClient();

  constructor(private reflector: Reflector) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = this.reflector.get<string>(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );
    const ttl = this.reflector.get<number>(
      CACHE_TTL_METADATA,
      context.getHandler(),
    );

    // Chỉ cache GET requests và có @Cache() decorator
    if (request.method !== 'GET' || !cacheKey) {
      return next.handle();
    }

    // Tạo cache key unique cho mỗi request
    const fullCacheKey = `${cacheKey}:${request.url}`;

    try {
      // Kiểm tra cache
      const cachedData = await this.redis.get(fullCacheKey);

      if (cachedData) {
        console.log(`✅ Cache HIT: ${fullCacheKey}`);
        return of(cachedData);
      }

      console.log(`❌ Cache MISS: ${fullCacheKey}`);

      // Nếu không có cache, execute handler và lưu kết quả
      return next.handle().pipe(
        tap(async (data) => {
          // Lưu vào cache với TTL (default 5 phút)
          await this.redis.set(fullCacheKey, data, {
            ex: ttl || 300, // TTL in seconds
          });
          console.log(`💾 Cached: ${fullCacheKey} (TTL: ${ttl || 300}s)`);
        }),
      );
    } catch (error) {
      console.error('Redis error:', error);
      // Nếu Redis lỗi, vẫn tiếp tục xử lý request
      return next.handle();
    }
  }
}
