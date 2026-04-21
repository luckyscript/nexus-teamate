export class AnalyticsOverviewVO {
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

export class AnalyticsTrendVO {
  dataPoints: Array<{
    date: string;
    aiParticipationRate: number;
    automationCoverageRate: number;
    taskCount: number;
    agentExecutionCount: number;
  }>;
}

export class AgentRankingVO {
  agentId: number;
  agentName: string;
  totalExecutions: number;
  successRate: number;
  avgDuration: number;
}

export class AutomationFunnelVO {
  totalTasks: number;
  tasksWithAgentExecution: number;
  tasksWithAutomationRule: number;
  tasksAutoTransitioned: number;
  tasksCompleted: number;
}

export class AnalyticsQueryDto {
  projectId?: number;
  boardId?: number;
  dateFrom?: string;
  dateTo?: string;
}
