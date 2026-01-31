import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { MyJwtGuard, RolesGuard } from '../../common/guards';
import { JwtStrategy } from './strategy';
import { PrismaService } from '../prisma/prisma.service';
import { MailModule } from '../email/mail.module';
import { CleanupService } from './cleanup.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    MyJwtGuard, // JWT authentication guard
    RolesGuard, // Role-based authorization guard
    JwtStrategy, // JWT validation strategy
    PrismaService, // Prisma service (dùng cho JWT strategy)
    CleanupService, // Cleanup service (tự động xóa tài khoản chưa xác thực)
  ],
  exports: [
    AuthService, // Export để modules khác dùng auth service
    PassportModule, // Export để modules khác dùng guards
    JwtModule, // Export để modules khác dùng JWT
    RolesGuard, // Export để modules khác dùng role check
  ],
})
export class AuthModule {}
