import { Provide } from '@midwayjs/core';
import { Controller, Get, Inject, Query } from '@midwayjs/core';
import { Context } from '@midwayjs/web';
import { SSEGateway } from '../../../framework/sse/sse.gateway';

@Provide()
@Controller('/api/v1/system')
export class StreamController {
  @Inject()
  ctx: Context;

  @Inject()
  sseGateway: SSEGateway;

  @Get('/stream')
  async connectSSE(
    @Query('topic') topic?: string,
    @Query('boardId') boardId?: string,
  ) {
    const userId = (this.ctx as any).userId ?? 0;
    const tenantId = (this.ctx as any).tenantId ?? 0;

    const topics: string[] = [];

    if (topic && topic !== 'all') {
      topics.push(topic);
    }

    if (topic === 'all') {
      topics.push('task', 'agent', 'automation');
    }

    if (boardId) {
      topics.push(`board:${boardId}`);
    }

    topics.push(`tenant:${tenantId}`);

    this.sseGateway.setupConnection(this.ctx.res, {
      userId,
      tenantId,
      topics,
    });

    return this.ctx.res;
  }

  @Get('/health')
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: Date.now(),
      version: '1.0.0',
    };
  }
}
