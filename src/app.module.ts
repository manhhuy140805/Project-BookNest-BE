import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import {
  CacheInterceptor,
  ClearCacheInterceptor,
  RateLimitInterceptor,
} from './common/interceptors';
import { MyJwtGuard } from './common/guards';
import { BookModule } from './modules/book/book.module';
import { CategoryModule } from './modules/category/category.module';
import { RatingModule } from './modules/rating/rating.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { Reflector } from '@nestjs/core';
import { SupabaseModule } from './modules/supabase/supabase.module';

@Global()
@Module({
  imports: [
    UserModule,
    AuthModule,
    PrismaModule,
    BookModule,
    CategoryModule,
    RatingModule,
    CloudinaryModule,
    SupabaseModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Reflector,
    {
      provide: APP_GUARD,
      useClass: MyJwtGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RateLimitInterceptor, // Kiểm tra rate limit trước
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor, // Cache response sau
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClearCacheInterceptor, // Kiểm tra rate limit trước
    },
  ],
})
export class AppModule {}
