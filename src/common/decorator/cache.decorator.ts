import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'cache_key';
export const CACHE_TTL_METADATA = 'cache_ttl';

/**
 * Cache decorator để đánh dấu endpoint cần cache
 * @param key - Cache key prefix
 * @param ttl - Time to live in seconds (default: 300 = 5 phút)
 *
 * @example
 * ```typescript
 * @Cache('books:all', 600) // Cache 10 phút
 * @Get()
 * async getAllBooks() {
 *   return this.bookService.getAllBooks();
 * }
 * ```
 */
export const Cache = (key: string, ttl?: number) => {
  return (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) => {
    SetMetadata(CACHE_KEY_METADATA, key)(target, propertyKey, descriptor);
    if (ttl) {
      SetMetadata(CACHE_TTL_METADATA, ttl)(target, propertyKey, descriptor);
    }
  };
};
