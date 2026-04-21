import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import * as api from '../services';
import type {
  CreateProjectInput,
  CreateBoardInput,
  CreateTaskInput,
  TransitionTaskInput,
  CreateAgentInput,
  CreateAutomationRuleInput,
} from '../../types';

// Projects
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) => api.createProject(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: number } & Partial<CreateProjectInput>) =>
      api.updateProject(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// Boards
export function useBoards(projectId: number) {
  return useQuery({
    queryKey: ['boards', projectId],
    queryFn: () => api.getBoards(projectId),
    enabled: !!projectId,
  });
}

export function useBoard(boardId: number) {
  return useQuery({
    queryKey: ['board', boardId],
    queryFn: () => api.getBoard(boardId),
    enabled: !!boardId,
  });
}

export function useCreateBoard(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBoardInput) => api.createBoard(projectId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', projectId] });
    },
  });
}

export function useUpdateBoardColumns() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ boardId, columns }: { boardId: number; columns: any[] }) =>
      api.updateBoardColumns(boardId, columns),
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
}

export function useUpdateBoardTransitions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ boardId, transitions }: { boardId: number; transitions: any[] }) =>
      api.updateBoardTransitions(boardId, transitions),
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
}

// Tasks
export function useKanbanTasks(boardId: number) {
  return useQuery({
    queryKey: ['kanban-tasks', boardId],
    queryFn: () => api.getKanbanTasks(boardId),
    enabled: !!boardId,
  });
}

export function useListTasks(boardId: number) {
  return useQuery({
    queryKey: ['list-tasks', boardId],
    queryFn: () => api.listTasks(boardId),
    enabled: !!boardId,
  });
}

export function useTask(taskId: number) {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: () => api.getTask(taskId),
    enabled: !!taskId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => api.createTask(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['kanban-tasks', variables.boardId] });
      queryClient.invalidateQueries({ queryKey: ['list-tasks', variables.boardId] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, ...input }: { taskId: number } & Partial<CreateTaskInput>) =>
      api.updateTask(taskId, input),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['kanban-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['list-tasks'] });
    },
  });
}

export function useTransitionTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, ...input }: { taskId: number } & TransitionTaskInput) =>
      api.transitionTask(taskId, input),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['kanban-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['list-tasks'] });
    },
  });
}

export function useTakeoverTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: number) => api.takeoverTask(taskId),
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['kanban-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['list-tasks'] });
    },
  });
}

export function useAddTaskComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, content, contentType }: { taskId: number; content: string; contentType?: string }) =>
      api.addTaskComment(taskId, content, contentType),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
  });
}

// Agents
export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: () => api.getAgents(),
  });
}

export function useAgent(agentId: number) {
  return useQuery({
    queryKey: ['agent', agentId],
    queryFn: () => api.getAgent(agentId),
    enabled: !!agentId,
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAgentInput) => api.createAgent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

export function usePublishAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (agentId: number) => api.publishAgent(agentId),
    onSuccess: (_, agentId) => {
      queryClient.invalidateQueries({ queryKey: ['agent', agentId] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

export function useExecuteAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ agentId, input }: { agentId: number; input?: Record<string, unknown> }) =>
      api.executeAgent(agentId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent-executions'] });
    },
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (agentId: number) => api.deleteAgent(agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

export function useAgentExecutions(agentId: number) {
  return useQuery({
    queryKey: ['agent-executions', agentId],
    queryFn: () => api.getAgentExecutions(agentId),
    enabled: !!agentId,
  });
}

// Automation
export function useAutomationRules() {
  return useQuery({
    queryKey: ['automation-rules'],
    queryFn: () => api.getAutomationRules(),
  });
}

export function useCreateRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAutomationRuleInput) => api.createAutomationRule(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
    },
  });
}

export function useUpdateRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId, ...input }: { ruleId: number } & Partial<CreateAutomationRuleInput>) =>
      api.updateAutomationRule(ruleId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
    },
  });
}

export function useToggleRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleId: number) => api.toggleRule(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
    },
  });
}

export function useRuleExecutions(ruleId: number) {
  return useQuery({
    queryKey: ['rule-executions', ruleId],
    queryFn: () => api.getRuleExecutions(ruleId),
    enabled: !!ruleId,
  });
}

// Analytics
export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => api.getAnalyticsOverview(),
  });
}

export function useAnalyticsTrends() {
  return useQuery({
    queryKey: ['analytics-trends'],
    queryFn: () => api.getAnalyticsTrends(),
  });
}

export function useAgentRanking() {
  return useQuery({
    queryKey: ['agent-ranking'],
    queryFn: () => api.getAgentRanking(),
  });
}

export function useAutomationFunnel() {
  return useQuery({
    queryKey: ['automation-funnel'],
    queryFn: () => api.getAutomationFunnel(),
  });
}

// Assets
export function useSkills() {
  return useQuery({
    queryKey: ['skills'],
    queryFn: () => api.getSkills(),
  });
}

export function useCapsules() {
  return useQuery({
    queryKey: ['capsules'],
    queryFn: () => api.getCapsules(),
  });
}

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: () => api.getTemplates(),
  });
}

// Connectors
export function useConnectorDefinitions() {
  return useQuery({
    queryKey: ['connector-definitions'],
    queryFn: () => api.getConnectorDefinitions(),
  });
}

export function useConnectorInstances() {
  return useQuery({
    queryKey: ['connector-instances'],
    queryFn: () => api.getConnectorInstances(),
  });
}

export function useCreateConnectorInstance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { definitionId: number; name: string; config?: Record<string, unknown> }) =>
      api.createConnectorInstance(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connector-instances'] });
    },
  });
}

export function useTestConnector() {
  return useMutation({
    mutationFn: (instanceId: number) => api.testConnector(instanceId),
  });
}

export function useTriggerSync() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (instanceId: number) => api.triggerSync(instanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connector-instances'] });
    },
  });
}
