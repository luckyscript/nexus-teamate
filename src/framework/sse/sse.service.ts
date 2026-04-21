import { Injectable, Scope, ScopeEnum } from '@midwayjs/core';

export interface SSEClient {
  id: string;
  userId: number;
  tenantId: number;
  topics: Set<string>;
  response: any;
  lastActivity: Date;
}

@Injectable()
@Scope(ScopeEnum.Singleton)
export class SSEService {
  private clients: Map<string, SSEClient> = new Map();
  private userClients: Map<number, Set<string>> = new Map();
  private topicClients: Map<string, Set<string>> = new Map();

  addClient(client: SSEClient): void {
    this.clients.set(client.id, client);

    if (!this.userClients.has(client.userId)) {
      this.userClients.set(client.userId, new Set());
    }
    this.userClients.get(client.userId)!.add(client.id);

    for (const topic of client.topics) {
      if (!this.topicClients.has(topic)) {
        this.topicClients.set(topic, new Set());
      }
      this.topicClients.get(topic)!.add(client.id);
    }
  }

  removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    this.clients.delete(clientId);

    const userIds = this.userClients.get(client.userId);
    if (userIds) {
      userIds.delete(clientId);
      if (userIds.size === 0) {
        this.userClients.delete(client.userId);
      }
    }

    for (const topic of client.topics) {
      const topicIds = this.topicClients.get(topic);
      if (topicIds) {
        topicIds.delete(clientId);
        if (topicIds.size === 0) {
          this.topicClients.delete(topic);
        }
      }
    }
  }

  subscribeToTopic(clientId: string, topic: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.topics.add(topic);

    if (!this.topicClients.has(topic)) {
      this.topicClients.set(topic, new Set());
    }
    this.topicClients.get(topic)!.add(clientId);
  }

  unsubscribeFromTopic(clientId: string, topic: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.topics.delete(topic);

    const topicIds = this.topicClients.get(topic);
    if (topicIds) {
      topicIds.delete(clientId);
      if (topicIds.size === 0) {
        this.topicClients.delete(topic);
      }
    }
  }

  sendToClient(clientId: string, event: string, data: unknown): boolean {
    const client = this.clients.get(clientId);
    if (!client) return false;

    return this.writeSSE(client.response, event, data);
  }

  sendToUser(userId: number, event: string, data: unknown): number {
    const clientIds = this.userClients.get(userId);
    if (!clientIds) return 0;

    let sent = 0;
    for (const clientId of clientIds) {
      if (this.sendToClient(clientId, event, data)) {
        sent++;
      }
    }
    return sent;
  }

  sendToTopic(topic: string, event: string, data: unknown): number {
    const clientIds = this.topicClients.get(topic);
    if (!clientIds) return 0;

    let sent = 0;
    for (const clientId of clientIds) {
      if (this.sendToClient(clientId, event, data)) {
        sent++;
      }
    }
    return sent;
  }

  broadcast(event: string, data: unknown): number {
    let sent = 0;
    for (const [clientId] of this.clients) {
      if (this.sendToClient(clientId, event, data)) {
        sent++;
      }
    }
    return sent;
  }

  getClientCount(): number {
    return this.clients.size;
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
