import { Redis } from '@upstash/redis';

export const createUpstashRedisClient = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be defined in .env',
    );
  }

  return new Redis({
    url,
    token,
  });
};
