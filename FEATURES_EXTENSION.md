# 📚 BookNest - Danh Sách Chức Năng Mở Rộng

## 🎯 Tổng Quan

File này liệt kê những chức năng có trong dự án BookNest.

---

## ✅ Chức Năng Đã Có

- ✔️ Quản lý sách (CRUD)
- ✔️ Phân loại sách (Categories)
- ✔️ Đánh giá sách (Ratings)
- ✔️ Quản lý người dùng (User Management)
- ✔️ Xác thực JWT (Authentication)
- ✔️ Phân quyền (Role-based Authorization)
- ✔️ Yêu thích sách (Favorite Books)
- ✔️ Hồ sơ người dùng cơ bản

---

## 🚀 Chức Năng Cần Thêm

### 1. **Full-Text Search** ⭐ CAO ÚU TIÊN

**Mô tả:** Tìm kiếm sách theo tiêu đề, tác giả với kết quả chính xác cao

**Công nghệ:**

- PostgreSQL Full-Text Search (FTS)

**API Endpoints:**

```
GET /books/search?q=keyword
GET /books/search?q=keyword&category=1&minRating=4&sort=rating
```

**Database:**

- Thêm index FTS cho `Book` (title, author)
- Query dùng `@@ plainto_tsquery()` hoặc `websearch_to_tsquery()`

---

### 2. **Caching (Redis)** ⭐ TRUNG BÌNH ÚU TIÊN

**Mô tả:** Cache dữ liệu hot (top books, categories) để tăng tốc độ

**Công nghệ:**

- Redis
- `@nestjs/cache-manager`
- `redis` package

**Tính năng:**

- Cache danh sách sách: 5 phút
- Cache danh mục: 10 phút
- Cache top books: 1 giờ
- Clear cache khi có update

**API:**

- Tất cả GET endpoints được cache tự động
- `DELETE /cache/clear` - Clear toàn bộ cache (ADMIN only)

---

### 3. **File Upload (Avatar, Book Cover)** ⭐ CAO ÚU TIÊN

**Mô tả:** Upload ảnh avatar người dùng, cover sách lên Cloudinary

**Công nghệ:**

- Cloudinary
- `multer` (xử lý upload)

**API Endpoints:**

```
POST   /users/:id/avatar              - Upload avatar
POST   /books/:id/cover               - Upload cover sách
DELETE /users/:id/avatar              - Xóa avatar
DELETE /books/:id/cover               - Xóa cover
```

**Validation:**

- File size: < 5MB
- Format: JPG, PNG, WebP
- MIME type validation

**Schema Update:**

```prisma
model User {
  // existing fields
  avatarUrl String?  // đã có sẵn
  avatarCloudinaryId String?  // ID để delete
}

model Book {
  // existing fields
  coverUrl String?
  coverCloudinaryId String?
}
```

---

### 5. **Upload PDF to Google Drive for Books** ⭐ CAO ÚU TIÊN

**Mô tả:** Tải lên file PDF sách lên Google Drive, lưu link và quản lý file

**Công nghệ:**

- Google Drive API
- `@googleapis/drive`
- `googleapis`
- `multer` (xử lý upload)

**API Endpoints:**

```
POST   /books/:id/pdf/upload           - Tải lên PDF lên Google Drive
GET    /books/:id/pdf/download         - Tải về PDF
DELETE /books/:id/pdf                  - Xóa PDF
GET    /books/pdf/storage-usage        - Kiểm tra dung lượng đã dùng
```

**Validation:**

- File size: < 50MB
- Format: PDF only
- MIME type: application/pdf
- Quyền: Chỉ ADMIN & chủ sách

**Schema Update:**

```prisma
model Book {
  // existing fields
  pdfUrl           String?             // Link Google Drive (webViewLink)
  pdfFileId        String?             // Google Drive File ID
  pdfFileName      String?             // Tên file gốc
  pdfSize          Int?                // Dung lượng (bytes)
  pdfUploadedAt    DateTime?           // Thời gian upload
  pdfUploadedBy    Int?                // User ID người upload
}
```

**Quy trình:**

1. User upload PDF → validate format & size
2. Upload lên Google Drive vào folder `BookNest/PDFs/:bookId`
3. Lưu File ID, URL, metadata vào DB
4. Return public link hoặc webViewLink
5. Download: Redirect đến Google Drive hoặc stream file

**Features:**

- Share public link (ai cũng xem được)
- Share with specific users (ADMIN control)
- Track who uploaded
- Soft delete (không xóa từ Drive, chỉ update DB)
- Version control (giữ lịch sử file cũ)

