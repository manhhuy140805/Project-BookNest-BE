import { Module, Global } from '@nestjs/common';
import { RedisModule as NestRedisModule } from '@liaoliaots/nestjs-redis';

@Global()
@Module({
  imports: [
    NestRedisModule.forRoot({
      config: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
        retryStrategy: (times) => {
          // Retry connection every 3 seconds, max 10 times
          if (times > 10) {
            console.error('❌ Redis connection failed after 10 retries');
            return null; // Stop retrying
          }
          return Math.min(times * 1000, 3000);
        },
        onClientCreated: (client) => {
          client.on('error', (err) => {
            console.error('❌ Redis Client Error:', err);
          });
          client.on('connect', () => {
            console.log('✅ Redis connected successfully');
          });
        },
      },
    }),
  ],
  exports: [NestRedisModule],
})
export class RedisModule {}
