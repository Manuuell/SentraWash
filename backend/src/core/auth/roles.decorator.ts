import { SetMetadata } from '@nestjs/common';

/**
 * Restringe un handler a uno o más roles. Los roles llegan en el JWT de Cognito
 * (claim cognito:groups) y se complementan con los roles configurables por tenant.
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
