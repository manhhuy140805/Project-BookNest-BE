# Hướng dẫn cấu hình Email cho BookNest

## 📧 Thiết lập Email Service

Dự án BookNest sử dụng **@nestjs-modules/mailer** và **Nodemailer** để gửi email xác thực cho người dùng.

## 🔧 Cấu hình Gmail SMTP

### Bước 1: Tạo App Password cho Gmail

1. Đăng nhập vào tài khoản Google của bạn
2. Truy cập: https://myaccount.google.com/security
3. Bật **2-Step Verification** (nếu chưa bật)
4. Sau khi bật 2FA, quay lại Security settings
5. Tìm và click vào **App passwords**
6. Chọn app: **Mail**
7. Chọn device: **Other (Custom name)** → nhập "BookNest"
8. Click **Generate**
9. Copy mã 16 ký tự được tạo ra (ví dụ: `abcd efgh ijkl mnop`)

### Bước 2: Cập nhật file .env

Mở file `.env` và cập nhật các giá trị sau:

```env
# Email Configuration
MAIL_HOST="smtp.gmail.com"
MAIL_PORT="587"
MAIL_USER="your-email@gmail.com"          # ← Thay bằng email của bạn
MAIL_PASSWORD="abcd efgh ijkl mnop"       # ← Thay bằng App Password vừa tạo
MAIL_FROM="BookNest <noreply@booknest.com>"
APP_URL="http://localhost:8080"           # ← URL của ứng dụng
```

**Lưu ý:**
- `MAIL_USER`: Email Gmail của bạn
- `MAIL_PASSWORD`: App Password (16 ký tự), KHÔNG phải mật khẩu Gmail thông thường
- `APP_URL`: URL của frontend/backend để tạo link xác thực

## 📝 Các API Endpoints

### 1. Đăng ký tài khoản (Tự động gửi email xác thực)
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Nguyễn Văn A"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "Nguyễn Văn A",
  "role": "USER",
  "isVerified": false,
  "isActive": true,
  "message": "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản."
}
```

### 2. Xác thực email
```http
GET /auth/verify-email?token=abc123xyz...
```

**Response:**
```json
{
  "message": "Email đã được xác thực thành công! Bạn có thể đăng nhập ngay."
}
```

### 3. Gửi lại email xác thực
```http
POST /auth/resend-verification
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư."
}
```

## 🎨 Email Templates

Dự án có 3 email templates đẹp mắt:

1. **verification.hbs** - Email xác thực tài khoản
2. **welcome.hbs** - Email chào mừng sau khi xác thực
3. **reset-password.hbs** - Email đặt lại mật khẩu (sẵn sàng cho tương lai)

Tất cả templates đều:
- Responsive design
- Gradient backgrounds đẹp mắt
- Có emoji và icons
- Professional layout

## 🔍 Kiểm tra Email Service

### Test gửi email đăng ký:

```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "fullName": "Test User"
  }'
```

### Kiểm tra email trong hộp thư:
1. Mở email của bạn
2. Tìm email từ "BookNest"
3. Click vào nút "Xác thực Email"
4. Hoặc copy link và paste vào trình duyệt

## 🛠️ Troubleshooting

### Lỗi: "Invalid login: 535-5.7.8 Username and Password not accepted"
- **Nguyên nhân**: Chưa tạo App Password hoặc dùng sai password
- **Giải pháp**: Tạo lại App Password theo hướng dẫn ở trên

### Lỗi: "Connection timeout"
- **Nguyên nhân**: Firewall chặn port 587
- **Giải pháp**: Kiểm tra firewall hoặc thử port 465 (secure: true)

### Email không được gửi nhưng không có lỗi
- **Nguyên nhân**: MAIL_USER hoặc MAIL_PASSWORD sai
- **Giải pháp**: Kiểm tra lại file .env

### Email vào Spam
- **Nguyên nhân**: Gmail chưa tin tưởng sender
- **Giải pháp**: Đánh dấu "Not spam" trong Gmail

## 📊 Database Schema

Các trường liên quan đến email verification trong User model:

```prisma
model User {
  // ... other fields
  
  // Email Verification
  isVerified                Boolean          @default(false)
  verificationToken         String?
  verificationExpires       DateTime?
  
  // ... other fields
}
```

## 🚀 Sử dụng Email Service khác

Nếu muốn dùng email service khác (SendGrid, Mailgun, AWS SES), cập nhật trong `.env`:

### SendGrid:
```env
MAIL_HOST="smtp.sendgrid.net"
MAIL_PORT="587"
MAIL_USER="apikey"
MAIL_PASSWORD="your-sendgrid-api-key"
```

### Mailgun:
```env
MAIL_HOST="smtp.mailgun.org"
MAIL_PORT="587"
MAIL_USER="postmaster@your-domain.mailgun.org"
MAIL_PASSWORD="your-mailgun-password"
```

## 📚 Tài liệu tham khảo

- [NestJS Mailer Documentation](https://nest-modules.github.io/mailer/)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)

---

**Chúc bạn thành công! 🎉**
