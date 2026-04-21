import { Catch } from '@midwayjs/core';
import { Context } from '@midwayjs/web';
import { BusinessException } from '../common/errors';

@Catch(BusinessException)
export class BusinessExceptionsFilter {
  async catch(err: BusinessException, ctx: Context) {
    const requestId = (ctx as any).requestId || '';

    ctx.status = err.statusCode || 400;
    ctx.body = {
      code: err.code,
      message: err.message,
      data: err.data ?? null,
      requestId,
    };
  }
}
