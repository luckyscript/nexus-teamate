export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  P0 = 'P0',
  P1 = 'P1',
  P2 = 'P2',
  P3 = 'P3',
}

export enum AIState {
  NONE = 'none',
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum TakeoverState {
  NONE = 'none',
  TAKEN_OVER = 'taken_over',
  RELEASED = 'released',
  TERMINATED = 'terminated',
}

export enum SourceType {
  MANUAL = 'manual',
  WEBHOOK = 'webhook',
  CONNECTOR = 'connector',
  AUTOMATION = 'automation',
}

export enum AgentCategory {
  PROMPT = 'prompt',
  WORKFLOW = 'workflow',
  ASSISTANT = 'assistant',
}

export enum AgentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  DEPRECATED = 'deprecated',
}

export enum AgentExecutionStatus {
  QUEUED = 'queued',
  STARTED = 'started',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  TERMINATED = 'terminated',
}

export enum TriggerType {
  MANUAL = 'manual',
  AUTOMATION = 'automation',
  SCHEDULED = 'scheduled',
}

export enum ProjectStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export enum BoardViewType {
  KANBAN = 'kanban',
  LIST = 'list',
}

export enum RuleExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
}

export enum PublishStatus {
  PENDING = 'pending',
  PUBLISHED = 'published',
  FAILED = 'failed',
}
