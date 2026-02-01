# 🛡️ Rate Limiting Setup - BookNest API

## Tổng quan

BookNest API sử dụng **2 tầng Rate Limiting** để bảo vệ tối đa khỏi các cuộc tấn công:

### Tầng 1: Global Rate Limiting (@nestjs/throttler)
- **Giới hạn:** 100 requests/phút mỗi IP
- **Áp dụng:** Tất cả endpoints
- **Storage:** Redis (Upstash)
- **Mục đích:** Bảo vệ chống DDoS và spam tổng quát

### Tầng 2: Custom Rate Limiting (RateLimitInterceptor)
- **Giới hạn:** Tùy chỉnh cho từng endpoint
- **Áp dụng:** Các endpoint nhạy cảm (auth, payment, etc.)
- **Storage:** Redis (Upstash)
- **Mục đích:** Bảo vệ chống brute-force, spam cụ thể

---

## 📊 Rate Limits cho Auth Endpoints

| Endpoint | Giới hạn | Time Window | Lý do |
|----------|----------|-------------|-------|
| `POST /auth/register` | 3 requests | 1 phút | Chống spam đăng ký |
| `POST /auth/login` | 5 requests | 1 phút | Chống brute-force login |
| `POST /auth/change-password` | 5 requests | 1 phút | Bảo vệ account |
| `GET /auth/verify-email` | 10 requests | 1 phút | Cho phép retry |
| `POST /auth/resend-verification` | 3 requests | 5 phút | Chống spam email |
| `POST /auth/forgot-password` | 3 requests | 5 phút | Chống spam email |
| `POST /auth/reset-password` | 5 requests | 1 phút | Bảo vệ reset process |

---

## 🔧 Cấu hình

### 1. Environment Variables (.env)

```bash
# Redis Configuration (for Rate Limiting & Caching)
REDIS_HOST="ethical-lark-30521.upstash.io"
REDIS_PORT="6379"
REDIS_PASSWORD="AXc5AAIncDJiNzEzYTNmY2RkOTY0MjNlYWRlNzY4YTZjZTdhNDBlZnAyMzA1MjE"
REDIS_TLS="true"
```

### 2. AppModule Configuration

```typescript
// Global Rate Limiting
ThrottlerModule.forRoot([
  {
    ttl: 60000, // 60 seconds
    limit: 100, // Max 100 requests per window
  },
]),
```

### 3. Custom Rate Limiting (Decorator)

```typescript
@Post('login')
@IsPublic()
@RateLimit({ max: 5, windowMs: 60000 }) // 5 login attempts/phút
login(@Body() authDto: AuthLoginDto) {
  return this.authService.login(authDto);
}
```

---

## 📝 Cách sử dụng

### Thêm Rate Limit cho endpoint mới

```typescript
import { RateLimit } from 'src/common/decorator';

@Post('sensitive-action')
@RateLimit({ max: 10, windowMs: 60000 }) // 10 requests/phút
async sensitiveAction() {
  // Your logic here
}
```

### Tùy chỉnh giới hạn

```typescript
// Giới hạn chặt chẽ (3 requests/5 phút)
@RateLimit({ max: 3, windowMs: 300000 })

// Giới hạn vừa phải (10 requests/phút)
@RateLimit({ max: 10, windowMs: 60000 })

// Giới hạn lỏng (100 requests/phút)
@RateLimit({ max: 100, windowMs: 60000 })
```

---

## 🚨 Response khi vượt quá giới hạn

### HTTP Status: 429 Too Many Requests

```json
{
  "statusCode": 429,
  "message": "Bạn đã gửi quá nhiều request. Vui lòng thử lại sau 45s",
  "retryAfter": 45
}
```

### Headers

```
Retry-After: 45
```

---

## 🔍 Monitoring & Debugging

### Kiểm tra Rate Limit Stats

```typescript
// Trong RateLimitInterceptor
const stats = await rateLimitInterceptor.getStats();
console.log(stats);
// Output:
// {
//   totalKeys: 15,
//   keys: [
//     { key: 'ratelimit:ip:192.168.1.1:login', count: 3, ttl: 45 },
//     { key: 'ratelimit:user:123:changePassword', count: 2, ttl: 30 },
//     ...
//   ]
// }
```

### Reset Rate Limit (Admin)

```typescript
// Reset cho một user/IP cụ thể
await rateLimitInterceptor.resetLimit('ip:192.168.1.1', 'login');

// Reset tất cả
await rateLimitInterceptor.resetAllLimits();
```

---

## 🏗️ Architecture

```
Request
  ↓
[ThrottlerGuard] → Global: 100 req/min
  ↓
[RateLimitInterceptor] → Custom: Endpoint-specific
  ↓
[Controller Handler]
  ↓
Response
```

### Redis Key Structure

```
ratelimit:{identifier}:{handlerName}
```

Ví dụ:
- `ratelimit:ip:192.168.1.1:login`
- `ratelimit:user:123:changePassword`
- `ratelimit:ip:10.0.0.5:register`

---

## 🔐 Security Best Practices

1. **Identifier Strategy:**
   - Logged-in users: `user:{userId}`
   - Anonymous users: `ip:{ipAddress}`
   - Xử lý proxy headers: `X-Forwarded-For`, `X-Real-IP`

2. **Fail-Open Strategy:**
   - Nếu Redis lỗi → Cho request đi (không block)
   - Log error để admin biết

3. **TTL Management:**
   - Tự động expire keys sau time window
   - Không cần manual cleanup

4. **Scalability:**
   - Redis-backed → Scale horizontally
   - Shared state across multiple instances

---

## 📦 Dependencies

```json
{
  "@nestjs/throttler": "^6.5.0",
  "@liaoliaots/nestjs-redis": "^latest",
  "ioredis": "^latest"
}
```

---

## 🧪 Testing

### Test Rate Limiting

```bash
# Test login endpoint (max 5/min)
for i in {1..10}; do
  curl -X POST http://localhost:8080/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
  echo "\nRequest $i"
  sleep 1
done

# Kết quả mong đợi:
# Request 1-5: 200/401 (normal)
# Request 6+: 429 (rate limited)
```

---

## 🎯 Next Steps

1. ✅ Setup Redis connection
2. ✅ Configure ThrottlerModule (global)
3. ✅ Implement RateLimitInterceptor (custom)
4. ✅ Apply to Auth endpoints
5. ⏳ Add monitoring dashboard
6. ⏳ Implement admin panel for rate limit management
7. ⏳ Add metrics (Prometheus/Grafana)

---

## 📚 References

- [NestJS Throttler Documentation](https://docs.nestjs.com/security/rate-limiting)
- [Redis Rate Limiting Patterns](https://redis.io/docs/manual/patterns/rate-limiter/)
- [OWASP Rate Limiting](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html)

---

**Created:** 2026-02-01  
**Author:** BookNest Team  
**Status:** ✅ Production Ready
