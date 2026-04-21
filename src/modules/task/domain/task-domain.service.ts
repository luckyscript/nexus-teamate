import { Provide } from '@midwayjs/core';
import { TaskEntity } from '../entity/task.entity';

export const DEFAULT_AI_STATES = [
  'none',
  'queued',
  'processing',
  'succeeded',
  'failed',
] as const;

export const DEFAULT_TAKEOVER_STATES = [
  'none',
  'requested',
  'active',
  'released',
] as const;

export interface StatusTransition {
  from: string;
  to: string;
}

export interface TransitionCommand {
  taskId: number;
  fromStatusCode: string;
  toStatusCode: string;
  version: number;
  currentVersion: number;
  transitions: StatusTransition[];
}

export interface AvailableAction {
  action: string;
  label: string;
}

@Provide()
export class TaskDomainService {
  canTransition(
    fromStatus: string,
    toStatus: string,
    transitions: StatusTransition[],
  ): boolean {
    return transitions.some(
      (t) => t.from === fromStatus && t.to === toStatus,
    );
  }

  validateTransition(command: TransitionCommand): {
    valid: boolean;
    error?: string;
  } {
    if (command.version !== command.currentVersion) {
      return {
        valid: false,
        error: `Version mismatch: expected ${command.version}, got ${command.currentVersion}`,
      };
    }

    if (command.fromStatusCode === command.toStatusCode) {
      return { valid: false, error: 'Cannot transition to the same status' };
    }

    if (
      !this.canTransition(
        command.fromStatusCode,
        command.toStatusCode,
        command.transitions,
      )
    ) {
      return {
        valid: false,
        error: `Transition from '${command.fromStatusCode}' to '${command.toStatusCode}' is not allowed`,
      };
    }

    return { valid: true };
  }

  validateCreate(dto: {
    title?: string;
    priority?: string;
    sourceType?: string;
    dueAt?: string;
  }): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!dto.title || dto.title.trim().length === 0) {
      errors.push('title is required');
    }

    if (!dto.priority) {
      errors.push('priority is required');
    } else if (!['P0', 'P1', 'P2', 'P3'].includes(dto.priority)) {
      errors.push('priority must be one of P0, P1, P2, P3');
    }

    if (!dto.sourceType) {
      errors.push('sourceType is required');
    } else if (
      !['manual', 'webhook', 'api', 'connector'].includes(dto.sourceType)
    ) {
      errors.push('sourceType must be one of manual, webhook, api, connector');
    }

    if (dto.dueAt) {
      const date = new Date(dto.dueAt);
      if (isNaN(date.getTime())) {
        errors.push('dueAt must be a valid ISO date string');
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return { valid: true };
  }

  resolveAvailableActions(
    task: TaskEntity,
    transitions: StatusTransition[],
    aiState: string,
    takeoverState: string,
  ): AvailableAction[] {
    const actions: AvailableAction[] = [];

    const allowedTransitions = transitions.filter(
      (t) => t.from === task.statusCode,
    );
    for (const t of allowedTransitions) {
      actions.push({ action: `transition:${t.to}`, label: `Move to ${t.to}` });
    }

    if (aiState === 'none' || aiState === 'failed') {
      actions.push({ action: 'ai:start', label: 'Start AI processing' });
    }
    if (aiState === 'processing') {
      actions.push({ action: 'ai:cancel', label: 'Cancel AI processing' });
    }
    if (aiState === 'succeeded') {
      actions.push({ action: 'ai:rerun', label: 'Rerun AI processing' });
    }

    if (takeoverState === 'none' || takeoverState === 'released') {
      actions.push({ action: 'takeover', label: 'Take over task' });
    }
    if (takeoverState === 'active') {
      actions.push({ action: 'release', label: 'Release task' });
      actions.push({ action: 'terminate', label: 'Terminate takeover' });
    }

    actions.push({ action: 'add_comment', label: 'Add comment' });
    actions.push({ action: 'add_subtask', label: 'Add subtask' });

    return actions;
  }
}
