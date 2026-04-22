import { Provide, Scope, ScopeEnum, Inject } from '@midwayjs/core';

export interface CurrentUser {
  id: number;
  tenantId: number;
  username: string;
  displayName: string;
  roles: string[];
  permissions: string[];
}

const CURRENT_USER_KEY = 'ctx.currentUser';

@Provide()
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export class CurrentUserService {
  private currentUser: CurrentUser | null = null;

  @Inject()
  ctx: any;

  setUser(user: CurrentUser): void {
    this.currentUser = user;
  }

  async getUser(): Promise<CurrentUser> {
    if (this.currentUser) return this.currentUser;
    // Fallback: check ctx.user (set by mock middleware)
    if (this.ctx?.user) return this.ctx.user;
    throw new Error('UNAUTHORIZED: No current user in context');
  }

  async getUserId(): Promise<number> {
    const user = await this.getUser();
    return user.id;
  }

  async getTenantId(): Promise<number> {
    const user = await this.getUser();
    return user.tenantId;
  }

  async hasRole(role: string): Promise<boolean> {
    const user = await this.getUser();
    return user.roles.includes(role);
  }

  async hasPermission(permission: string): Promise<boolean> {
    const user = await this.getUser();
    return user.permissions.includes(permission);
  }

  async hasAnyPermission(permissions: string[]): Promise<boolean> {
    const user = await this.getUser();
    return permissions.some(p => user.permissions.includes(p));
  }
}
