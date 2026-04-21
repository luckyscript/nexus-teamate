import apiClient from '../client';
import type {
  Project,
  CreateProjectInput,
  Board,
  CreateBoardInput,
  Task,
  TaskDetail,
  TaskComment,
  CreateTaskInput,
  TransitionTaskInput,
  KanbanData,
  PaginatedResponse,
  Agent,
  CreateAgentInput,
  AgentExecution,
  AutomationRule,
  CreateAutomationRuleInput,
  AnalyticsOverview,
  AnalyticsTrend,
  AgentRanking,
  AutomationFunnel,
  Skill,
  Capsule,
  Template,
  ConnectorDefinition,
  ConnectorInstance,
} from '../../types';

// Projects
export async function getProjects(): Promise<Project[]> {
  return apiClient.get<Project[]>('/projects');
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  return apiClient.post<Project>('/projects', input);
}

export async function updateProject(id: number, input: Partial<CreateProjectInput>): Promise<Project> {
  return apiClient.patch<Project>(`/projects/${id}`, input);
}

export async function deleteProject(id: number): Promise<void> {
  return apiClient.delete<void>(`/projects/${id}`);
}

// Boards
export async function getBoards(projectId: number): Promise<Board[]> {
  return apiClient.get<Board[]>(`/projects/${projectId}/boards`);
}

export async function getBoard(boardId: number): Promise<Board> {
  return apiClient.get<Board>(`/boards/${boardId}`);
}

export async function createBoard(projectId: number, input: CreateBoardInput): Promise<Board> {
  return apiClient.post<Board>(`/projects/${projectId}/boards`, input);
}

export async function updateBoardColumns(boardId: number, columns: Board['columns']): Promise<Board> {
  return apiClient.patch<Board>(`/boards/${boardId}/columns`, { columns });
}

export async function updateBoardTransitions(boardId: number, transitions: Board['transitions']): Promise<Board> {
  return apiClient.patch<Board>(`/boards/${boardId}/transitions`, { transitions });
}

// Tasks
export async function getKanbanTasks(boardId: number): Promise<KanbanData> {
  return apiClient.get<KanbanData>(`/boards/${boardId}/tasks`, { params: { viewMode: 'kanban' } });
}

export async function listTasks(boardId: number): Promise<PaginatedResponse<Task>> {
  return apiClient.get<PaginatedResponse<Task>>(`/boards/${boardId}/tasks`, { params: { viewMode: 'list' } });
}

export async function getTask(taskId: number): Promise<TaskDetail> {
  return apiClient.get<TaskDetail>(`/tasks/${taskId}`);
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  return apiClient.post<Task>('/tasks', input);
}

export async function updateTask(taskId: number, input: Partial<CreateTaskInput>): Promise<Task> {
  return apiClient.patch<Task>(`/tasks/${taskId}`, input);
}

export async function transitionTask(taskId: number, input: TransitionTaskInput): Promise<Task> {
  return apiClient.post<Task>(`/tasks/${taskId}/transition`, input);
}

export async function takeoverTask(taskId: number): Promise<Task> {
  return apiClient.post<Task>(`/tasks/${taskId}/takeover`);
}

export async function addTaskComment(taskId: number, content: string, contentType: string = 'text'): Promise<TaskComment> {
  return apiClient.post<TaskComment>(`/tasks/${taskId}/comments`, { content, contentType });
}

// Agents
export async function getAgents(): Promise<Agent[]> {
  return apiClient.get<Agent[]>('/agents');
}

export async function getAgent(agentId: number): Promise<Agent> {
  return apiClient.get<Agent>(`/agents/${agentId}`);
}

export async function createAgent(input: CreateAgentInput): Promise<Agent> {
  return apiClient.post<Agent>('/agents', input);
}

export async function publishAgent(agentId: number): Promise<Agent> {
  return apiClient.post<Agent>(`/agents/${agentId}/publish`);
}

export async function executeAgent(agentId: number, input?: Record<string, unknown>): Promise<AgentExecution> {
  return apiClient.post<AgentExecution>(`/agents/${agentId}/execute`, input);
}

export async function getAgentExecutions(agentId: number): Promise<AgentExecution[]> {
  return apiClient.get<AgentExecution[]>(`/agents/${agentId}/executions`);
}

export async function deleteAgent(id: number): Promise<void> {
  return apiClient.delete<void>(`/agents/${id}`);
}

// Automation
export async function getAutomationRules(): Promise<AutomationRule[]> {
  return apiClient.get<AutomationRule[]>('/automation/rules');
}

export async function createAutomationRule(input: CreateAutomationRuleInput): Promise<AutomationRule> {
  return apiClient.post<AutomationRule>('/automation/rules', input);
}

export async function updateAutomationRule(ruleId: number, input: Partial<CreateAutomationRuleInput>): Promise<AutomationRule> {
  return apiClient.patch<AutomationRule>(`/automation/rules/${ruleId}`, input);
}

export async function toggleRule(ruleId: number): Promise<AutomationRule> {
  return apiClient.post<AutomationRule>(`/automation/rules/${ruleId}/toggle`);
}

export async function getRuleExecutions(ruleId: number): Promise<unknown[]> {
  return apiClient.get<unknown[]>(`/automation/rules/${ruleId}/executions`);
}

// Analytics
export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  return apiClient.get<AnalyticsOverview>('/analytics/overview');
}

export async function getAnalyticsTrends(): Promise<AnalyticsTrend> {
  return apiClient.get<AnalyticsTrend>('/analytics/trends');
}

export async function getAgentRanking(): Promise<AgentRanking[]> {
  return apiClient.get<AgentRanking[]>('/analytics/agents/ranking');
}

export async function getAutomationFunnel(): Promise<AutomationFunnel> {
  return apiClient.get<AutomationFunnel>('/analytics/automation/funnel');
}

// Assets
export async function getSkills(): Promise<Skill[]> {
  return apiClient.get<Skill[]>('/assets/skills');
}

export async function getCapsules(): Promise<Capsule[]> {
  return apiClient.get<Capsule[]>('/assets/capsules');
}

export async function getTemplates(): Promise<Template[]> {
  return apiClient.get<Template[]>('/assets/templates');
}

// Connectors
export async function getConnectorDefinitions(): Promise<ConnectorDefinition[]> {
  return apiClient.get<ConnectorDefinition[]>('/connectors/definitions');
}

export async function getConnectorInstances(): Promise<ConnectorInstance[]> {
  return apiClient.get<ConnectorInstance[]>('/connectors/instances');
}

export async function createConnectorInstance(input: { definitionId: number; name: string; config?: Record<string, unknown> }): Promise<ConnectorInstance> {
  return apiClient.post<ConnectorInstance>('/connectors/instances', input);
}

export async function testConnector(instanceId: number): Promise<{ success: boolean; message: string }> {
  return apiClient.post<{ success: boolean; message: string }>(`/connectors/instances/${instanceId}/test`);
}

export async function triggerSync(instanceId: number): Promise<void> {
  return apiClient.post<void>(`/connectors/instances/${instanceId}/sync`);
}
