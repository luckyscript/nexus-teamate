import { EVENT_NAMES } from '../../../framework/event/event.constants';

export const TaskEvents = {
  CREATED: EVENT_NAMES.TASK.CREATED,
  UPDATED: EVENT_NAMES.TASK.UPDATED,
  STATUS_CHANGED: EVENT_NAMES.TASK.STATUS_CHANGED,
  TAKEOVER_CHANGED: EVENT_NAMES.TASK.TAKEOVER_CHANGED,
  COMMENT_ADDED: EVENT_NAMES.TASK.COMMENT_ADDED,
} as const;

export interface TaskCreatedPayload {
  taskId: number;
  tenantId: number;
  projectId: number;
  boardId: number;
  title: string;
  priority: string;
  sourceType: string;
  assigneeId: number;
  reporterId: number;
}

export interface TaskUpdatedPayload {
  taskId: number;
  tenantId: number;
  changes: Record<string, unknown>;
  updatedBy: number;
}

export interface TaskStatusChangedPayload {
  taskId: number;
  tenantId: number;
  fromStatusCode: string;
  toStatusCode: string;
  reason: string;
  changedBy: number;
}

export interface TaskTakeoverChangedPayload {
  taskId: number;
  tenantId: number;
  action: string;
  fromTakeoverState: string;
  toTakeoverState: string;
  reason: string;
  changedBy: number;
}
