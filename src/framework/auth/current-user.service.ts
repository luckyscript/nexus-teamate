import { Injectable, Scope, ScopeEnum } from '@midwayjs/core';

export interface CurrentUser {
  id: number;
  tenantId: number;
  username: string;
  displayName: string;
  roles: string[];
  permissions: string[];
}

const CURRENT_USER_KEY = 'ctx.currentUser';

@Injectable()
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export class CurrentUserService {
  private currentUser: CurrentUser | null = null;

  setUser(user: CurrentUser): void {
    this.currentUser = user;
  }

  async getUser(): Promise<CurrentUser> {
    if (!this.currentUser) {
      throw new Error('UNAUTHORIZED: No current user in context');
    }
    return this.currentUser;
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
