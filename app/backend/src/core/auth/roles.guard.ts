import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedUser } from './authenticated-user';
import { ROLES_KEY } from './roles.decorator';

/**
 * Autoriza por rol. Se aplica junto a @Roles(...). Si no hay roles requeridos,
 * permite el acceso (la autenticación ya la cubre JwtAuthGuard).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) {
      return true;
    }
    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const roles = request.user?.roles ?? [];
    if (!required.some((role) => roles.includes(role))) {
      throw new ForbiddenException('No tienes permisos para esta operación');
    }
    return true;
  }
}
