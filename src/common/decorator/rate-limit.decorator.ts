import { SetMetadata } from '@nestjs/common';

export interface RateLimitOptions {
  max: number; // Số request tối đa
  windowMs: number; // Khoảng thời gian (millisecond)
}

export const RATE_LIMIT_KEY = 'rateLimit';

export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);
