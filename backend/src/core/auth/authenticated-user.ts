/**
 * Identidad resuelta a partir del JWT de Cognito y adjuntada a la request.
 */
export interface AuthenticatedUser {
  sub: string;
  email?: string;
  tenantId: string;
  roles: string[];
}
