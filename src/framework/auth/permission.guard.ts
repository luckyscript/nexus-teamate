import { Inject, Provide, Scope, ScopeEnum } from '@midwayjs/core';
import { CurrentUserService } from './current-user.service';

@Provide()
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export class PermissionService {
  @Inject()
  currentUserService: CurrentUserService;

  async checkPermission(permission: string): Promise<boolean> {
    return this.currentUserService.hasPermission(permission);
  }

  async checkAnyPermission(permissions: string[]): Promise<boolean> {
    return this.currentUserService.hasAnyPermission(permissions);
  }

  async checkTenantAccess(tenantId: number): Promise<boolean> {
    const user = await this.currentUserService.getUser();
    return user.tenantId === tenantId;
  }

  async checkProjectAccess(projectId: number, _tenantId: number): Promise<boolean> {
    const user = await this.currentUserService.getUser();
    return user.tenantId === _tenantId && user.permissions.includes('project.read');
  }

  async checkBoardAccess(boardId: number, _tenantId: number): Promise<boolean> {
    const user = await this.currentUserService.getUser();
    return user.tenantId === _tenantId && user.permissions.includes('board.read');
  }

  async checkTaskAccess(taskId: number, _tenantId: number): Promise<boolean> {
    const user = await this.currentUserService.getUser();
    return user.tenantId === _tenantId && user.permissions.includes('task.read');
  }

  async isAdmin(): Promise<boolean> {
    return this.currentUserService.hasRole('tenant_admin');
  }

  async isOwner(resourceOwnerId: number): Promise<boolean> {
    const user = await this.currentUserService.getUser();
    return user.id === resourceOwnerId;
  }
}
