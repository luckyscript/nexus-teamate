import { Inject, Injectable, Scope, ScopeEnum } from '@midwayjs/core';
import { SSEService } from './sse.service';
import { v4 as uuidv4 } from 'uuid';

export interface SSEConnectionOptions {
  userId: number;
  tenantId: number;
  topics?: string[];
}

@Injectable()
@Scope(ScopeEnum.Singleton)
export class SSEGateway {
  @Inject()
  sseService: SSEService;

  setupConnection(res: any, options: SSEConnectionOptions): string {
    const clientId = uuidv4();

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    res.flushHeaders();

    const client = {
      id: clientId,
      userId: options.userId,
      tenantId: options.tenantId,
      topics: new Set(options.topics ?? []),
      response: res,
      lastActivity: new Date(),
    };

    this.sseService.addClient(client);

    this.writeSSE(res, 'connected', { clientId, topics: options.topics ?? [] });

    res.on('close', () => {
      this.sseService.removeClient(clientId);
      res.end();
    });

    res.on('error', () => {
      this.sseService.removeClient(clientId);
      res.end();
    });

    const interval = setInterval(() => {
      this.writeSSE(res, 'ping', { timestamp: Date.now() });
    }, 30000);

    res.on('close', () => {
      clearInterval(interval);
    });

    return clientId;
  }

  broadcastToTenant(tenantId: number, event: string, data: unknown): number {
    return this.sseService.sendToTopic(`tenant:${tenantId}`, event, data);
  }

  broadcastToBoard(boardId: number, event: string, data: unknown): number {
    return this.sseService.sendToTopic(`board:${boardId}`, event, data);
  }

  broadcastToTask(taskId: number, event: string, data: unknown): number {
    return this.sseService.sendToTopic(`task:${taskId}`, event, data);
  }

  sendToUser(userId: number, event: string, data: unknown): number {
    return this.sseService.sendToUser(userId, event, data);
  }

  private writeSSE(res: any, event: string, data: unknown): boolean {
    try {
      const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      res.write(payload);
      return true;
    } catch {
      return false;
    }
  }
}
