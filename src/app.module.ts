import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { CacheInterceptor, RateLimitInterceptor } from './common/interceptors';
import { MyJwtGuard } from './common/guards';
import { BookModule } from './modules/book/book.module';

@Global()
@Module({
  imports: [UserModule, AuthModule, PrismaModule, BookModule],
  controllers: [AppController],
  providers: [
    AppService,

    // ✅ Đăng ký global guard
    // MyJwtGuard sẽ bảo vệ tất cả routes
    // Routes có @IsPublic() sẽ skip JWT check
    {
      provide: APP_GUARD,
      useClass: MyJwtGuard,
    },

    // ✅ Đăng ký global interceptors
    // Thứ tự: RateLimitInterceptor trước → CacheInterceptor sau
    {
      provide: APP_INTERCEPTOR,
      useClass: RateLimitInterceptor, // Kiểm tra rate limit trước
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor, // Cache response sau
    },
  ],
})
export class AppModule {}
