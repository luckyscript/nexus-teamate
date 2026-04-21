export const API_PREFIX = '/api/v1';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const HEADER_KEYS = {
  TENANT_ID: 'X-Tenant-Id',
  REQUEST_ID: 'X-Request-Id',
  AUTHORIZATION: 'Authorization',
} as const;

export const SSE_TOPICS = {
  TASK: 'task',
  BOARD: 'board',
  AGENT: 'agent',
  TENANT: 'tenant',
} as const;

export const CACHE_TTL = {
  USER_INFO: 300,
  TENANT_CONFIG: 600,
  PROJECT_LIST: 60,
  BOARD_LIST: 60,
  AGENT_LIST: 300,
} as const;

export const LOCK_TTL = {
  TASK_TRANSITION: 5,
  AGENT_EXECUTION: 60,
  AUTOMATION_RULE: 10,
} as const;

export const JOB_RETRY = {
  AGENT_EXECUTION: 3,
  AUTOMATION_ACTION: 3,
  CONNECTOR_SYNC: 5,
  OUTBOX_PUBLISH: 10,
} as const;
