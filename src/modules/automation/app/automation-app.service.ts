import { Inject, Provide } from '@midwayjs/core';
import { AutomationRuleRepository } from '../repository/automation-rule.repository';
import { AutomationRuleExecutionRepository } from '../repository/automation-rule-execution.repository';
import { AutomationDomainService } from '../domain/automation-domain.service';
import { CurrentUser } from '../../../framework/auth/current-user.service';
import {
  CreateAutomationRuleRequestDto,
  UpdateAutomationRuleRequestDto,
  ToggleRuleRequestDto,
  ValidateRuleDslRequestDto,
  AutomationRuleVO,
  AutomationRuleExecutionVO,
} from '../dto/automation.dto';
import { PageRequestDto } from '../../../common/dto/pagination.dto';

export interface ListRulesQuery extends PageRequestDto {
  projectId?: number;
  boardId?: number;
  eventType?: string;
  isEnabled?: boolean;
}

export interface ListExecutionsQuery extends PageRequestDto {}

@Provide()
export class AutomationAppService {
  @Inject()
  automationRuleRepository: AutomationRuleRepository;

  @Inject()
  automationRuleExecutionRepository: AutomationRuleExecutionRepository;

  @Inject()
  automationDomainService: AutomationDomainService;

  async createRule(
    dto: CreateAutomationRuleRequestDto,
    user: CurrentUser
  ): Promise<AutomationRuleVO> {
    const validation = this.automationDomainService.validateDsl(
      dto.conditionDsl,
      dto.actionDsl
    );
    if (!validation.valid) {
      throw new Error(`Invalid DSL: ${validation.errors.join('; ')}`);
    }

    const entity = await this.automationRuleRepository.create(
      {
        tenantId: user.tenantId,
        projectId: dto.projectId ?? null,
        boardId: dto.boardId ?? null,
        name: dto.name,
        ruleKey: dto.ruleKey,
        eventType: dto.eventType,
        priority: dto.priority,
        isEnabled: dto.isEnabled !== undefined ? (dto.isEnabled ? 1 : 0) : 1,
        mutualExclusionKey: dto.mutualExclusionKey ?? null,
        rolloutScope: null,
        conditionDsl: dto.conditionDsl as unknown as Record<string, unknown>,
        actionDsl: dto.actionDsl as unknown as Record<string, unknown>[],
      },
      user
    );

    return this.toRuleVO(entity);
  }

  async listRules(
    query: ListRulesQuery,
    user: CurrentUser
  ): Promise<{ items: AutomationRuleVO[]; total: number }> {
    const { items, total } = await this.automationRuleRepository.findAll(
      user.tenantId,
      {
        projectId: query.projectId,
        boardId: query.boardId,
        eventType: query.eventType,
        isEnabled: query.isEnabled,
      },
      query.page ?? 1,
      query.pageSize ?? 20
    );

    return {
      items: items.map((e) => this.toRuleVO(e)),
      total,
    };
  }

  async getRule(id: number, user: CurrentUser): Promise<AutomationRuleVO | null> {
    const entity = await this.automationRuleRepository.findById(id, user.tenantId);
    if (!entity) {
      return null;
    }
    return this.toRuleVO(entity);
  }

  async updateRule(
    id: number,
    dto: UpdateAutomationRuleRequestDto,
    user: CurrentUser
  ): Promise<AutomationRuleVO | null> {
    const existing = await this.automationRuleRepository.findById(id, user.tenantId);
    if (!existing) {
      return null;
    }

    if (dto.conditionDsl || dto.actionDsl) {
      const validation = this.automationDomainService.validateDsl(
        (dto.conditionDsl ?? existing.conditionDsl) as any,
        (dto.actionDsl ?? existing.actionDsl) as any
      );
      if (!validation.valid) {
        throw new Error(`Invalid DSL: ${validation.errors.join('; ')}`);
      }
    }

    const entity = await this.automationRuleRepository.update(
      id,
      {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.ruleKey !== undefined && { ruleKey: dto.ruleKey }),
        ...(dto.eventType !== undefined && { eventType: dto.eventType }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.isEnabled !== undefined && { isEnabled: dto.isEnabled ? 1 : 0 }),
        ...(dto.mutualExclusionKey !== undefined && { mutualExclusionKey: dto.mutualExclusionKey }),
        ...(dto.conditionDsl && { conditionDsl: dto.conditionDsl as unknown as Record<string, unknown> }),
        ...(dto.actionDsl && { actionDsl: dto.actionDsl as unknown as Record<string, unknown>[] }),
      },
      user.tenantId,
      user
    );

