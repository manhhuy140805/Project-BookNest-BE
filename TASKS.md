# BookNest - Project Tasks

## 📋 Mô tả

Hệ thống quản lý sách với chức năng đánh giá, yêu thích và phân quyền.

---

## 🎯 Task 1: Setup Project

- [x] Setup cơ bản như đã học

---

## 🔐 Task 2: Authentication Module

- [x] Tạo AuthModule + AuthService + AuthController
- [x] Register: hash password (bcrypt), lưu DB, xử lý duplicate email
- [x] Login: verify password, generate JWT token
- [x] Tạo JwtStrategy + JwtAuthGuard
- [x] Endpoint `GET /auth/me` (protected)

---

## 👤 Task 3: User Module

- [x] CRUD User (findAll, findOne, update, remove, create)
- [x] Update profile (fullName, bio, avatarUrl, dateOfBirth)
- [ ] Favorite books (add, remove, list)

---

## 📚 Task 4: Book Module

- [ ] CRUD Book (create, findAll, findOne, update, remove)
- [ ] Search & filter (title, author, category)
- [ ] Pagination & sort
- [ ] Calculate average rating

---

## 🏷️ Task 5: Category Module

- [ ] CRUD Category (create, findAll, findOne, update, remove)
- [ ] Get books by category

---

## ⭐ Task 6: Rating Module

- [ ] Create rating (1-5 sao, 1 user/book chỉ rate 1 lần)
- [ ] Update/delete own rating
- [ ] Get ratings by book/user

---

## 🛡️ Task 7: Authorization (Roles)

- [ ] Tạo enum Role (USER, ADMIN, MODERATOR) trong schema
- [ ] Custom decorator `@Roles()`
- [ ] Tạo RolesGuard (combine với JwtAuthGuard)
- [ ] Apply: ADMIN quản lý Book/Category, USER quản lý rating riêng

---

## ✅ Task 8: Validation & Error Handling

- [ ] Setup Global ValidationPipe trong `main.ts`
- [ ] Validation DTO với class-validator
- [ ] Tạo PrismaExceptionFilter (xử lý P2002, P2025, P2003)

---

## 🚀 Bonus (Optional)

- [ ] Swagger documentation
- [ ] Full-text search
- [ ] Caching (Redis)
- [ ] File upload (avatar, book cover)
- [ ] Email verification
- [ ] Rate limiting
- [ ] Unit tests
- [ ] Docker compose

---

## 📚 Tech Stack

- NestJS + TypeScript
- PostgreSQL + Prisma
- JWT (Passport)
- bcrypt + class-validator
- [ ] Đăng ký global exception filter

---

## 🚀 Bonus Tasks

- [ ] Implement refresh token
- [ ] Email verification
- [ ] Password reset
- [ ] Rate limiting
- [ ] Logging (Winston)
- [ ] Health check endpoint
- [ ] CI/CD pipeline

---

## 📚 Tech Stack

- **Framework:** NestJS
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (Passport)
- **Validation:** class-validator
- **Password:** bcrypt

**Good luck & Happy coding! 🚀**
