# Guard & Strategy - Ghi Chú Quan Trọng

## 1. Cấu Trúc Cơ Bản

### Strategy (JWT)

- **File:** `src/modules/auth/stratery/jwt.strategy.ts`
- **Vai trò:** Định nghĩa cách validate JWT token
- **Kế thừa:** `PassportStrategy(Strategy, 'jwt')`
- **Bắt buộc:** Phải cung cấp strategy name `'jwt'` trong constructor

### Guard (JwtAuthGuard)

- **File:** `src/modules/auth/guards/jwt-auth.guard.ts`
- **Vai trò:** Bảo vệ routes, kiểm tra request có JWT token hợp lệ không
- **Kế thừa:** `AuthGuard('jwt')`
- **Sử dụng:** `@UseGuards(JwtAuthGuard)` trên method controller

---

## 2. Quy Trình Hoạt Động

```
Request có header: Authorization: Bearer <token>
    ↓
@UseGuards(JwtAuthGuard) bắt request
    ↓
JwtAuthGuard gọi Passport authentication
    ↓
JwtStrategy.validate() được thực thi:
  - Extract token từ header
  - Verify token bằng JWT_SECRET
  - Tìm user từ database bằng payload.sub (user id)
  - Return user object → gán vào req.user
    ↓
Controller method nhận req.user (hoặc @User() decorator)
```

---

## 3. Những Lỗi Cần Chú Ý

### ❌ Lỗi 1: "Unknown authentication strategy 'jwt'"

**Nguyên nhân:** JwtStrategy không được đăng ký trong Module providers

```typescript
// ❌ SAIIII
providers: [AuthService], // Thiếu JwtStrategy

// ✅ ĐÚNG
providers: [AuthService, JwtStrategy, PrismaService],
```

**Cách sửa:**

- Import JwtStrategy vào auth.module.ts
- Thêm JwtStrategy vào `providers: []`
- Thêm PrismaService vào providers (cần để query database)

---

### ❌ Lỗi 2: "Converting circular structure to JSON"

**Nguyên nhân:** JwtStrategy.validate() return object có circular reference hoặc properties không serializable

```typescript
// ❌ SAIIII - Return trực tiếp object từ Prisma
return user ?? null;

// ✅ ĐÚNG - Tạo plain object mới
if (!user) {
  return null;
}
return {
  id: user.id,
  email: user.email,
  createdAt: user.createdAt,
};
```

**Giải thích:** Object từ Prisma có thể chứa metadata hoặc properties không serialize được. Tạo object mới để đảm bảo clean data.

---

### ❌ Lỗi 3: JwtStrategy constructor missing 'jwt' name parameter

**Nguyên nhân:** Thiếu strategy name trong `PassportStrategy` constructor

```typescript
// ❌ SAIIII
export class JwtStrategy extends PassportStrategy(Strategy) {

// ✅ ĐÚNG
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
```

**Giải thích:** Passport cần biết strategy name là 'jwt' để map đúng với `AuthGuard('jwt')`

---

### ❌ Lỗi 4: `import type` thay vì `import`

**Nguyên nhân:** Sử dụng `import type` khiến class metadata bị xóa khi compile

```typescript
// ❌ SAIIII - TypeScript sẽ xóa import này ở runtime
import type { AuthDto } from './dto';

// ✅ ĐÚNG - Giữ lại import để có metadata
import { AuthDto } from './dto';
```

**Ảnh hưởng:** Validation không hoạt động vì class metadata bị mất

---

## 4. Cấu Hình Bắt Buộc

### JWT_SECRET trong .env

```env
JWT_SECRET="your_super_secret_here"
JWT_EXPIRES_IN="3600s"
```

**Lưu ý:**

- Không bao giờ commit JWT_SECRET vào git
- Sử dụng environment variables an toàn
- Trong JwtStrategy, sử dụng `process.env.JWT_SECRET`

---

## 5. Cách Sử Dụng Guard Đúng

### Bảo vệ một route

```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@Request() req) {
  return req.user; // req.user được set bởi JwtStrategy.validate()
}
```

