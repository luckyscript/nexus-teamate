import { Catch, IMidwayContext } from '@midwayjs/core';
import { MidwayValidationError } from '@midwayjs/validate';

@Catch(MidwayValidationError)
export class ValidationExceptionFilter {
  async catch(err: MidwayValidationError, ctx: IMidwayContext) {
    const requestId = (ctx as any).requestId || '';

    ctx.status = 422;
    ctx.body = {
      code: 'VALIDATION_ERROR',
      message: err.message,
      data: null,
      requestId,
    };
  }
}
