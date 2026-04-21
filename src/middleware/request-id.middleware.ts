import { Middleware, IMiddleware } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/web';
import { v4 as uuidv4 } from 'uuid';

@Middleware()
export class RequestIdMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const requestId = ctx.get('X-Request-Id') || uuidv4();
      ctx.requestId = requestId;
      ctx.set('X-Request-Id', requestId);

      const start = Date.now();
      await next();
      const duration = Date.now() - start;

      ctx.set('X-Response-Time', `${duration}ms`);
    };
  }

  static getName(): string {
    return 'requestId';
  }
}

declare module '@midwayjs/web' {
  interface Context {
    requestId: string;
  }
}
