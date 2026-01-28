import { SetMetadata } from '@nestjs/common';

export const CLEAR_CACHE_METADATA = 'clear_cache_patterns';

export const ClearCache = (...patterns: string[]) => {
  return SetMetadata(CLEAR_CACHE_METADATA, patterns);
};
