export class TenantGuard {
  async canActivate(ctx: any): Promise<boolean> {
    const tenantId = ctx.get('X-Tenant-Id');

    if (!tenantId) {
      ctx.status = 400;
      ctx.body = {
        code: 'TENANT_MISSING',
        message: 'Missing X-Tenant-Id header',
        data: null,
        requestId: ctx.requestId,
      };
      return false;
    }

    const parsedTenantId = Number(tenantId);
    if (isNaN(parsedTenantId) || parsedTenantId <= 0) {
      ctx.status = 400;
      ctx.body = {
        code: 'TENANT_INVALID',
        message: 'Invalid X-Tenant-Id header',
        data: null,
        requestId: ctx.requestId,
      };
      return false;
    }

    ctx.tenantId = parsedTenantId;
    return true;
  }
}
