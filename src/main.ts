import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Đăng ký global validation pipe
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

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
