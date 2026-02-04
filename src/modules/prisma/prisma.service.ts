import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'src/generated/prisma/client';
import { Pool } from 'pg';
import 'dotenv/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private pool: Pool;

  constructor() {
    // Tạo connection pool cho PostgreSQL
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL as string,
      max: 10, // Maximum pool size (giảm xuống cho cloud database)
      idleTimeoutMillis: 30000, // Close idle connections after 30s
      connectionTimeoutMillis: 30000, // Timeout after 30s (tăng lên cho cloud DB)
      ssl: {
        rejectUnauthorized: false, // Accept self-signed certificates
      },
    });

    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
    });

    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
