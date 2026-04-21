import { Controller, Get, Query, Param, Inject } from '@midwayjs/core';
import { AuditService, AuditLogQuery } from '../service/audit.service';
import { CurrentUser, CurrentUserService } from '../../../framework/auth/current-user.service';

@Controller('/api/v1/audit')
export class AuditController {
  @Inject()
  auditService: AuditService;

  @Inject()
  currentUserService: CurrentUserService;

  private async getUser(): Promise<CurrentUser> {
    return this.currentUserService.getUser();
  }

  @Get('/logs')
  async listAuditLogs(@Query() query: AuditLogQuery) {
    const user = await this.getUser();
    return this.auditService.listAuditLogs(query, user);
  }

  @Get('/resources/:resourceType/:resourceId')
  async getResourceHistory(
    @Param('resourceType') resourceType: string,
    @Param('resourceId') resourceId: string,
  ) {
    const user = await this.getUser();
    return this.auditService.getResourceHistory(resourceType, Number(resourceId), user);
  }
}
