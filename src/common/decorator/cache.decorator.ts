import { SetMetadata } from '@nestjs/common';

/**
 * Options cho Cache
 *
 * - ttl: Thời gian sống của cache tính bằng giây (Time To Live)
 * - key: Tên key cache (nếu không cung cấp, dùng endpoint URL)
 */
export interface CacheOptions {
  ttl: number; // Thời gian cache tồn tại (seconds)
  key?: string; // Cache key (tùy chọn)
}

// Tên key để lưu metadata
export const CACHE_KEY_METADATA = 'cache';

export const Cache = (options: CacheOptions) =>
  SetMetadata(CACHE_KEY_METADATA, options);
