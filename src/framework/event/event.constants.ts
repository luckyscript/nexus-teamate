export const EVENT_NAMES = {
  TASK: {
    CREATED: 'task.created',
    UPDATED: 'task.updated',
    STATUS_CHANGED: 'task.status_changed',
    TAKEOVER_CHANGED: 'task.takeover_changed',
    COMMENT_ADDED: 'task.comment_added',
  },
  AGENT: {
    EXECUTION_QUEUED: 'agent.execution.queued',
    EXECUTION_STARTED: 'agent.execution.started',
    EXECUTION_SUCCEEDED: 'agent.execution.succeeded',
    EXECUTION_FAILED: 'agent.execution.failed',
    EXECUTION_TERMINATED: 'agent.execution.terminated',
  },
  AUTOMATION: {
    RULE_MATCHED: 'automation.rule_matched',
    RULE_EXECUTED: 'automation.rule_executed',
  },
  ASSET: {
    PUBLISHED: 'asset.published',
    BOUND: 'asset.bound',
  },
  CONNECTOR: {
    WEBHOOK_RECEIVED: 'connector.webhook_received',
    SYNC_STARTED: 'connector.sync_started',
    SYNC_FINISHED: 'connector.sync_finished',
  },
} as const;

export type EventName =
  | typeof EVENT_NAMES.TASK[keyof typeof EVENT_NAMES.TASK]
  | typeof EVENT_NAMES.AGENT[keyof typeof EVENT_NAMES.AGENT]
  | typeof EVENT_NAMES.AUTOMATION[keyof typeof EVENT_NAMES.AUTOMATION]
  | typeof EVENT_NAMES.ASSET[keyof typeof EVENT_NAMES.ASSET]
  | typeof EVENT_NAMES.CONNECTOR[keyof typeof EVENT_NAMES.CONNECTOR];

export const ALL_EVENT_NAMES: EventName[] = [
  EVENT_NAMES.TASK.CREATED,
  EVENT_NAMES.TASK.UPDATED,
  EVENT_NAMES.TASK.STATUS_CHANGED,
  EVENT_NAMES.TASK.TAKEOVER_CHANGED,
  EVENT_NAMES.TASK.COMMENT_ADDED,
  EVENT_NAMES.AGENT.EXECUTION_QUEUED,
  EVENT_NAMES.AGENT.EXECUTION_STARTED,
  EVENT_NAMES.AGENT.EXECUTION_SUCCEEDED,
  EVENT_NAMES.AGENT.EXECUTION_FAILED,
  EVENT_NAMES.AGENT.EXECUTION_TERMINATED,
  EVENT_NAMES.AUTOMATION.RULE_MATCHED,
  EVENT_NAMES.AUTOMATION.RULE_EXECUTED,
  EVENT_NAMES.ASSET.PUBLISHED,
  EVENT_NAMES.ASSET.BOUND,
  EVENT_NAMES.CONNECTOR.WEBHOOK_RECEIVED,
  EVENT_NAMES.CONNECTOR.SYNC_STARTED,
  EVENT_NAMES.CONNECTOR.SYNC_FINISHED,
];
