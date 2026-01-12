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

/**
 * Decorator để cache kết quả response
 *
 * Dùng cho các endpoint có dữ liệu ít thay đổi:
 * - List sách phổ biến
 * - Danh sách categories
 * - Thống kê trang chủ
 * - Dữ liệu config
 *
 * Ví dụ:
 * @Get('popular-books')
 * @Cache({ ttl: 3600, key: 'popular-books' })  // Cache 1 hour
 * getPopularBooks() {
 *   return this.bookService.getPopular();
 * }
 *
 * @Get('categories')
 * @Cache({ ttl: 86400 })  // Cache 1 day, key tự động = '/categories'
 * getCategories() {
 *   return this.categoryService.getAll();
 * }
 *
 * Cách hoạt động:
 * 1. Decorator gắn cache options vào metadata
 * 2. CacheInterceptor đọc metadata
 * 3. Kiểm tra cache có tồn tại không
 * 4. Nếu có, return cached data (không gọi hàm service)
 * 5. Nếu không, gọi hàm service, cache result, rồi return
 * 6. Cache tự động xóa sau ttl seconds
 */
export const Cache = (options: CacheOptions) =>
  SetMetadata(CACHE_KEY_METADATA, options);
