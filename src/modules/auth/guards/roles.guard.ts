import { Injectable } from '@nestjs/common';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, ROLES_KEY } from 'src/common/decorator';

/**
 * RolesGuard - Kiểm tra quyền dựa trên role của user
 *
 * Cách hoạt động:
 * 1. Dùng Reflector để đọc metadata từ @Roles() decorator
 * 2. Lấy role của user từ request (được set bởi JwtStrategy)
 * 3. So sánh user.role với required roles
 * 4. Nếu match, cho phép request
 * 5. Nếu không, throw ForbiddenException
 *
 * Ví dụ sử dụng:
 * @Delete(':id')
 * @UseGuards(JwtGuard, RolesGuard)
 * @Roles(Role.ADMIN)
 * deleteUser(@Param('id') id: number) {
 *   return this.userService.delete(id);
 * }
 *
 * @Get('dashboard')
 * @UseGuards(JwtGuard, RolesGuard)
 * @Roles(Role.ADMIN, Role.MODERATOR)  // Multiple roles
 * dashboard() {
 *   return this.adminService.getDashboard();
 * }
 *
 * Lưu ý:
 * - RolesGuard phải dùng với JwtGuard (phải đã authenticate)
 * - Decorator @Roles() là tùy chọn (nếu không có, cho phép tất cả)
 * - request.user được set bởi JwtStrategy.validate()
 */
@Injectable()
export class RolesGuard implements CanActivate {
  // Inject Reflector để đọc metadata
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lấy required roles từ decorator metadata
    // getAllAndOverride tìm metadata ở cả method và class level
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(), // Kiểm tra method decorator
      context.getClass(), // Kiểm tra class decorator
    ]);

    // Nếu không có @Roles() decorator, cho phép request
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Lấy request object
    const request = context.switchToHttp().getRequest();

    // Lấy user từ request (được set bởi JwtStrategy)
    const user = request.user;

    // Nếu user không tồn tại, reject
    if (!user) {
      throw new ForbiddenException('Bạn cần đăng nhập để truy cập');
    }

    // Nếu user không có role, reject
    if (!user.role) {
      throw new ForbiddenException('User không có role được gán');
    }

    // Kiểm tra user.role có trong required roles không
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Bạn cần có role ${requiredRoles.join(' hoặc ')} để truy cập`,
      );
    }

    // Role hợp lệ, cho phép request
    return true;
  }
}
