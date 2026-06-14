import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { AuthConfig } from '../config/configuration';
import { AuthenticatedUser } from './authenticated-user';

/**
 * Valida el JWT emitido por Amazon Cognito usando el JWKS del User Pool.
 * Extrae el tenant y los roles desde los claims configurados.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly auth: AuthConfig;

  constructor(configService: ConfigService) {
    const auth = configService.get<AuthConfig>('auth')!;
    const issuer = `https://cognito-idp.${auth.cognitoRegion}.amazonaws.com/${auth.userPoolId}`;
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      issuer,
      algorithms: ['RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${issuer}/.well-known/jwks.json`,
      }),
    });
    this.auth = auth;
  }

  validate(payload: Record<string, unknown>): AuthenticatedUser {
    const rolesClaim = payload[this.auth.rolesClaim];
    return {
      sub: String(payload.sub),
      email: payload.email ? String(payload.email) : undefined,
      tenantId: String(payload[this.auth.tenantClaim] ?? ''),
      roles: Array.isArray(rolesClaim) ? rolesClaim.map(String) : [],
    };
  }
}
