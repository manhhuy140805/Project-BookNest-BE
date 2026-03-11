# API Endpoints Documentation - BookNest

Tài liệu này mô tả tất cả các API endpoints có sẵn trong dự án BookNest.

## Base URL
```
http://localhost:3000
```

---

## 📋 Mục lục
- [Root](#root)
- [Authentication](#authentication)
- [Books](#books)
- [Categories](#categories)
- [Cloudinary (Upload)](#cloudinary-upload)
- [Ratings](#ratings)
- [Search](#search)
- [Supabase (PDF Storage)](#supabase-pdf-storage)
- [Users](#users)

---

## Root

### Get Hello
Endpoint kiểm tra server hoạt động.

**Endpoint:** `GET /`

**Authentication:** Public

**Response:**
```json
"Hello World!"
```

---

## Authentication

### 1. Register
Đăng ký tài khoản mới.

**Endpoint:** `POST /auth/register`

**Authentication:** Public

**Rate Limit:** 3 requests/phút

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Nguyễn Văn A"
}
```

**Response:**
```json
{
  "message": "Registration successful. Please check your email to verify your account."
}
```

---

### 2. Login
Đăng nhập vào hệ thống.

**Endpoint:** `POST /auth/login`

**Authentication:** Public

**Rate Limit:** 5 requests/phút

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "role": "USER"
  }
}
```

---

### 3. Get Current User
Lấy thông tin người dùng hiện tại.

**Endpoint:** `GET /auth/me`

**Authentication:** Required (Bearer Token)

**Cache:** 1 hour

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "Nguyễn Văn A",
  "role": "USER",
  "avatarUrl": "https://...",
  "isEmailVerified": true
}
```

---

### 4. Change Password
Thay đổi mật khẩu.

**Endpoint:** `POST /auth/change-password`

**Authentication:** Required (Bearer Token)

**Rate Limit:** 5 requests/phút

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

---

### 5. Verify Email
Xác thực email qua token.

**Endpoint:** `GET /auth/verify-email?token={verification_token}`

**Authentication:** Public

**Rate Limit:** 10 requests/phút

**Query Parameters:**
- `token`: Verification token từ email

**Response:**
```json
{
  "message": "Email verified successfully"
}
```

---

### 6. Resend Verification Email
Gửi lại email xác thực.

**Endpoint:** `POST /auth/resend-verification`

**Authentication:** Public

**Rate Limit:** 3 requests/5 phút

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Verification email sent"
}
```

---

### 7. Forgot Password
Yêu cầu reset mật khẩu.

**Endpoint:** `POST /auth/forgot-password`

**Authentication:** Public

**Rate Limit:** 3 requests/5 phút

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset email sent"
}
```

---

### 8. Reset Password
Reset mật khẩu với token.

**Endpoint:** `POST /auth/reset-password`

**Authentication:** Public

**Rate Limit:** 5 requests/phút

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

---

### 9. Cleanup Unverified Users
Xóa các tài khoản chưa xác thực (Admin only).

**Endpoint:** `POST /auth/cleanup-unverified`

**Authentication:** Required (Admin role)

**Response:**
```json
{
  "message": "Cleanup completed",
  "deletedCount": 5
}
```

---

### 10. Google Login
Đăng nhập bằng Google (redirect).

**Endpoint:** `GET /auth/google`

**Authentication:** Public

**Note:** Endpoint này sẽ redirect đến Google OAuth

---

### 11. Google Callback
Callback sau khi đăng nhập Google.

**Endpoint:** `GET /auth/google/callback`

**Authentication:** Public

**Note:** Endpoint này sẽ redirect về frontend với access_token

---

### 12. Google Token Login
Đăng nhập bằng Google token.

**Endpoint:** `POST /auth/google/token`

**Authentication:** Public

**Request Body:**
```json
{
  "googleId": "google_user_id",
  "email": "user@gmail.com",
  "fullName": "Nguyễn Văn A",
  "avatarUrl": "https://..."
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 13. Refresh Token
Làm mới access token.

**Endpoint:** `POST /auth/refresh`

**Authentication:** Public

**Rate Limit:** 10 requests/phút

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "access_token": "new_access_token",
  "refresh_token": "new_refresh_token"
}
```

---

### 14. Logout
Đăng xuất (revoke refresh token).

**Endpoint:** `POST /auth/logout`

**Authentication:** Public

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

### 15. Logout All Devices
Đăng xuất khỏi tất cả thiết bị.

**Endpoint:** `POST /auth/logout-all`

**Authentication:** Required (Bearer Token)

**Response:**
```json
{
  "message": "Logged out from all devices"
}
```

---

## Books

### 1. Create Book
Tạo sách mới (Admin only).

**Endpoint:** `POST /book/create`

**Authentication:** Required (Admin role)

**Request Body:**
```json
{
  "title": "Tên sách",
  "author": "Tác giả",
  "description": "Mô tả sách",
  "categoryId": 1,
  "imageUrl": "https://...",
  "pdfUrl": "https://...",
  "publishedYear": 2024,
  "pageCount": 300
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Tên sách",
  "author": "Tác giả",
  "description": "Mô tả sách",
  "categoryId": 1,
  "imageUrl": "https://...",
  "pdfUrl": "https://...",
  "publishedYear": 2024,
  "pageCount": 300,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 2. Get All Books
Lấy danh sách tất cả sách.

**Endpoint:** `GET /book`

**Authentication:** Public

**Cache:** 10 phút

**Response:**
```json
[
  {
    "id": 1,
    "title": "Tên sách",
    "author": "Tác giả",
    "description": "Mô tả sách",
    "categoryId": 1,
    "imageUrl": "https://...",
    "pdfUrl": "https://...",
    "publishedYear": 2024,
    "pageCount": 300,
    "averageRating": 4.5,
    "totalRatings": 10
  }
]
```

---

### 3. Get Book By ID
Lấy thông tin chi tiết sách theo ID.

**Endpoint:** `GET /book/id/:id`

**Authentication:** Public

**Cache:** 10 phút

**Parameters:**
- `id`: Book ID

**Response:**
```json
{
  "id": 1,
  "title": "Tên sách",
  "author": "Tác giả",
  "description": "Mô tả sách",
  "categoryId": 1,
  "category": {
    "id": 1,
    "name": "Văn học"
  },
  "imageUrl": "https://...",
  "pdfUrl": "https://...",
  "publishedYear": 2024,
  "pageCount": 300,
  "averageRating": 4.5,
  "totalRatings": 10,
  "ratings": [...]
}
```

---

### 4. Update Book
Cập nhật thông tin sách (Admin only).

**Endpoint:** `PUT /book/update/:id`

**Authentication:** Required (Admin role)

**Parameters:**
- `id`: Book ID

**Request Body:**
```json
{
  "title": "Tên sách mới",
  "author": "Tác giả mới",
  "description": "Mô tả mới"
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Tên sách mới",
  "author": "Tác giả mới",
  "description": "Mô tả mới",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 5. Delete Book
Xóa sách (Admin only).

**Endpoint:** `DELETE /book/delete/:id`

**Authentication:** Required (Admin role)

**Parameters:**
- `id`: Book ID

**Response:**
```json
{
  "message": "Book deleted successfully"
}
```

---

### 6. Search Books
Tìm kiếm sách.

**Endpoint:** `GET /book/search`

**Authentication:** Public (Optional - để lưu lịch sử tìm kiếm)

**Query Parameters:**
- `keyword`: Từ khóa tìm kiếm (optional)
- `categoryId`: ID danh mục (optional)
- `page`: Số trang (default: 1)
- `limit`: Số lượng/trang (default: 10)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Tên sách",
      "author": "Tác giả",
      "imageUrl": "https://...",
      "averageRating": 4.5
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

---

## Categories

### 1. Get All Categories
Lấy danh sách tất cả danh mục.

**Endpoint:** `GET /category`

**Authentication:** Public

**Cache:** 1 hour

**Response:**
```json
[
  {
    "id": 1,
    "name": "Văn học",
    "bookCount": 50
  },
  {
    "id": 2,
    "name": "Khoa học",
    "bookCount": 30
  }
]
```

---

### 2. Get Category By ID
Lấy thông tin danh mục theo ID.

**Endpoint:** `GET /category/:id`

**Authentication:** Public

**Cache:** 1 hour

**Parameters:**
- `id`: Category ID

**Response:**
```json
{
  "id": 1,
  "name": "Văn học",
  "books": [
    {
      "id": 1,
      "title": "Tên sách",
      "author": "Tác giả"
    }
  ]
}
```

---

### 3. Create Category
Tạo danh mục mới (Admin/Moderator only).

**Endpoint:** `POST /category`

**Authentication:** Required (Admin/Moderator role)

**Request Body:**
```json
{
  "name": "Danh mục mới"
}
```

**Response:**
```json
{
  "id": 3,
  "name": "Danh mục mới"
}
```

---

### 4. Update Category
Cập nhật danh mục (Admin/Moderator only).

**Endpoint:** `PUT /category/:id`

**Authentication:** Required (Admin/Moderator role)

**Parameters:**
- `id`: Category ID

**Request Body:**
```json
{
  "name": "Tên danh mục mới"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Tên danh mục mới"
}
```

---

### 5. Delete Category
Xóa danh mục (Admin/Moderator only).

**Endpoint:** `DELETE /category/:id`

**Authentication:** Required (Admin/Moderator role)

**Parameters:**
- `id`: Category ID

**Response:**
```json
{
  "message": "Category deleted successfully"
}
```

---

## Cloudinary (Upload)

### 1. Upload Image
Upload ảnh lên Cloudinary.

**Endpoint:** `POST /cloudinary/image`

**Authentication:** Required (Bearer Token)

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file`: Image file
- `folder`: Folder name (optional, default: "booknest")

**Response:**
```json
{
  "url": "https://res.cloudinary.com/.../image.jpg",
  "publicId": "booknest/abc123"
}
```

---

### 2. Delete Image
Xóa ảnh từ Cloudinary.

**Endpoint:** `DELETE /cloudinary/image`

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "publicId": "booknest/abc123"
}
```

**Response:**
```json
{
  "message": "Image deleted successfully",
  "result": "ok"
}
```

---

### 3. Upload PDF
Upload file PDF lên Cloudinary.

**Endpoint:** `POST /cloudinary/pdf`

**Authentication:** Required (Bearer Token)

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file`: PDF file
- `folder`: Folder name (optional, default: "booknest/pdfs")

**Response:**
```json
{
  "url": "https://res.cloudinary.com/.../file.pdf",
  "publicId": "booknest/pdfs/abc123",
  "format": "pdf",
  "bytes": 1024000
}
```

---

### 4. Delete PDF
Xóa file PDF từ Cloudinary.

**Endpoint:** `DELETE /cloudinary/pdf`

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "publicId": "booknest/pdfs/abc123"
}
```

**Response:**
```json
{
  "message": "PDF deleted successfully",
  "result": "ok"
}
```

---

## Ratings

### 1. Get All Ratings
Lấy tất cả đánh giá.

**Endpoint:** `GET /rating`

**Authentication:** Required (Bearer Token)

**Cache:** 5 phút

**Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "bookId": 1,
    "rating": 5,
    "comment": "Sách hay!",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "user": {
      "fullName": "Nguyễn Văn A"
    }
  }
]
```

---

### 2. Get Rating By ID
Lấy đánh giá theo ID.

**Endpoint:** `GET /rating/:id`

**Authentication:** Required (Bearer Token)

**Cache:** 5 phút

**Parameters:**
- `id`: Rating ID

**Response:**
```json
{
  "id": 1,
  "userId": 1,
  "bookId": 1,
  "rating": 5,
  "comment": "Sách hay!",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 3. Get Ratings By Book
Lấy tất cả đánh giá của một cuốn sách.

**Endpoint:** `GET /rating/book/:bookId`

**Authentication:** Required (Bearer Token)

**Cache:** 3 phút

**Parameters:**
- `bookId`: Book ID

**Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "rating": 5,
    "comment": "Sách hay!",
    "user": {
      "fullName": "Nguyễn Văn A",
      "avatarUrl": "https://..."
    }
  }
]
```

---

### 4. Get Ratings By User
Lấy tất cả đánh giá của một người dùng.

**Endpoint:** `GET /rating/user/:userId`

**Authentication:** Required (Bearer Token)

**Cache:** 3 phút

**Parameters:**
- `userId`: User ID

**Response:**
```json
[
  {
    "id": 1,
    "bookId": 1,
    "rating": 5,
    "comment": "Sách hay!",
    "book": {
      "title": "Tên sách",
      "imageUrl": "https://..."
    }
  }
]
```

---

### 5. Create Rating
Tạo đánh giá mới.

**Endpoint:** `POST /rating`

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "bookId": 1,
  "rating": 5,
  "comment": "Sách rất hay!"
}
```

**Response:**
```json
{
  "id": 1,
  "userId": 1,
  "bookId": 1,
  "rating": 5,
  "comment": "Sách rất hay!",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 6. Update Rating
Cập nhật đánh giá.

**Endpoint:** `PUT /rating/:id`

**Authentication:** Required (Bearer Token)

**Parameters:**
- `id`: Rating ID

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Sách hay nhưng hơi dài"
}
```

**Response:**
```json
{
  "id": 1,
  "rating": 4,
  "comment": "Sách hay nhưng hơi dài",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 7. Delete Rating
Xóa đánh giá.

**Endpoint:** `DELETE /rating/:id`

**Authentication:** Required (Bearer Token)

**Parameters:**
- `id`: Rating ID

**Response:**
```json
{
  "message": "Rating deleted successfully"
}
```

---

## Search

### 1. Get Search History
Lấy lịch sử tìm kiếm của người dùng.

**Endpoint:** `GET /search/history`

**Authentication:** Required (Bearer Token)

**Cache:** 5 phút

**Response:**
```json
[
  {
    "id": 1,
    "keyword": "văn học",
    "resultCount": 25,
    "searchedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 2. Get Search Suggestions
Lấy gợi ý tìm kiếm.

**Endpoint:** `GET /search/suggestions?q={keyword}`

**Authentication:** Public

**Cache:** 10 phút

**Query Parameters:**
- `q`: Từ khóa tìm kiếm

**Response:**
```json
[
  "văn học việt nam",
  "văn học nước ngoài",
  "văn học hiện đại"
]
```

---

### 3. Get Trending Searches
Lấy các từ khóa tìm kiếm phổ biến.

**Endpoint:** `GET /search/trending`

**Authentication:** Public

**Cache:** 30 phút

**Response:**
```json
[
  {
    "keyword": "văn học",
    "count": 150
  },
  {
    "keyword": "khoa học",
    "count": 120
  }
]
```

---

### 4. Clear Search History
Xóa toàn bộ lịch sử tìm kiếm.

**Endpoint:** `POST /search/clear-history`

**Authentication:** Required (Bearer Token)

**Response:**
```json
{
  "message": "Search history cleared"
}
```

---

### 5. Delete Search Item
Xóa một mục trong lịch sử tìm kiếm.

**Endpoint:** `DELETE /search/history/:id`

**Authentication:** Required (Bearer Token)

**Parameters:**
- `id`: Search history ID

**Response:**
```json
{
  "message": "Search item deleted"
}
```

---

## Supabase (PDF Storage)

### 1. Upload PDF
Upload file PDF lên Supabase Storage.

**Endpoint:** `POST /supabase/pdf`

**Authentication:** Required (Bearer Token)

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file`: PDF file
- `folder`: Folder name (optional)

**Response:**
```json
{
  "url": "https://supabase.co/storage/.../file.pdf",
  "path": "pdfs/abc123.pdf"
}
```

---

### 2. Delete PDF
Xóa file PDF từ Supabase Storage.

**Endpoint:** `DELETE /supabase/pdf`

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "path": "pdfs/abc123.pdf"
}
```

**Response:**
```json
{
  "message": "PDF deleted successfully"
}
```

---

## Users

### 1. Get All Users
Lấy danh sách tất cả người dùng (Admin only).

**Endpoint:** `GET /user`

**Authentication:** Required (Admin role)

**Cache:** 1 hour

**Response:**
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "role": "USER",
    "isEmailVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 2. Get User By ID
Lấy thông tin người dùng theo ID (Admin only).

**Endpoint:** `GET /user/id/:id`

**Authentication:** Required (Admin role)

**Cache:** 1 hour

**Parameters:**
- `id`: User ID

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "Nguyễn Văn A",
  "role": "USER",
  "avatarUrl": "https://...",
  "isEmailVerified": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 3. Create User
Tạo người dùng mới (Admin only).

**Endpoint:** `POST /user/create`

**Authentication:** Required (Admin role)

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "fullName": "Nguyễn Văn B",
  "role": "USER"
}
```

**Response:**
```json
{
  "id": 2,
  "email": "newuser@example.com",
  "fullName": "Nguyễn Văn B",
  "role": "USER"
}
```

---

### 4. Update User
Cập nhật thông tin người dùng (Admin only).

**Endpoint:** `PUT /user/update/:id`

**Authentication:** Required (Admin role)

**Parameters:**
- `id`: User ID

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn C",
  "role": "MODERATOR"
}
```

**Response:**
```json
{
  "id": 1,
  "fullName": "Nguyễn Văn C",
  "role": "MODERATOR",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 5. Delete User
Xóa người dùng (Admin only).

**Endpoint:** `DELETE /user/remove/:id`

**Authentication:** Required (Admin role)

**Parameters:**
- `id`: User ID

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

---

### 6. Add Favorite Book
Thêm sách vào danh sách yêu thích.

**Endpoint:** `POST /user/favorite/add/:bookId`

**Authentication:** Required (Bearer Token)

**Parameters:**
- `bookId`: Book ID

**Response:**
```json
{
  "message": "Book added to favorites"
}
```

---

### 7. Remove Favorite Book
Xóa sách khỏi danh sách yêu thích.

**Endpoint:** `DELETE /user/favorite/remove/:bookId`

**Authentication:** Required (Bearer Token)

**Parameters:**
- `bookId`: Book ID

**Response:**
```json
{
  "message": "Book removed from favorites"
}
```

---

### 8. Get Favorite Books
Lấy danh sách sách yêu thích.

**Endpoint:** `GET /user/favoriteBoks`

**Authentication:** Required (Bearer Token)

**Cache:** 2 phút

**Response:**
```json
[
  {
    "id": 1,
    "title": "Tên sách",
    "author": "Tác giả",
    "imageUrl": "https://...",
    "averageRating": 4.5
  }
]
```

---

### 9. Search Users
Tìm kiếm người dùng (Admin only).

**Endpoint:** `GET /user/search`

**Authentication:** Required (Admin role)

**Query Parameters:**
- `keyword`: Từ khóa tìm kiếm (optional)
- `role`: Vai trò (USER/ADMIN/MODERATOR) (optional)
- `page`: Số trang (default: 1)
- `limit`: Số lượng/trang (default: 10)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "fullName": "Nguyễn Văn A",
      "role": "USER"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

---

## 🔐 Authentication

Hầu hết các endpoint yêu cầu authentication. Sử dụng Bearer Token trong header:

```
Authorization: Bearer {access_token}
```

## 📝 Response Format

### Success Response
```json
{
  "data": {...},
  "message": "Success message"
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

## 🎭 User Roles

- **USER**: Người dùng thông thường
- **MODERATOR**: Người kiểm duyệt (có thể quản lý categories)
- **ADMIN**: Quản trị viên (toàn quyền)

## ⚡ Rate Limiting

Một số endpoint có giới hạn số lượng request:
- Register: 3 requests/phút
- Login: 5 requests/phút
- Forgot Password: 3 requests/5 phút
- Resend Verification: 3 requests/5 phút
- Change Password: 5 requests/phút
- Verify Email: 10 requests/phút
- Reset Password: 5 requests/phút
- Refresh Token: 10 requests/phút

## 💾 Caching

Nhiều endpoint sử dụng Redis cache để tối ưu hiệu suất:
- Categories: 1 hour
- Books: 10 phút
- Ratings: 3-5 phút
- Search: 5-30 phút
- Users: 1 hour

---

**Lưu ý:** 
- Tất cả các endpoint trả về JSON
- Timestamps theo format ISO 8601
- Pagination sử dụng `page` và `limit` query parameters
- File upload sử dụng `multipart/form-data`
