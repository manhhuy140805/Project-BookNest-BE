import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { RedisModule } from './modules/redis/redis.module';
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
    ScheduleModule.forRoot(), // Enable cron jobs
    // Global Rate Limiting: 100 requests per minute per IP
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // Time window: 60 seconds
        limit: 100, // Max 100 requests per window
      },
    ]),
    RedisModule, // Redis for rate limiting storage
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
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Global rate limiting guard
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RateLimitInterceptor, // Custom rate limit cho endpoints nhạy cảm
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor, // Cache response
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClearCacheInterceptor,
    },
  ],
})
export class AppModule {}
