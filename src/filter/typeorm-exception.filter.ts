import { Catch, IMidwayContext } from '@midwayjs/core';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';

@Catch(QueryFailedError, EntityNotFoundError)
export class TypeORMExceptionFilter {
  async catch(err: QueryFailedError | EntityNotFoundError, ctx: IMidwayContext) {
    const requestId = (ctx as any).requestId || '';

    if (err instanceof EntityNotFoundError) {
      ctx.status = 404;
      ctx.body = {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Resource not found',
        data: null,
        requestId,
      };
      return;
    }

    const queryError = err as QueryFailedError;
    const code = (queryError as any).code;

    if (code === 'ER_DUP_ENTRY') {
      ctx.status = 409;
      ctx.body = {
        code: 'DUPLICATE_ENTRY',
        message: 'Resource already exists',
        data: null,
        requestId,
      };
      return;
    }

    if (code === 'ER_NO_REFERENCED_ROW_2') {
      ctx.status = 400;
      ctx.body = {
        code: 'FOREIGN_KEY_CONSTRAINT',
        message: 'Referenced resource not found',
        data: null,
        requestId,
      };
      return;
    }

    ctx.status = 500;
    ctx.body = {
      code: 'INTERNAL_ERROR',
      message: 'Database operation failed',
      data: null,
      requestId,
    };
  }
}
