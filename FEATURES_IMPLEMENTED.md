# 📚 BookNest - Chức Năng Đã Hoàn Thành

## 🔐 Authentication & Authorization

- JWT Authentication - `@nestjs/jwt`, `passport-jwt`
- Role-based Access Control (USER, ADMIN, MODERATOR) - Custom Guards & Decorators
- Google OAuth 2.0 Login - `passport-google-oauth20` ✅ _Mới hoàn thành_
- Email Verification - `nodemailer`, JWT tokens
- Forgot Password / Reset Password - `nodemailer`, JWT tokens
- Change Password (authenticated users)
- Auto Cleanup Unverified Users - Scheduled task

## 📦 Core Modules

- User Management (CRUD) - Prisma ORM
- Book Management (CRUD) - Prisma ORM
- Category Management (CRUD) - Prisma ORM
- Rating System - Prisma ORM
- Search History - PostgreSQL

## 🗄️ Database

- PostgreSQL - Primary database
- Prisma ORM - Type-safe database client
- Database Migrations - Prisma Migrate
- Prisma Schema với Enums (Role)

## ⚡ Performance & Optimization

- Redis Caching - Upstash Redis REST API
- Custom Cache Decorator - `@IsCache(key, ttl)`
- Cache Invalidation - `@ClearCache(keys)`
- Cache Interceptor - Automatic GET request caching
- Rate Limiting - `@nestjs/throttler`, custom `@RateLimit` decorator
- Per-endpoint Rate Limit Configuration

## 📁 File Upload

- Image Upload to Cloudinary - `cloudinary` (avatars, book covers) ✅
- PDF Upload to Cloudinary - `cloudinary` (max 10MB) ✅ _Mới hoàn thành_
- File Upload to Supabase Storage - `@supabase/supabase-js` (large files) ✅ _Mới hoàn thành_
- File Validation - MIME type, size limits
- Filename Sanitization - Remove Vietnamese accents

## ✉️ Email System

- Email Service - `nodemailer` with Gmail SMTP
- Email Templates - `handlebars`
- Verification Email - With token link
- Reset Password Email - With token link
- Confirmation Email - After password reset

## 🛡️ Security

- Password Hashing - `bcrypt`
- JWT Token - Access token (1h TTL)
- Input Validation - `class-validator`, `class-transformer`
- Global Exception Filter - Prisma error handling
- Rate Limiting per Endpoint
- Environment Variables - `dotenv`

## 🎨 Code Architecture

- Custom Decorators:
  - `@IsPublic()` - Skip JWT authentication
  - `@Roles(Role.ADMIN)` - Role-based access
  - `@UserData()` - Extract user from request
  - `@IsCache(key, ttl)` - Enable caching
  - `@ClearCache(keys)` - Invalidate cache
  - `@RateLimit({ max, windowMs })` - Custom rate limits
- Custom Guards:
  - `MyJwtGuard` - JWT authentication
  - `RolesGuard` - Role-based authorization
- Custom Interceptors:
  - `CacheInterceptor` - Redis caching
  - `RateLimitInterceptor` - Rate limiting

- Module Structure:
  - Auth Module (register, login, Google OAuth, password management)
  - User Module (CRUD, profile)
  - Book Module (CRUD)
  - Category Module (CRUD)
  - Rating Module (CRUD)
  - Cloudinary Module (image/PDF upload) ✅
  - Supabase Module (file storage) ✅
  - Email Module (mail service)
  - Prisma Module (database)

## 🔧 Development Tools

- TypeScript - Full type safety
- ESLint - Code linting
- Prettier - Code formatting
- NestJS CLI - Code generation
- Prisma Studio - Database GUI

---

**Tổng số chức năng:** 35+ features
**Công nghệ chính:** NestJS, PostgreSQL, Prisma, Redis, Cloudinary, Supabase, Google OAuth
**Ngày cập nhật:** 02-02-2026
