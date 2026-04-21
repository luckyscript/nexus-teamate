export interface ApiResponse<T> {
  code: string;
  message: string;
  data: T;
  requestId: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginatedResponse<T> {
  list: T[];
  pagination: Pagination;
}

// Auth
export interface CurrentUser {
  id: number;
  tenantId: number;
  username: string;
  displayName: string;
  roles: string[];
  permissions: string[];
}

// Project
export interface Project {
  id: number;
  tenantId: number;
  orgId: number | null;
  code: string;
  name: string;
  description: string | null;
  ownerId: number | null;
  status: string;
  configJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  code: string;
  name: string;
  description?: string;
  ownerId?: number;
}

// Board
export interface Board {
  id: number;
  projectId: number;
  name: string;
  viewType: 'kanban' | 'list';
  status: string;
  config: Record<string, unknown> | null;
  columns: BoardColumn[];
  transitions: BoardTransition[];
  createdAt: string;
  updatedAt: string;
}

export interface BoardColumn {
  id: number;
  code: string;
  name: string;
  seq: number;
  category: string | null;
  isInitial: boolean;
  isTerminal: boolean;
  wipLimit: number | null;
}

export interface BoardTransition {
  id: number;
  fromStatusCode: string;
  toStatusCode: string;
  transitionType: string;
  condition: Record<string, unknown> | null;
  isEnabled: boolean;
}

export interface CreateBoardInput {
  name: string;
  viewType: 'kanban' | 'list';
  templateId?: number;
}

// Task
export interface Task {
  id: number;
  tenantId: number;
  projectId: number;
  boardId: number;
  sourceType: string;
  sourceRef: string | null;
  externalId: string | null;
  title: string;
  description: string | null;
  statusCode: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  assigneeId: number | null;
  reporterId: number | null;
  aiState: 'none' | 'queued' | 'processing' | 'succeeded' | 'failed';
  takeoverState: 'none' | 'requested' | 'active' | 'released';
  parentTaskId: number | null;
  dueAt: string | null;
  customFields: Record<string, unknown> | null;
  extraJson: Record<string, unknown> | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskLabel {
  id: number;
  taskId: number;
  labelKey: string;
  labelValue: string;
  createdAt: string;
}

export interface TaskComment {
  id: number;
  taskId: number;
  authorType: 'user' | 'agent' | 'system';
  authorId: number | null;
  authorName: string | null;
  content: string;
  contentType: string;
  createdAt: string;
}

export interface TaskExecution {
  id: number;
  taskId: number;
  agentId: number;
  agentName: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'terminated';
  summary: string | null;
  startedAt: string | null;
  finishedAt: string | null;
}

export interface TaskDetail extends Task {
  labels: TaskLabel[];
  comments: TaskComment[];
  latestExecutions: TaskExecution[];
  availableActions: { action: string; label: string }[];
  sourceInfo: Record<string, unknown> | null;
}

export interface CreateTaskInput {
  projectId: number;
  boardId: number;
  title: string;
  description?: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  assigneeId?: number;
  sourceType: string;
  labels?: { key: string; value: string }[];
  customFields?: Record<string, unknown>;
  dueAt?: string;
}

export interface TransitionTaskInput {
  toStatusCode: string;
  reason: string;
  version: number;
}

export interface KanbanColumn {
  statusCode: string;
  name: string;
  count: number;
  tasks: Task[];
}

export interface KanbanData {
  viewMode: 'kanban' | 'list';
  columns: KanbanColumn[];
}

// Agent
export interface Agent {
  id: number;
  tenantId: number;
  agentKey: string;
  name: string;
  category: string;
  ownerType: string;
  status: string;
  description: string | null;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown> | null;
  toolPolicy: Record<string, unknown> | null;
  modelConfig: { provider: string; model: string };
  timeoutSeconds: number;
  version: number;
  isBuiltin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AgentExecution {
  id: number;
  taskId: number | null;
  agentId: number;
  triggerType: string;
  status: string;
  tokensIn: number;
  tokensOut: number;
  costAmount: number;
  retryCount: number;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
}

export interface CreateAgentInput {
  agentKey: string;
  name: string;
  category: string;
  promptTemplate: string;
  inputSchema: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  toolPolicy?: Record<string, unknown>;
  modelConfig: { provider: string; model: string; temperature?: number };
  timeoutSeconds?: number;
}

// Automation
export interface AutomationRule {
  id: number;
  projectId: number | null;
  boardId: number | null;
  name: string;
  ruleKey: string;
  eventType: string;
  priority: number;
  isEnabled: boolean;
  mutualExclusionKey: string | null;
  conditionDsl: Record<string, unknown>;
  actionDsl: Record<string, unknown>[];
  version: number;
  createdBy: number;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAutomationRuleInput {
  projectId?: number;
  boardId?: number;
  name: string;
  ruleKey: string;
  eventType: string;
  priority?: number;
  isEnabled?: boolean;
  conditionDsl: Record<string, unknown>;
  actionDsl: Record<string, unknown>[];
}

// Analytics
export interface AnalyticsOverview {
  aiParticipationRate: number;
  automationCoverageRate: number;
  assetReuseRate: number;
  taskEfficiencyScore: number;
  intelligenceDensityLevel: string;
  totalTasks: number;
  aiProcessedTasks: number;
  automatedTransitions: number;
  totalAgentExecutions: number;
  totalAssetsPublished: number;
}

export interface AnalyticsTrend {
  dataPoints: Array<{
    date: string;
    aiParticipationRate: number;
    automationCoverageRate: number;
    taskCount: number;
    agentExecutionCount: number;
  }>;
}

export interface AgentRanking {
  agentId: number;
  agentName: string;
  totalExecutions: number;
  successRate: number;
  avgDuration: number;
}

export interface AutomationFunnel {
  totalTasks: number;
  tasksWithAgentExecution: number;
  tasksWithAutomationRule: number;
  tasksAutoTransitioned: number;
  tasksCompleted: number;
}

// Asset
export interface Skill {
  id: number;
  skillKey: string;
  name: string;
  category: string;
  status: string;
  visibility: string;
  summary: string | null;
  content: string;
  tags: string[];
  version: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Capsule {
  id: number;
  capsuleKey: string;
  name: string;
  sceneType: string;
  status: string;
  visibility: string;
  summary: string | null;
  content: string;
  tags: string[];
  version: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: number;
  templateKey: string;
  templateType: string;
  name: string;
  scopeType: string;
  status: string;
  payload: Record<string, unknown>;
  version: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Connector
export interface ConnectorDefinition {
  id: number;
  code: string;
  name: string;
  type: string;
  authType: string;
  status: string;
  createdAt: string;
}

export interface ConnectorInstance {
  id: number;
  tenantId: number;
  definitionId: number;
  name: string;
  status: string;
  lastSyncAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Priority labels helper
export const PRIORITY_CONFIG: Record<string, { color: string; label: string }> = {
  P0: { color: '#ff4d4f', label: 'Urgent' },
  P1: { color: '#fa8c16', label: 'High' },
  P2: { color: '#1890ff', label: 'Medium' },
  P3: { color: '#52c41a', label: 'Low' },
};

export const AI_STATE_CONFIG: Record<string, { color: string; label: string }> = {
  none: { color: '#d9d9d9', label: 'None' },
  queued: { color: '#faad14', label: 'Queued' },
  processing: { color: '#1890ff', label: 'Processing' },
  succeeded: { color: '#52c41a', label: 'Succeeded' },
  failed: { color: '#ff4d4f', label: 'Failed' },
};

export const TASK_STATUS_COLORS: Record<string, string> = {
  todo: '#d9d9d9',
  in_progress: '#1890ff',
  in_review: '#faad14',
  done: '#52c41a',
  blocked: '#ff4d4f',
  cancelled: '#8c8c8c',
};
