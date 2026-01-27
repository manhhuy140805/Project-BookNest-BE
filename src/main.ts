import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { PrismaExceptionFilter } from './common/filters';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable compression để giảm kích thước response
  app.use(
    compression({
      level: 6, // Compression level (0-9)
      threshold: 1024, // Only compress responses larger than 1KB
    }),
  );

  // Đăng ký global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Tự động loại bỏ các thuộc tính không có trong DTO
      forbidNonWhitelisted: true, // Throw error nếu có thuộc tính không hợp lệ
      transform: true, // Tự động transform payload thành DTO instance
      transformOptions: {
        enableImplicitConversion: true, // Tự động convert kiểu dữ liệu
      },
    }),
  );

  // Đăng ký global exception filter
  app.useGlobalFilters(new PrismaExceptionFilter());

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
