import { Inject, InjectClient, Scope, ScopeEnum } from '@midwayjs/core';
import { JwtService } from '../framework/auth/jwt.service';
import { CurrentUserService } from '../framework/auth/current-user.service';

export interface AuthGuardOptions {
  required?: boolean;
}

export class AuthGuard {
  @Inject()
  jwtService: JwtService;

  @Inject()
  currentUserService: CurrentUserService;

  async canActivate(ctx: any, options?: AuthGuardOptions): Promise<boolean> {
    const authHeader = ctx.get('Authorization') || ctx.get('authorization');

    if (!authHeader) {
      if (options?.required === false) return true;
      ctx.status = 401;
      ctx.body = {
        code: 'UNAUTHORIZED',
        message: 'Missing authorization header',
        data: null,
        requestId: ctx.requestId,
      };
      return false;
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      ctx.status = 401;
      ctx.body = {
        code: 'UNAUTHORIZED',
        message: 'Invalid authorization format',
        data: null,
        requestId: ctx.requestId,
      };
      return false;
    }

    try {
      const payload = this.jwtService.verifyToken(token);

      this.currentUserService.setUser({
        id: payload.sub,
        tenantId: payload.tenantId,
        username: payload.username,
        displayName: payload.username,
        roles: payload.roles,
        permissions: payload.permissions,
      });

      return true;
    } catch {
      ctx.status = 401;
      ctx.body = {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
        data: null,
        requestId: ctx.requestId,
      };
      return false;
    }
  }
}
