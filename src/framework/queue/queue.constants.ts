export const QUEUE_NAMES = {
  AGENT_EXECUTION: 'agent_execution',
  AUTOMATION_ACTION: 'automation_action',
  CONNECTOR_SYNC: 'connector_sync',
  OUTBOX_PUBLISH: 'outbox_publish',
} as const;

export const QueueNames = QUEUE_NAMES;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export const QUEUE_OPTIONS = {
  [QUEUE_NAMES.AGENT_EXECUTION]: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: { age: 86400, count: 1000 },
    removeOnFail: { age: 604800 },
  },
  [QUEUE_NAMES.AUTOMATION_ACTION]: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 500 },
    removeOnComplete: { age: 86400, count: 1000 },
    removeOnFail: { age: 604800 },
  },
  [QUEUE_NAMES.CONNECTOR_SYNC]: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { age: 86400, count: 500 },
    removeOnFail: { age: 604800 },
  },
  [QUEUE_NAMES.OUTBOX_PUBLISH]: {
    attempts: 10,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: { age: 86400, count: 2000 },
    removeOnFail: { age: 604800 },
  },
} as const;
