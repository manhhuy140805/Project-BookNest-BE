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
  ADMIN = 'ADMIN',
  USER = 'USER',
  MODERATOR = 'MODERATOR',
}

export const ROLES_KEY = 'roles';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
