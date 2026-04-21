import { Middleware, IMiddleware } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/web';

@Middleware()
export class TenantContextMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const tenantId = ctx.get('X-Tenant-Id');

      if (tenantId) {
        ctx.tenantId = Number(tenantId);
      }

      await next();
    };
  }

  static getName(): string {
    return 'tenantContext';
  }

  match(ctx: Context): boolean {
    return ctx.path.startsWith('/api/');
  }
}

declare module '@midwayjs/web' {
  interface Context {
    tenantId: number;
  }
}
