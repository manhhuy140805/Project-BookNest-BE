import { Injectable } from '@nestjs/common';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, ROLES_KEY } from 'src/common/decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(), // Kiểm tra method decorator
      context.getClass(), // Kiểm tra class decorator
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Bạn cần đăng nhập để truy cập');
    }

    if (!user.role) {
      throw new ForbiddenException('User không có role được gán');
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Bạn cần có role ${requiredRoles.join(' hoặc ')} để truy cập`,
      );
    }
    return true;
  }
}
