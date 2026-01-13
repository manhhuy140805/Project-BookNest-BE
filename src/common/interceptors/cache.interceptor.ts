import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CACHE_KEY_METADATA, CacheOptions } from 'src/common/decorator';

/**
 * CacheInterceptor - Cache response của endpoint
 *
 * Dùng để:
 * - Cache dữ liệu ít thay đổi (categories, popular books, etc)
 * - Giảm database queries
 * - Tăng performance
 * - Giảm server load
 *
 * Cách hoạt động:
 * 1. Kiểm tra decorator @Cache() có metadata không
 * 2. Nếu không có metadata, request đi bình thường (không cache)
 * 3. Nếu có metadata, kiểm tra cache key
 * 4. Nếu cache tồn tại, return cached data (không gọi handler)
 * 5. Nếu cache không tồn tại:
 *    - Gọi handler để lấy fresh data
 *    - Lưu result vào cache
 *    - Đặt timeout để tự động xóa cache sau ttl seconds
 *
 * Ví dụ sử dụng:
 * @Get('popular-books')
 * @Cache({ ttl: 3600, key: 'popular-books' })  // Cache 1 hour
 * getPopularBooks() {
 *   return this.bookService.getPopular();
 * }
 *
 * @Get('categories')
 * @Cache({ ttl: 86400 })  // Cache 1 day, key = auto (endpoint URL)
 * getCategories() {
 *   return this.categoryService.getAll();
 * }
 *
 * Lưu ý:
 * - Cache lưu trong memory (nguy hiểm nếu app restart)
 * - Để production, nên dùng Redis thay vì memory
 * - Không cache POST, PUT, DELETE (chỉ cache GET)
 * - Cache tự động xóa sau ttl seconds
 * - Có thể manually clear cache nếu cần
 */

// In-memory cache storage
// Key: cache key, Value: { data, expiresAt }
const cacheStorage = new Map<string, { data: any; expiresAt: number }>();

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Lấy cache metadata từ @Cache() decorator
    const cacheOptions = this.reflector.get<CacheOptions>(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );

    // Nếu không có @Cache() decorator, skip caching
    if (!cacheOptions) {
      return next.handle();
    }

    // Lấy request object
    const request = context.switchToHttp().getRequest();

    // Tạo cache key
    // Nếu decorator cung cấp key, dùng nó
    // Nếu không, dùng endpoint URL + method + user ID
    const cacheKey = this.generateCacheKey(request, cacheOptions);

    // Kiểm tra cache có tồn tại không
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData) {
      console.log(`✅ Cache HIT: ${cacheKey}`);
      // Return cached data mà không gọi handler
      return of(cachedData);
    }

    // Cache không tồn tại, gọi handler để lấy fresh data
    console.log(`❌ Cache MISS: ${cacheKey}`);
    return next.handle().pipe(
      tap((response) => {
        // Sau khi handler trả về response, lưu vào cache
        this.setCachedData(cacheKey, response, cacheOptions.ttl);
        console.log(`📝 Cache SET: ${cacheKey} (TTL: ${cacheOptions.ttl}s)`);
      }),
    );
  }

  /**
   * Tạo cache key từ request info + decorator options
   */
  private generateCacheKey(request: any, options: CacheOptions): string {
    // Nếu decorator cung cấp key cụ thể, dùng nó
    if (options.key) {
      return options.key;
    }

    // Nếu không, tạo key từ:
    // - HTTP method
    // - Endpoint URL
    // - User ID (nếu có) - để cache riêng cho từng user
    const method = request.method;
    const url = request.url;
    const userId = request.user?.id ? `:${request.user.id}` : '';

    return `${method}:${url}${userId}`;
  }

  /**
   * Lấy data từ cache
   * Kiểm tra cache còn hợp lệ không (chưa hết TTL)
   */
  private getCachedData(key: string): any {
    const cached = cacheStorage.get(key);

    if (!cached) {
      return null;
    }

    // Kiểm tra cache đã hết hạn không
    if (Date.now() > cached.expiresAt) {
      // Cache hết hạn, xóa nó
      cacheStorage.delete(key);
      return null;
    }

    // Cache còn hợp lệ, return data
    return cached.data;
  }

  /**
   * Lưu data vào cache
   * ttl = time to live (seconds)
   */
  private setCachedData(key: string, data: any, ttl: number): void {
    const expiresAt = Date.now() + ttl * 1000; // Convert seconds to milliseconds

    cacheStorage.set(key, { data, expiresAt });

    // Tự động xóa cache sau ttl seconds
    setTimeout(() => {
      cacheStorage.delete(key);
      console.log(`⏰ Cache EXPIRED: ${key}`);
    }, ttl * 1000);
  }

  /**
   * Manual method để xóa cache
   * Dùng nếu cần invalidate cache (ví dụ sau khi update/delete)
   */
  static clearCache(key?: string): void {
    if (key) {
      cacheStorage.delete(key);
      console.log(`🗑️ Cache CLEARED: ${key}`);
    } else {
      cacheStorage.clear();
      console.log('🗑️ All cache CLEARED');
    }
  }

  /**
   * Kiểm tra cache stats (debugging)
   */
  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: cacheStorage.size,
      keys: Array.from(cacheStorage.keys()),
    };
  }
}
