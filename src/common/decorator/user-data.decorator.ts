import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator để extract User data từ request (advanced)
 *
 * Có 3 cách dùng:
 * 1. @UserData() - Lấy toàn bộ user object
 * 2. @UserData('id') - Lấy user.id
 * 3. @UserData('email') - Lấy user.email
 *
 * Ưu điểm so với @getUser():
 * - Có thể lấy một property cụ thể (không cần destructure)
 * - Giảm boilerplate code
 * - Type-safe nếu dùng đúng
 *
 * Ví dụ:
 * @Get('profile')
 * getProfile(
 *   @UserData() user: User,           // Lấy toàn bộ
 *   @UserData('id') userId: number,   // Chỉ lấy id
 *   @UserData('email') email: string  // Chỉ lấy email
 * ) {
 *   return { user, userId, email };
 * }
 *
 * @Get('my-books')
 * getMyBooks(@UserData('id') userId: number) {
 *   return this.bookService.findByUserId(userId);
 * }
 *
 * Cách hoạt động:
 * 1. NestJS gọi hàm decorator với data = 'id' (hoặc undefined)
 * 2. Lấy request từ ExecutionContext
 * 3. Extract request.user
 * 4. Nếu data được cung cấp, lấy user[data]
 * 5. Nếu không, trả về toàn bộ user object
 */
export const UserData = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (data) {
      return user?.[data];
    }
    return user;
  },
);