### Bảo vệ toàn bộ controller

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  // Tất cả endpoints đều được bảo vệ
}
```

### Bảo vệ toàn bộ ứng dụng (không khuyến khích)

```typescript
// Trong main.ts
app.useGlobalGuards(new JwtAuthGuard()); // ❌ Sẽ block toàn bộ API
```

---

## 6. Accessing User từ Request

### Cách 1: @Request() decorator

```typescript
@Get('me')
@UseGuards(JwtAuthGuard)
getMe(@Request() req) {
  return req.user; // req.user được set bởi validate()
}
```

### Cách 2: Custom @User() decorator (Recommended)

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// Sử dụng
@Get('me')
@UseGuards(JwtAuthGuard)
getMe(@CurrentUser() user) {
  return user;
}
```

---

## 7. Login Flow - Token Signing

```typescript
async login(authDto: AuthDto) {
  // 1. Tìm user
  const user = await this.prisma.user.findUnique({...});
  if (!user) throw new ForbiddenException(...);

  // 2. Verify password
  const passwordMatches = await bcrypt.compare(
    authDto.password,
    user.hashPassword
  );
  if (!passwordMatches) throw new ForbiddenException(...);

  // 3. Sign token
  const token = await this.jwtService.signAsync(
    { sub: user.id, email: user.email },
    { secret: process.env.JWT_SECRET, expiresIn: '1h' }
  );

  // 4. Return token
  return { access_token: token };
}
```

**Quan trọng:**

- `sub` (subject) = user id (theo JWT spec)
- Payload phải lightweight (không lưu toàn bộ user object)
- Verify password bằng bcrypt.compare()

---

## 8. Module Exports

```typescript
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, JwtStrategy, PrismaService],
  exports: [AuthService, PassportModule, JwtModule], // ⭐ Bắt buộc export
})
```

**Lưu ý:**

- Export `PassportModule` và `JwtModule` để modules khác có thể dùng guard
- Export `AuthService` nếu modules khác cần dùng method từ nó

---

## 9. Type Casting cho signOptions

```typescript
// Nếu TypeScript báo lỗi kiểu, sử dụng as
JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '3600s') as JwtModuleOptions['signOptions']['expiresIn'],
  },
}),
```

---

## 10. Checklist Khi Setup Guard + Strategy

- [ ] Cài đặt packages: `@nestjs/jwt`, `passport-jwt`, `@nestjs/passport`, `passport`
- [ ] Thêm `JWT_SECRET` vào .env
- [ ] Tạo JwtStrategy file
- [ ] Tạo JwtAuthGuard file
- [ ] Import JwtStrategy, PrismaService trong AuthModule
- [ ] Thêm vào `providers: [AuthService, JwtStrategy, PrismaService]`
- [ ] Export `PassportModule`, `JwtModule` từ AuthModule
- [ ] Sử dụng `import` thay vì `import type` cho DTOs
- [ ] Return plain object từ JwtStrategy.validate()
- [ ] Test login endpoint để nhận token
- [ ] Test protected endpoint bằng token

---

## 11. RolesGuard - Kiểm Soát Quyền Truy Cập

### File: `src/modules/auth/guards/roles.guard.ts`

**Vai trò:**

- Kiểm tra role của user
- So sánh user.role với required roles từ `@Roles()` decorator
- Throw ForbiddenException nếu role không match

**Cách hoạt động:**

1. Dùng `Reflector` để đọc metadata từ `@Roles()` decorator
2. Nếu không có `@Roles()`, cho phép tất cả authenticated users
3. Lấy user.role từ request (được set bởi JwtStrategy)
4. So sánh user.role với required roles
5. Nếu match → allow, nếu không → throw ForbiddenException

**Ví dụ sử dụng:**

```typescript
import { RolesGuard } from 'src/modules/auth/guards';
import { Roles, Role } from 'src/common/decorator';

@Controller('admin')
export class AdminController {
  // ✅ Chỉ ADMIN mới được xóa user
  @Delete(':id')
  @UseGuards(MyJwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  deleteUser(@Param('id') id: number) {
    return this.userService.delete(id);
  }

  // ✅ ADMIN hoặc MODERATOR được phép
  @Get('dashboard')
  @UseGuards(MyJwtGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  dashboard() {
    return this.adminService.getDashboard();
  }

  // ✅ Tất cả authenticated users được phép (không cần @Roles)
  @Get('profile')
  @UseGuards(MyJwtGuard)
  getProfile(@UserData() user: User) {
    return user;
  }
}
```

**Lưu ý quan trọng:**

