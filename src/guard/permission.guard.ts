import { CurrentUserService } from '../framework/auth/current-user.service';

export interface PermissionGuardOptions {
  permissions: string[];
  matchAll?: boolean;
}

export class PermissionGuard {
  currentUserService: CurrentUserService;

  constructor(currentUserService: CurrentUserService) {
    this.currentUserService = currentUserService;
  }

  async canActivate(ctx: any, options: PermissionGuardOptions): Promise<boolean> {
    const { permissions, matchAll = false } = options;

    if (!permissions.length) return true;

    const user = await this.currentUserService.getUser();

    if (matchAll) {
      const hasAll = permissions.every(p => user.permissions.includes(p));
      if (!hasAll) {
        ctx.status = 403;
        ctx.body = {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
          data: null,
          requestId: ctx.requestId,
        };
        return false;
      }
    } else {
      const hasAny = permissions.some(p => user.permissions.includes(p));
      if (!hasAny) {
        ctx.status = 403;
        ctx.body = {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
          data: null,
          requestId: ctx.requestId,
        };
        return false;
      }
    }

    return true;
  }
}
