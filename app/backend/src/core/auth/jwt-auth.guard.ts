import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { AuthConfig } from '../config/configuration';
import { IS_PUBLIC_KEY } from './public.decorator';

/**
 * Guard JWT global. Omite rutas marcadas @Public(). En desarrollo, si
 * AUTH_ENABLED=false, deja pasar sin validar firma (el tenant se resuelve por
 * header) para poder probar la API sin Cognito.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const auth = this.configService.get<AuthConfig>('auth');
    if (!auth?.enabled) {
      return true;
    }
    return super.canActivate(context);
  }
}
