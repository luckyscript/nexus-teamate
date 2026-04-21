import { Injectable, Scope, ScopeEnum, Inject } from '@midwayjs/core';
import { EVENT_NAMES, EventName } from './event.constants';
import { OutboxService } from './outbox.service';

export interface DomainEvent<T = unknown> {
  eventName: EventName;
  aggregateType: string;
  aggregateId: number;
  tenantId: number;
  payload: T;
  occurredAt: Date;
  requestId?: string;
}

@Injectable()
@Scope(ScopeEnum.Singleton)
export class EventPublisher {
  @Inject()
  outboxService: OutboxService;

  async publish<T = unknown>(event: DomainEvent<T>): Promise<void> {
    await this.outboxService.enqueue({
      eventType: event.eventName,
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      tenantId: event.tenantId,
      payload: event.payload as Record<string, unknown>,
      publishStatus: 'pending',
      retryCount: 0,
      nextRetryAt: new Date(),
    });
  }

  async publishTaskCreated(taskId: number, tenantId: number, data: Record<string, unknown>): Promise<void> {
    await this.publish({
      eventName: EVENT_NAMES.TASK.CREATED,
      aggregateType: 'task',
      aggregateId: taskId,
      tenantId,
      payload: data,
      occurredAt: new Date(),
    });
  }

  async publishTaskUpdated(taskId: number, tenantId: number, data: Record<string, unknown>): Promise<void> {
    await this.publish({
      eventName: EVENT_NAMES.TASK.UPDATED,
      aggregateType: 'task',
      aggregateId: taskId,
      tenantId,
      payload: data,
      occurredAt: new Date(),
    });
  }

  async publishTaskStatusChanged(
    taskId: number,
    tenantId: number,
    data: { fromStatus: string; toStatus: string },
  ): Promise<void> {
    await this.publish({
      eventName: EVENT_NAMES.TASK.STATUS_CHANGED,
      aggregateType: 'task',
      aggregateId: taskId,
      tenantId,
      payload: data,
      occurredAt: new Date(),
    });
  }

  async publishTaskTakeoverChanged(
    taskId: number,
    tenantId: number,
    data: { fromState: string; toState: string },
  ): Promise<void> {
    await this.publish({
      eventName: EVENT_NAMES.TASK.TAKEOVER_CHANGED,
      aggregateType: 'task',
      aggregateId: taskId,
      tenantId,
      payload: data,
      occurredAt: new Date(),
    });
  }

  async publishAgentExecution(
    status: 'queued' | 'started' | 'succeeded' | 'failed' | 'terminated',
    executionId: number,
    tenantId: number,
    data: Record<string, unknown>,
  ): Promise<void> {
    const eventNameMap = {
      queued: EVENT_NAMES.AGENT.EXECUTION_QUEUED,
      started: EVENT_NAMES.AGENT.EXECUTION_STARTED,
      succeeded: EVENT_NAMES.AGENT.EXECUTION_SUCCEEDED,
      failed: EVENT_NAMES.AGENT.EXECUTION_FAILED,
      terminated: EVENT_NAMES.AGENT.EXECUTION_TERMINATED,
    };

    await this.publish({
      eventName: eventNameMap[status],
      aggregateType: 'agent_execution',
      aggregateId: executionId,
      tenantId,
      payload: data,
      occurredAt: new Date(),
    });
  }

  async publishAutomation(
    status: 'matched' | 'executed',
    ruleId: number,
    tenantId: number,
    data: Record<string, unknown>,
  ): Promise<void> {
    const eventName = status === 'matched'
      ? EVENT_NAMES.AUTOMATION.RULE_MATCHED
      : EVENT_NAMES.AUTOMATION.RULE_EXECUTED;

    await this.publish({
      eventName,
      aggregateType: 'automation_rule',
      aggregateId: ruleId,
      tenantId,
      payload: data,
      occurredAt: new Date(),
    });
  }

  async publishAssetPublished(
    assetId: number,
    tenantId: number,
    assetType: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    await this.publish({
      eventName: EVENT_NAMES.ASSET.PUBLISHED,
      aggregateType: assetType,
      aggregateId: assetId,
      tenantId,
      payload: data,
      occurredAt: new Date(),
    });
  }

  async publishConnectorEvent(
    status: 'webhook_received' | 'sync_started' | 'sync_finished',
    tenantId: number,
    data: Record<string, unknown>,
  ): Promise<void> {
    const eventNameMap = {
      webhook_received: EVENT_NAMES.CONNECTOR.WEBHOOK_RECEIVED,
      sync_started: EVENT_NAMES.CONNECTOR.SYNC_STARTED,
      sync_finished: EVENT_NAMES.CONNECTOR.SYNC_FINISHED,
    };

    await this.publish({
      eventName: eventNameMap[status],
      aggregateType: 'connector',
      aggregateId: 0,
      tenantId,
      payload: data,
      occurredAt: new Date(),
    });
  }
}
