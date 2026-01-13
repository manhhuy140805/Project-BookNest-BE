import { SetMetadata } from '@nestjs/common';

// Tên key để lưu metadata
export const IS_PUBLIC_KEY = 'isPublic';
export const IsPublic = () => SetMetadata(IS_PUBLIC_KEY, true);
