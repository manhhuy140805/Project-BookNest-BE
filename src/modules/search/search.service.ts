import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createUpstashRedisClient } from 'src/common/config/upstash-redis.config';

@Injectable()
export class SearchService {
  private redis = createUpstashRedisClient();
  private readonly CACHE_PREFIX = 'search:suggestions';
  private readonly CACHE_TTL = 3600;
  private readonly MAX_HISTORY = 50;

  constructor(private prisma: PrismaService) {}

  async getHistory(userId: number) {
    const history = await this.prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: this.MAX_HISTORY,
      select: {
        id: true,
        query: true,
        results: true,
        createdAt: true,
      },
    });

    return history;
  }

  async getSuggestions(query: string) {
    if (!query || query.length < 2) {
      return [];
    }

    const cacheKey = `${this.CACHE_PREFIX}:${query.toLowerCase()}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached as string);
    }

    const suggestions = await this.prisma.searchHistory.groupBy({
      by: ['query'],
      where: {
        query: {
          contains: query,
          mode: 'insensitive',
        },
      },
      _count: {
        query: true,
      },
      orderBy: {
        _count: {
          query: 'desc',
        },
      },
      take: 10,
    });

    const result = suggestions.map((s) => ({
      query: s.query,
      count: s._count.query,
    }));

    await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(result));

    return result;
  }

  async saveSearch(userId: number, query: string, results: number) {
    const existingCount = await this.prisma.searchHistory.count({
      where: { userId },
    });

    if (existingCount >= this.MAX_HISTORY) {
      const oldestRecord = await this.prisma.searchHistory.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });

      if (oldestRecord) {
        await this.prisma.searchHistory.delete({
          where: { id: oldestRecord.id },
        });
      }
    }

    return this.prisma.searchHistory.create({
      data: {
        userId,
        query,
        results,
      },
    });
  }

  async clearHistory(userId: number) {
    await this.prisma.searchHistory.deleteMany({
      where: { userId },
    });

    return { message: 'Đã xóa toàn bộ lịch sử tìm kiếm' };
  }

  async deleteSearch(userId: number, id: number) {
    await this.prisma.searchHistory.deleteMany({
      where: {
        id,
        userId,
      },
    });

    return { message: 'Đã xóa lịch sử tìm kiếm' };
  }

  async getTrendingSearches(limit: number = 10) {
    const cacheKey = `${this.CACHE_PREFIX}:trending`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached as string);
    }

    const trending = await this.prisma.searchHistory.groupBy({
      by: ['query'],
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      _count: {
        query: true,
      },
      orderBy: {
        _count: {
          query: 'desc',
        },
      },
      take: limit,
    });

    const result = trending.map((t) => ({
      query: t.query,
      count: t._count.query,
    }));

    await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(result));

    return result;
  }
}