**Environment Variables:**

```env
GOOGLE_DRIVE_FOLDER_ID=your_main_folder_id
GOOGLE_DRIVE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_DRIVE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
GOOGLE_PROJECT_ID=your-project-id
```

**Note:**

- Cần tạo Service Account từ Google Cloud Console
- Enable Google Drive API
- Share folder chính với Service Account (Editor role)
- Mỗi book PDF lưu trong subfolder riêng
- Max 50MB/file, có thể thay đổi theo yêu cầu

---

### 6. **Email Verification** ⭐ CAO ÚU TIÊN

**Mô tả:** Xác minh email khi đăng ký tài khoản

**Công nghệ:**

- `nodemailer` hoặc `SendGrid`
- JWT (token xác minh)

**API Endpoints:**

```
POST   /auth/register               - Đăng ký (gửi email xác minh)
POST   /auth/verify-email           - Xác minh email bằng token
POST   /auth/resend-verification    - Gửi lại email xác minh
```

**Quy trình:**

1. User đăng ký → tạo token JWT có TTL 24h
2. Gửi link xác minh qua email
3. User click link → verify email → enable account
4. Nếu không verify trong 24h → token expire

**Schema Update:**

```prisma
model User {
  // existing fields
  isVerified      Boolean   @default(false)
  verificationToken String?
  verificationExpires DateTime?
}
```

---

### 7. **Rate Limiting** ⭐ TRUNG BÌNH ÚU TIÊN

**Mô tả:** Giới hạn số lượng request để tránh abuse

**Công nghệ:**

- `@nestjs/throttler`
- Redis (backend)

**Tính năng:**

```
Login: 5 requests / 15 minutes
Register: 3 requests / 1 hour
Upload: 10 requests / 1 hour
Search: 100 requests / 1 minute
API General: 1000 requests / 1 hour per IP
```

**Implementation:**

- Global rate limiter middleware
- Custom decorator cho endpoints cần giới hạn khác

---

### 6. **Google OAuth Login** ⭐ CAO ÚU TIÊN

**Mô tả:** Đăng nhập bằng tài khoản Google

**Công nghệ:**

- `@nestjs/passport`
- `passport-google-oauth20`
- `@types/passport-google-oauth20`

**API Endpoints:**

```
GET  /auth/google                - Redirect tới Google OAuth
GET  /auth/google/callback       - OAuth callback
POST /auth/google/token          - Token từ frontend
```

**Schema Update:**

```prisma
model User {
  // existing fields
  googleId      String?   @unique
  googleEmail   String?
}
```

**Quy trình:**

1. Frontend gửi Google access token
2. Backend verify token từ Google
3. Nếu user chưa có → create account
4. Return JWT token

---

### 7. **Change Password via Gmail** ⭐ TRUNG BÌNH ÚU TIÊN

**Mô tả:** Thay đổi mật khẩu qua xác minh email, quên mật khẩu

**Công nghệ:**

- Nodemailer
- JWT (reset token)

**API Endpoints:**

```
POST /auth/forgot-password         - Gửi email reset password
POST /auth/reset-password          - Thay đổi password với token
POST /auth/change-password         - Thay đổi password (authenticated)
```

**Quy trình Quên Mật Khẩu:**

1. User request quên password → gửi email
2. Email chứa link + reset token (TTL 1h)
3. User click link → nhập mật khẩu mới
4. Token expired sau 1 tiếng

**Quy trình Thay Đổi Mật Khẩu:**

1. User đã login request change password
2. Confirm mật khẩu hiện tại
3. Nhập mật khẩu mới
4. Send confirmation email

**Schema Update:**

```prisma
model User {
  // existing fields
  resetPasswordToken String?
  resetPasswordExpires DateTime?
}
```

---

### 8. **Upload Ảnh lên Cloudinary** ⭐ CAO ÚU TIÊN

**Mô tả:** Hỗ trợ upload file ảnh đến Cloudinary (avatar, cover, etc)

**Công nghệ:**

- Cloudinary SDK
- Multer (form-data parsing)

**API Endpoints:**

```
POST /upload/avatar          - Upload avatar
POST /upload/book-cover      - Upload book cover
DELETE /upload/:publicId     - Xóa file
```

**Features:**

- Automatic image optimization
- Different transformations (resize, crop, etc)
- CDN delivery

**Validation:**

- Max file size: 5MB
- Accepted formats: jpg, png, webp, gif
- MIME type validation

**Environment Variables:**

