import { Inject, IMidwayContext, NextFunction } from '@midwayjs/core';

export class TraceInterceptor {
  static async intercept(ctx: IMidwayContext, next: NextFunction) {
    const start = Date.now();
    const method = (ctx as any).method || '';
    const url = (ctx as any).url || '';
    const requestId = (ctx as any).requestId || '';

    try {
      const result = await next();
      const duration = Date.now() - start;

      console.log(
        `[TRACE] ${method} ${url} [${requestId}] completed in ${duration}ms`,
      );

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.error(
        `[TRACE] ${method} ${url} [${requestId}] failed in ${duration}ms:`,
        error,
      );
      throw error;
    }
  }
}
