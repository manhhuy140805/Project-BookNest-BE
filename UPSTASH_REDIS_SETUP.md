# 🚀 Setup Upstash Redis Caching

## 1. Tạo Database trên Upstash

1. Truy cập https://console.upstash.com/redis
2. Click **"Create Database"**
3. Chọn:
   - **Name**: booknest-cache
   - **Type**: Regional hoặc Global (chọn Regional cho tốc độ)
   - **Region**: Chọn gần bạn nhất (Singapore, Tokyo, etc.)
   - **Plan**: Free (đủ dùng)
4. Click **"Create"**

## 2. Lấy Credentials

Sau khi tạo xong, vào database detail:

1. Tab **"Details"** → Copy:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

2. Paste vào file `.env`:

```env
UPSTASH_REDIS_REST_URL="https://YOUR_ENDPOINT.upstash.io"
UPSTASH_REDIS_REST_TOKEN="YOUR_TOKEN_HERE"
```

## 3. Sử dụng @Cache() Decorator

```typescript
import { Cache } from 'src/common/decorator';

@Controller('book')
export class BookController {
  @Cache('books:all', 300) // Cache 5 phút (300 giây)
  @Get()
  async getAllBooks() {
    return this.bookService.getAllBooks();
  }

  @Cache('books:detail', 600) // Cache 10 phút
  @Get('id/:id')
  async getBookById(@Param('id') id: string) {
    return this.bookService.getBookById(Number(id));
  }

  @Cache('books:search', 180) // Cache 3 phút
  @Get('search')
  async searchBooks(@Query('keyword') keyword: string) {
    return this.bookService.searchBooks(keyword);
  }
}
```

## 4. Clear Cache Khi Update/Delete

Để clear cache khi có thay đổi, tạo service:

```typescript
// src/common/services/cache.service.ts
import { Injectable } from '@nestjs/common';
import { createUpstashRedisClient } from '../config/upstash-redis.config';

@Injectable()
export class CacheService {
  private redis = createUpstashRedisClient();

  async clearByPrefix(prefix: string) {
    try {
      // Scan và xóa tất cả keys có prefix
      const keys = await this.redis.keys(`${prefix}*`);
      if (keys.length > 0) {
        await Promise.all(keys.map((key) => this.redis.del(key)));
        console.log(
          `🗑️  Cleared ${keys.length} cache keys with prefix: ${prefix}`,
        );
      }
    } catch (error) {
      console.error('Clear cache error:', error);
    }
  }

  async clear(key: string) {
    try {
      await this.redis.del(key);
      console.log(`🗑️  Cleared cache: ${key}`);
    } catch (error) {
      console.error('Clear cache error:', error);
    }
  }
}
```

Sử dụng trong service:

```typescript
@Injectable()
export class BookService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async updateBook(id: number, updateBookDto: UpdateBookDto) {
    const updatedBook = await this.prismaService.book.update({
      where: { id },
      data: updateBookDto,
    });

    // Clear cache sau khi update
    await this.cacheService.clearByPrefix('books:');

    return updatedBook;
  }
}
```

## 5. Monitor Cache

Xem logs trong terminal:

```
✅ Cache HIT: books:all:/book
❌ Cache MISS: books:detail:/book/id/101
💾 Cached: books:detail:/book/id/101 (TTL: 600s)
```

Hoặc truy cập Upstash Console → Tab **"CLI"** để xem keys:

```redis
KEYS books:*
TTL books:all:/book
GET books:all:/book
```

## 6. Cache Strategy Gợi Ý

| Endpoint         | Cache Key        | TTL     | Lý do                              |
| ---------------- | ---------------- | ------- | ---------------------------------- |
| GET /book        | `books:all`      | 5 phút  | Dữ liệu thay đổi ít                |
| GET /book/:id    | `books:detail`   | 10 phút | Chi tiết sách ổn định              |
| GET /book/search | `books:search`   | 3 phút  | Kết quả search thay đổi nhiều      |
| GET /category    | `categories:all` | 15 phút | Category rất ít thay đổi           |
| GET /user/me     | Không cache      | -       | Dữ liệu user thay đổi thường xuyên |

## 7. Troubleshooting

**Lỗi: "UPSTASH_REDIS_REST_URL must be defined"**
→ Check file `.env` đã có credentials chưa

**Cache không hoạt động:**

1. Check logs trong terminal
2. Verify credentials trên Upstash Console
3. Test connection: Vào Upstash Console → CLI → Run `PING`

**Cache không clear:**
→ Upstash Free plan có giới hạn operations/second, đợi 1s rồi thử lại

## 8. Best Practices

✅ **NÊN:**

- Cache GET endpoints với data ít thay đổi
- Set TTL phù hợp (3-15 phút)
- Clear cache sau UPDATE/DELETE
- Monitor cache hit rate

❌ **KHÔNG NÊN:**

- Cache POST/PUT/DELETE requests
- Cache data nhạy cảm (password, token)
- TTL quá dài (>1 giờ) hoặc quá ngắn (<1 phút)
- Cache response lớn (>1MB)

## 🎯 Kết quả

- ⚡ Tốc độ response giảm từ ~100ms → ~10ms (cache hit)
- 💰 Giảm database queries
- 📈 Scale tốt hơn với traffic cao
- 🌍 Upstash Global cache cho multi-region
