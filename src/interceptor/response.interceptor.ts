import { IMidwayContext, NextFunction, Inject, Middleware, IMiddleware } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';

export interface IApiResult {
  code: string;
  message: string;
  data: unknown;
  requestId: string;
}

export class ResponseInterceptor {
  static intercept(result: unknown, ctx: IMidwayContext): IApiResult {
    const requestId = (ctx as any).requestId || '';

    if (result === null || result === undefined) {
      return {
        code: 'OK',
        message: 'success',
        data: null,
        requestId,
      };
    }

    if (typeof result === 'object' && 'code' in result) {
      return result as IApiResult;
    }

    return {
      code: 'OK',
      message: 'success',
      data: result,
      requestId,
    };
  }
}
