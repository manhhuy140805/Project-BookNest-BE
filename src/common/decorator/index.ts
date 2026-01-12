/**
 * Tất cả decorators được export từ file này
 * Cách import:
 * import { UserData, IsPublic, Roles, RateLimit, Cache } from 'src/common/decorator';
 */

// Parameter decorators - Extract dữ liệu từ request
export * from './user-data.decorator'; // @UserData() - Extract user data

// Metadata decorators - Gắn metadata cho handler
export * from './is-public.decorator'; // @IsPublic() - Bỏ qua JWT check
export { Role, Roles, ROLES_KEY } from './roles.decorator'; // @Roles() - Role-based access
export * from './rate-limit.decorator'; // @RateLimit() - Giới hạn request
export * from './cache.decorator'; // @Cache() - Cache response
