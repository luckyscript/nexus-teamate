export class CacheKeyHelper {
  private static readonly PREFIX = 'nexus';

  static build(...segments: (string | number)[]): string {
    return [this.PREFIX, ...segments.map(s => String(s))].join(':');
  }

  static user(userId: number): string {
    return this.build('user', userId);
  }

  static tenant(tenantId: number): string {
    return this.build('tenant', tenantId);
  }

  static tenantUser(tenantId: number, userId: number): string {
    return this.build('tenant', tenantId, 'user', userId);
  }

  static task(taskId: number): string {
    return this.build('task', taskId);
  }

  static board(boardId: number): string {
    return this.build('board', boardId);
  }

  static project(projectId: number): string {
    return this.build('project', projectId);
  }

  static agent(agentId: number): string {
    return this.build('agent', agentId);
  }

  static agentExecution(executionId: number): string {
    return this.build('agent:execution', executionId);
  }

  static automationRule(ruleId: number): string {
    return this.build('automation:rule', ruleId);
  }

  static connector(instanceId: number): string {
    return this.build('connector', instanceId);
  }

  static list(key: string, tenantId: number, page: number, pageSize: number): string {
    return this.build(key, 'list', tenantId, `p${page}`, `ps${pageSize}`);
  }

  static count(key: string, tenantId: number): string {
    return this.build(key, 'count', tenantId);
  }
}
