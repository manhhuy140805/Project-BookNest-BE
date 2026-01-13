# BookNest - Tài Liệu Tiến Độ

## 📋 Tổng Quan

Hệ thống quản lý sách với chức năng đánh giá, yêu thích và phân quyền dựa trên JWT authentication.

**NestJS Version:** 11.0.14  
**Database:** PostgreSQL (Docker)  
**ORM:** Prisma  
**Authentication:** JWT (Passport.js)

---

## ✅ HOÀN THÀNH

### ✅ Task 1: Setup Project

- ✅ Setup cơ bản như đã học
  - Khởi tạo NestJS project
  - Setup Prisma + PostgreSQL (Docker)
  - Cấu hình TypeScript + ESLint
  - Setup environment variables (.env)

---

### ✅ Task 2: Authentication Module

- ✅ Tạo AuthModule + AuthService + AuthController
- ✅ Register: hash password (bcrypt), lưu DB, xử lý duplicate email (P2002)
- ✅ Login: verify password, generate JWT token
- ✅ Tạo JwtStrategy + JwtAuthGuard
  - Extract token từ Authorization header
  - Validate payload, load user từ DB
  - Return user object cho request
- ✅ Endpoint `GET /auth/me` (protected)
- ✅ JWT setup với JWT_SECRET, expires 1h

---

### ✅ Task 3: User Module (Partial)

- ✅ CRUD User cơ bản
  - `findAll()`: Lấy tất cả users (async)
  - `findOne(id)`: Lấy user theo ID, throw NotFoundException nếu không tìm
  - `update(id, userUpdate)`: Update user (fullName, avatarUrl, bio, role)
  - `remove(id)`: Xóa user, throw NotFoundException nếu không tìm
- ✅ Update profile (fullName, bio, avatarUrl, dateOfBirth)
- ✅ UserController
  - `GET /user` - @UseGuards(RolesGuard) @Roles(Role.ADMIN) - Lấy tất cả users (admin only)
- ❌ Favorite books (add, remove, list) - Chưa làm

---

### ✅ Task 7: Authorization (Roles)

- ✅ Tạo enum Role (USER, ADMIN, MODERATOR) trong schema
- ✅ Custom decorator `@Roles()`
  - Sử dụng: `@Roles(Role.ADMIN)` hoặc `@Roles(Role.ADMIN, Role.MODERATOR)`
- ✅ Tạo RolesGuard
  - Kiểm tra metadata từ @Roles()
  - So sánh user.role với required roles
  - Throw ForbiddenException nếu không match
- ✅ Apply: ADMIN quản lý resources

---

### ✅ Custom Decorators (All Complete)

- ✅ **@UserData()** - Parameter decorator
  - Extract `request.user` hoặc property cụ thể
  - Dùng: `@UserData()` hoặc `@UserData('id')` hoặc `@UserData('email')`

- ✅ **@IsPublic()** - Method decorator
  - Đánh dấu route để skip JWT authentication
  - Dùng: `@IsPublic()` trên handler

- ✅ **@Roles()** - Method decorator
  - Chỉ định roles cần thiết cho endpoint
  - Dùng với `@UseGuards(RolesGuard)`

- ✅ **@RateLimit()** - Method decorator
  - Cấu hình rate limiting (max requests, time window)
  - Dùng: `@RateLimit({ max: 10, windowMs: 60000 })`
  - Per-user (authenticated) hoặc per-IP (not authenticated)

- ✅ **@Cache()** - Method decorator
  - Cấu hình caching response (TTL)
  - Dùng: `@Cache({ ttl: 300 })` hoặc `@Cache({ ttl: 300, key: 'books' })`

---

### ✅ Global Security Setup

- ✅ **MyJwtGuard** (Global)
  - Extends AuthGuard('jwt')
  - Check @IsPublic() metadata trước
  - Nếu @IsPublic() → skip JWT validation
  - Không @IsPublic() → validate JWT token
  - Registered via APP_GUARD token
  - Architecture: Default-protected, opt-in public

- ✅ **RateLimitInterceptor**
  - In-memory tracking per user/IP
  - Read @RateLimit() metadata
  - Throws HttpException(429) khi vượt limit
  - Registered via APP_INTERCEPTOR

- ✅ **CacheInterceptor**
  - In-memory caching (Map-based)
  - Read @Cache() metadata
  - Auto-expire sau TTL seconds
  - Registered via APP_INTERCEPTOR

- ✅ **ValidationPipe** (main.ts)
  - whitelist: true
  - forbidNonWhitelisted: true
  - transform: true
  - enableImplicitConversion: true

---

### ✅ Module Configuration

- ✅ **AuthModule**
  - Providers: AuthService, MyJwtGuard, RolesGuard, JwtStrategy, PrismaService
  - Exports: AuthService, PassportModule, JwtModule, RolesGuard

- ✅ **UserModule**
  - Providers: UserService
  - Controllers: UserController

- ✅ **PrismaModule**
  - Global module for database access

- ✅ **AppModule**
  - APP_GUARD: MyJwtGuard
  - APP_INTERCEPTOR: RateLimitInterceptor, CacheInterceptor

---

### ✅ DTOs & Validation

- ✅ AuthRegisterDto (email, password, fullName)
- ✅ AuthLoginDto (email, password)
- ✅ UserUpdateDto (fullName, avatarUrl, bio, role)
- ✅ Global ValidationPipe validation
- ✅ class-validator integration

---

## 🔄 Request Processing Order

1. **MyJwtGuard** → Check @IsPublic(), validate JWT
2. **RateLimitInterceptor** → Track requests
3. **CacheInterceptor** → Check cache
4. **ValidationPipe** → Validate DTO
5. **RolesGuard** → Check @Roles()
6. **Handler method** → Execute

---

## 📚 File Structure

```
src/
├── common/
│   ├── decorator/
│   │   ├── user-data.decorator.ts
│   │   ├── is-public.decorator.ts
│   │   ├── roles.decorator.ts
│   │   ├── rate-limit.decorator.ts
│   │   ├── cache.decorator.ts
│   │   └── index.ts
│   ├── guards/
│   │   ├── myjwt.guard.ts
│   │   ├── roles.guard.ts
│   │   └── index.ts
│   └── interceptors/
│       ├── cache.interceptor.ts
│       ├── rate-limit.interceptor.ts
│       └── index.ts
├── modules/
│   ├── auth/
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── dto/
│   │   ├── strategy/
│   │   └── guards/
│   ├── user/
│   │   ├── user.service.ts
│   │   ├── user.controller.ts
│   │   ├── user.module.ts
│   │   └── Dto/
│   ├── prisma/
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
├── app.module.ts
└── main.ts
```

---

## ⚠️ Lưu Ý Quan Trọng

1. **Role Enum Match**
   - Prisma: `enum Role { USER, ADMIN, MODERATOR }`
   - Decorator: `export enum Role { ADMIN = 'ADMIN', ... }`

2. **Async/Await**: Luôn await Prisma queries

3. **Error Handling**
   - `NotFoundException` → 404
   - `ForbiddenException` → 403
   - `BadRequestException` → 400
   - `ConflictException` → 409

4. **Security**
   - Không return password
   - Tránh User Enumeration Attack
   - JWT secret trong environment

5. **Rate Limiting**
   - Per-user nếu authenticated
   - Per-IP nếu không authenticated

6. **Caching**
   - Hiện tại in-memory (Map)
   - Production: Upgrade to Redis

---

**Last Updated:** 13/01/2026  
**Status:** Core Features Complete