    return entity ? this.toRuleVO(entity) : null;
  }

  async toggleRule(
    id: number,
    dto: ToggleRuleRequestDto,
    user: CurrentUser
  ): Promise<AutomationRuleVO | null> {
    const entity = await this.automationRuleRepository.toggle(
      id,
      dto.isEnabled,
      user.tenantId,
      user
    );
    return entity ? this.toRuleVO(entity) : null;
  }

  validateDsl(
    dto: ValidateRuleDslRequestDto,
    _user: CurrentUser
  ): { valid: boolean; errors: string[] } {
    return this.automationDomainService.validateDsl(dto.conditionDsl, dto.actionDsl);
  }

  async listExecutions(
    ruleId: number,
    query: ListExecutionsQuery,
    user: CurrentUser
  ): Promise<{ items: AutomationRuleExecutionVO[]; total: number }> {
    const rule = await this.automationRuleRepository.findById(ruleId, user.tenantId);
    if (!rule) {
      return { items: [], total: 0 };
    }

    const { items, total } = await this.automationRuleExecutionRepository.findByRuleId(
      ruleId,
      user.tenantId,
      query.page ?? 1,
      query.pageSize ?? 20
    );

    return {
      items: items.map((e) => this.toExecutionVO(e)),
      total,
    };
  }

  async matchAndExecute(
    domainEvent: {
      eventType: string;
      eventId: number;
      tenantId: number;
      taskId: number;
      boardId?: number;
      projectId?: number;
    },
    taskContext: Record<string, unknown>
  ): Promise<void> {
    const rules = await this.automationRuleRepository.findByEventType(
      domainEvent.eventType,
      domainEvent.tenantId,
      domainEvent.boardId,
      domainEvent.projectId
    );

    if (rules.length === 0) {
      return;
    }

    const matchedRules = rules.filter((rule) => {
      const dsl = rule.conditionDsl as any;
      return this.automationDomainService.evaluateConditions(dsl, taskContext);
    });

    if (matchedRules.length === 0) {
      return;
    }

    const exclusionCheck = this.automationDomainService.checkMutualExclusion(
      matchedRules.map((r) => ({ mutualExclusionKey: r.mutualExclusionKey, id: r.id })),
      taskContext
    );

    let rulesToExecute = matchedRules;
    if (exclusionCheck.conflicting && exclusionCheck.conflictKey) {
      const highestPriorityRule = matchedRules.reduce((best, current) =>
        current.priority > best.priority ? current : best
      );
      rulesToExecute = matchedRules.filter((r) => r.mutualExclusionKey !== exclusionCheck.conflictKey || r.id === highestPriorityRule.id);
    }

    for (const rule of rulesToExecute) {
      await this.executeRule(rule, domainEvent, taskContext);
    }
  }

  async executeRuleActions(
    ruleId: number,
    taskId: number,
    taskContext: Record<string, unknown>,
  ): Promise<void> {
    const rule = await this.automationRuleRepository.findById(ruleId, 0);
    if (!rule) {
      throw new HttpException('Rule not found', HttpStatus.NOT_FOUND);
    }

    await this.executeRule(rule, { eventId: 0, tenantId: rule.tenantId, taskId }, taskContext);
  }

  private async executeRule(
    rule: { id: number; name: string; actionDsl: Record<string, unknown>[] },
    domainEvent: { eventId: number; tenantId: number; taskId: number },
    taskContext: Record<string, unknown>
  ): Promise<void> {
    const execution = await this.automationRuleExecutionRepository.create({
      tenantId: domainEvent.tenantId,
      ruleId: rule.id,
      taskId: domainEvent.taskId,
      triggerEventId: domainEvent.eventId,
      status: 'running',
      matched: 1,
      resultSummary: null,
      errorMessage: null,
      startedAt: new Date(),
      finishedAt: null,
    });

    try {
      const resolvedActions = this.automationDomainService.resolveActions(
        rule.actionDsl as any,
        taskContext
      );

      const summaries = resolvedActions.map(
        (a) => `${a.type}: ${JSON.stringify(a.params || {})}`
      );

      await this.automationRuleExecutionRepository.create({
        tenantId: domainEvent.tenantId,
        ruleId: rule.id,
        taskId: domainEvent.taskId,
        triggerEventId: domainEvent.eventId,
        status: 'succeeded',
        matched: 1,
        resultSummary: summaries.join('; ').substring(0, 255),
        errorMessage: null,
        startedAt: execution.startedAt,
        finishedAt: new Date(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.automationRuleExecutionRepository.create({
        tenantId: domainEvent.tenantId,
        ruleId: rule.id,
        taskId: domainEvent.taskId,
        triggerEventId: domainEvent.eventId,
        status: 'failed',
        matched: 1,
        resultSummary: null,
        errorMessage: errorMessage.substring(0, 512),
        startedAt: execution.startedAt,
        finishedAt: new Date(),
      });
    }
  }

  private toRuleVO(entity: any): AutomationRuleVO {
    return {
      id: entity.id,
      projectId: entity.projectId,
      boardId: entity.boardId,
      name: entity.name,
      ruleKey: entity.ruleKey,
      eventType: entity.eventType,
      priority: entity.priority,
      isEnabled: entity.isEnabled === 1,
      mutualExclusionKey: entity.mutualExclusionKey,
      rolloutScope: entity.rolloutScope,
      conditionDsl: entity.conditionDsl,
      actionDsl: entity.actionDsl,
      version: entity.version,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  private toExecutionVO(entity: any): AutomationRuleExecutionVO {
    return {
      id: entity.id,
      ruleId: entity.ruleId,
      taskId: entity.taskId,
      status: entity.status,
      matched: entity.matched === 1,
      resultSummary: entity.resultSummary,
      errorMessage: entity.errorMessage,
      startedAt: entity.startedAt,
      finishedAt: entity.finishedAt,
      createdAt: entity.createdAt,
    };
  }
}