```env
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

---

### 9. **Refresh Token** ⭐ CAO ÚU TIÊN

**Mô tả:** Cấp refresh token có TTL dài để lấy access token mới mà không cần đăng nhập lại

**Công nghệ:**

- JWT (dual token strategy)
- Redis (lưu token blacklist - optional)

**API Endpoints:**

```
POST /auth/refresh           - Lấy access token mới bằng refresh token
POST /auth/logout            - Logout (blacklist refresh token)
```

**Quy trình:**

1. User login → return `accessToken` (TTL 15-30 phút) + `refreshToken` (TTL 7 ngày)
2. Khi access token expire → frontend gửi refresh token tới `/auth/refresh`
3. Backend verify & cấp access token mới
4. Logout → thêm token vào blacklist

**Schema Update:**

```prisma
model User {
  // existing fields
  refreshTokens RefreshToken[]
}

model RefreshToken {
  id        Int     @id @default(autoincrement())
  userId    Int
  token     String  @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

### 10. **Global Error Handling** ⭐ CAO ÚU TIÊN

**Mô tả:** Exception filter toàn cục xử lý tất cả lỗi, response format chuẩn

**Công nghệ:**

- NestJS ExceptionFilter
- class-validator (DTO validation)

**Tính năng:**

- Catch all exceptions (400, 401, 403, 500, etc)
- Standard error response format
- Logging errors
- Custom error messages

**Error Response Format:**

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email must be valid"
    }
  ],
  "timestamp": "2026-01-21T10:00:00.000Z"
}
```

**Implementation:**

- Exception Filter: `src/common/filters/http-exception.filter.ts`
- Validation Pipe: `src/common/pipes/validation.pipe.ts`
- Custom Exceptions: `src/common/exceptions/`
  - `BadRequestException`
  - `UnauthorizedException`
  - `ForbiddenException`
  - `NotFoundException`
  - `ConflictException`

---

### 11. **Two-Factor Authentication (2FA)** ⭐ TRUNG BÌNH ÚU TIÊN

**Mô tả:** Xác minh bổ sung qua Email OTP hoặc Authenticator app

**Công nghệ:**

- `speakeasy` (TOTP generator)
- `qrcode` (QR code generation)
- Nodemailer (Email OTP)

**API Endpoints:**

```
POST   /auth/2fa/enable              - Bật 2FA (generate secret)
POST   /auth/2fa/verify              - Xác minh lần đầu (quét QR code)
POST   /auth/2fa/disable             - Tắt 2FA
POST   /auth/2fa/send-otp            - Gửi OTP qua email
POST   /auth/2fa/verify-otp          - Xác minh OTP
POST   /auth/login-2fa               - Verify OTP sau khi login
```

**Quy trình:**

1. User enable 2FA → generate secret + QR code
2. Quét QR code bằng Authenticator app (Google Auth, Authy)
3. Confirm secret bằng OTP từ app
4. Lần đăng nhập tiếp theo → verify OTP

**Schema Update:**

```prisma
model User {
  // existing fields
  twoFactorEnabled Boolean @default(false)
  twoFactorSecret  String?
  backupCodes      String[]  // Backup codes nếu mất app
}
```

---

### 12. **Database Transactions** ⭐ TRUNG BÌNH ÚU TIÊN

**Mô tả:** Đảm bảo data consistency cho multi-step operations

**Công nghệ:**

- Prisma transactions (`prisma.$transaction()`)
- PostgreSQL ACID properties

**Tính năng:**

- Atomic operations (all or nothing)
- Rollback on error
- Prevent race conditions

**Use Cases:**

- Create book + initial rating
- Transfer favorite books
- Bulk operations

**Implementation:**

```
prisma.$transaction([
  // Step 1
  prisma.book.create(...),
  // Step 2
  prisma.rating.create(...),
  // Nếu có lỗi ở bước 2 → rollback bước 1
])
```

**Modules Cần Update:**

- `book.service.ts` - Transactions cho operations phức tạp
- `user.service.ts` - Transactions cho bulk updates
- `rating.service.ts` - Atomic rating operations

---

### 13. **Search History & Suggestions** ⭐ THẤP ÚU TIÊN

**Mô tả:** Lưu lịch sử tìm kiếm, gợi ý keywords phổ biến

**Công nghệ:**

- Redis (cache suggestions)
- PostgreSQL (store search history)

**API Endpoints:**

```
GET  /search/history                  - Lấy lịch sử tìm kiếm
GET  /search/suggestions?q=keyword    - Auto-suggest keywords
POST /search/clear-history            - Xóa lịch sử
DELETE /search/history/:id            - Xóa 1 lịch sử
```

**Tính năng:**

- Lưu max 50 lịch sử gần nhất per user
- Auto-suggest top 10 popular searches
- Suggestions based on:
  - User's previous searches
  - Global trending searches
  - Category preferences

**Schema Update:**

```prisma
model SearchHistory {
  id        Int     @id @default(autoincrement())
  userId    Int
  query     String
  results   Int     // Số kết quả
  createdAt DateTime @default(now())
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Implementation:**

- Module `search/` mới
- Cache suggestions vào Redis 1 tiếng
- Update trending searches mỗi 6 tiếng

---

## 🗂️ Danh Sách Các Module Cần Tạo/Cập Nhật

### Cần Tạo Module Mới:

- [ ] `upload/` - Xử lý upload file
- [ ] `email/` - Gửi email (verification, reset password)

### Cần Cập Nhật Module Hiện Tại:

- [ ] `auth/` - Thêm refresh token, 2FA, forgot password, reset password, Google OAuth
- [ ] `user/` - Thêm change password, upload avatar, 2FA management
- [ ] `book/` - Thêm upload cover, full-text search, transactions
- [ ] `cache/` - Thêm caching strategy
- [ ] `common/` - Thêm rate limiting guard, global exception filter, validation pipe
- [ ] `rating/` - Thêm transactions

---

## 📦 Dependencies Cần Cài Đặt

```bash
# Email
npm install nodemailer @types/nodemailer

# Google OAuth
npm install @nestjs/passport passport-google-oauth20 @types/passport-google-oauth20

# File Upload
npm install cloudinary multer

# Caching
npm install @nestjs/cache-manager cache-manager redis

# Rate Limiting
npm install @nestjs/throttler

# Config Management
npm install @nestjs/config dotenv

# 2FA
npm install speakeasy qrcode

# Validation
npm install class-validator class-transformer
```

---

## 🎯 Thứ Tự Thực Hiện Gợi Ý

### **Phase 1** (Tuần 1-2) - ⭐ ƯU TIÊN NGAY:

1. Global Error Handling + Validation
2. Refresh Token
3. Email Verification
4. Change Password via Gmail

### **Phase 2** (Tuần 3):

1. Two-Factor Authentication (2FA)
2. File Upload (Avatar, Cover)
3. Database Transactions

### **Phase 3** (Tuần 4):

1. Full-Text Search
2. Search History & Suggestions
3. Caching (Redis)

### **Phase 4** (Tuần 5):

1. Google OAuth Login
2. Rate Limiting

---

## 📋 Checklist Khi Thêm Chức Năng

- [ ] Cập nhật Prisma Schema
- [ ] Tạo migration (`prisma migrate dev --name <name>`)
- [ ] Tạo Entity/DTO
- [ ] Tạo Service
- [ ] Tạo Controller
- [ ] Thêm Guards/Decorators nếu cần
- [ ] Cấu hình .env
- [ ] Viết Unit Tests
- [ ] Test API bằng Postman/Insomnia
- [ ] Viết API Documentation

---

## 🔐 Security Best Practices

1. **Email Verification:**
   - Token TTL: 24 giờ
   - Prevent brute force: Max 5 attempts/hour
   - Hash token trước lưu DB

2. **Password Reset:**
   - Token TTL: 1 giờ
   - 1 token 1 lần dùng
   - Gửi confirmation email sau reset thành công

3. **File Upload:**
   - Validate MIME type (không chỉ extension)
   - Limit file size: 5MB
   - Scan virus (optional)
   - Sanitize filename

4. **Rate Limiting:**
   - Per IP address
   - Per user ID (nếu authenticated)
   - Whitelist some endpoints (health check)

5. **Google OAuth:**
   - Verify token trực tiếp từ Google
   - Validate client_id
   - Xử lý token expired

---

## 🌍 Environment Variables (.env)

```env
# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Google OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=refresh-secret
JWT_REFRESH_EXPIRATION=7d
```

---

## 📖 Tài Liệu Tham Khảo

- [NestJS Docs](https://docs.nestjs.com)
- [Prisma ORM](https://www.prisma.io/docs)
- [Nodemailer](https://nodemailer.com)
- [Passport.js - Google OAuth](http://www.passportjs.org/packages/passport-google-oauth20/)
- [Cloudinary Node.js](https://cloudinary.com/documentation/node_sdk)
- [Redis Caching](https://redis.io)
- [Rate Limiting Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Prevention_Cheat_Sheet.html)

---

**Cập nhật lần cuối:** 21-01-2026
