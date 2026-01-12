import { SetMetadata } from '@nestjs/common';

/**
 * Decorator để đánh dấu route là PUBLIC (không cần JWT)
 *
 * Mặc định tất cả routes được bảo vệ bởi JwtGuard
 * Decorator này giúp bỏ qua JWT check cho các route public (login, register, etc)
 *
 * Ví dụ:
 * @Post('login')
 * @IsPublic()
 * login(@Body() authDto: AuthDto) {
 *   return this.authService.login(authDto);
 * }
 *
 * Cách sử dụng trong Guard:
 * - Dùng Reflector để check metadata
 * - Nếu isPublic = true, cho phép request
 * - Nếu không, check JWT như bình thường
 */

// Tên key để lưu metadata
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Hàm decorator
 * SetMetadata sẽ gắn metadata vào handler (method)
 * Sau đó Guard sẽ đọc metadata này bằng Reflector
 */
export const IsPublic = () => SetMetadata(IS_PUBLIC_KEY, true);
