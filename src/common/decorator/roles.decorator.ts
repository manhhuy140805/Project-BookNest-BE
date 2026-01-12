import { SetMetadata } from '@nestjs/common';

/**
 * Enum định nghĩa các vai trò (roles) trong hệ thống
 *
 * Roles được dùng để kiểm soát quyền truy cập:
 * - ADMIN: Quản trị viên (toàn quyền)
 * - USER: Người dùng bình thường
 * - MODERATOR: Người điều hành (quyền cao hơn user)
 */
export enum Role {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

// Tên key để lưu metadata
export const ROLES_KEY = 'roles';

/**
 * Decorator để đánh dấu role cần thiết cho endpoint
 *
 * Ví dụ:
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
 * Cách hoạt động:
 * 1. Decorator gắn list roles vào metadata
 * 2. RolesGuard đọc metadata
 * 3. So sánh user.role với required roles
 * 4. Nếu match, cho phép; nếu không, reject
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