- RolesGuard phải dùng **với** JwtGuard
- Thứ tự: `@UseGuards(MyJwtGuard, RolesGuard)` - JWT trước, role sau
- User phải authenticate (có JWT token) trước khi check role
- `@Roles()` là tùy chọn - nếu không có, tất cả authenticated users được phép
- Role được define trong Prisma schema `enum Role { USER, ADMIN, MODERATOR }`

**Error Messages:**

```
Bạn cần đăng nhập để truy cập           → User chưa authenticate
User không có role được gán              → User.role = null
Bạn cần có role ADMIN hoặc MODERATOR    → Role không match
```

---

## 12. Decorator Placement - Thứ Tự Đặt Decorator

**Đúng cách (từ trên xuống):**

```typescript
@Get(':id')
@UseGuards(MyJwtGuard, RolesGuard)      // 1️⃣ Guards - Kiểm tra quyền
@Roles(Role.ADMIN)                      // 2️⃣ Metadata - Role required
@Cache({ ttl: 3600 })                   // 3️⃣ Metadata - Cache
@RateLimit({ max: 10, windowMs: 60000 }) // 4️⃣ Metadata - Rate limit
async getUser(
  @Param('id') id: string,              // 5️⃣ Parameters - URL params
  @UserData() user: User,               // 5️⃣ Parameters - User data
  @Query() query: QueryDto,             // 5️⃣ Parameters - Query string
) {
  return user;
}
```

**Quy tắc:**

- Method decorators (HTTP methods) ở trên cùng
- Guards → Metadata → Parameters (từ trên xuống)
- Guards kiểm tra quyền **trước** các decorator khác
- Parameters decorators **không có thứ tự** (tất cả là parameter)

---

## 13. Common Patterns & Best Practices

### Pattern 1: Public vs Protected Routes

```typescript
// Public route - không cần JWT
@Post('login')
@IsPublic()  // Bỏ qua JwtGuard check
login(@Body() authDto: AuthDto) {
  return this.authService.login(authDto);
}

// Protected route - cần JWT
@Get('profile')
@UseGuards(MyJwtGuard)
getProfile(@UserData() user: User) {
  return user;
}

// Admin only
@Delete(':id')
@UseGuards(MyJwtGuard, RolesGuard)
@Roles(Role.ADMIN)
delete(@Param('id') id: number) {
  return this.service.delete(id);
}
```

### Pattern 2: Rate Limiting Sensitive Endpoints

```typescript
// Brute force protection
@Post('login')
@RateLimit({ max: 5, windowMs: 60000 })  // 5 tries per minute
login(@Body() authDto: AuthDto) {
  return this.authService.login(authDto);
}

// Send OTP
@Post('send-otp')
@RateLimit({ max: 3, windowMs: 300000 })  // 3 times per 5 minutes
sendOtp(@Body() body: SendOtpDto) {
  return this.authService.sendOtp(body);
}
```

### Pattern 3: Caching Read-Only Endpoints

```typescript
// Cache popular data
@Get('popular-books')
@Cache({ ttl: 3600, key: 'popular-books' })  // Cache 1 hour
getPopularBooks() {
  return this.bookService.getPopular();
}

// Cache categories
@Get('categories')
@Cache({ ttl: 86400 })  // Cache 1 day
getCategories() {
  return this.categoryService.getAll();
}
```

---

## 14. Update AuthModule (Sau Khi Tạo RolesGuard)

```typescript
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './stratery/jwt.strategy';
import { RolesGuard } from './guards/roles.guard'; // ✅ Import
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RolesGuard, // ✅ Thêm vào providers
    PrismaService,
  ],
  exports: [
    AuthService,
    PassportModule,
    JwtModule,
    RolesGuard, // ✅ Export để modules khác dùng
  ],
})
export class AuthModule {}
```

---

## 15. Checklist Complete Setup

- [x] Cài đặt packages (JWT, Passport)
- [x] Thêm JWT_SECRET vào .env
- [x] Tạo JwtStrategy
- [x] Tạo JwtAuthGuard (MyJwtGuard)
- [x] Tạo Decorators (UserData, IsPublic, Roles, RateLimit, Cache)
- [x] Tạo RolesGuard
- [ ] Update AuthModule để export RolesGuard
- [ ] Tạo CacheInterceptor (tùy chọn)
- [ ] Tạo RateLimitInterceptor (tùy chọn)
- [ ] Test các guards + decorators
- [ ] Update Prisma schema với Role enum
- [ ] Test login + protected endpoints
