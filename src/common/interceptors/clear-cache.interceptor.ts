import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { createUpstashRedisClient } from '../config/upstash-redis.config';
import { CLEAR_CACHE_METADATA } from '../decorator/clear-cache.decorator';

@Injectable()
export class ClearCacheInterceptor implements NestInterceptor {
  private redis = createUpstashRedisClient();

  constructor(private reflector: Reflector) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const patterns = this.reflector.get<string[]>(
      CLEAR_CACHE_METADATA,
      context.getHandler(),
    );

    if (!patterns || patterns.length === 0) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async () => {
        try {
          for (const pattern of patterns) {
            const keys = await this.redis.keys(`${pattern}*`);
            if (keys && keys.length > 0) {
              await this.redis.del(...keys);
              console.log(`Cleared ${keys.length} cache keys: ${pattern}`);
            }
          }
        } catch (error) {
          console.error('Error clearing cache:', error);
        }
      }),
    );
  }
}
