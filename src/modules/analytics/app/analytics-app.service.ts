import { Provide, Inject } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { TaskEntity } from '../../task/entity/task.entity';
import { AgentExecutionEntity } from '../../agent/entity/agent-execution.entity';
import { AgentDefinitionEntity } from '../../agent/entity/agent-definition.entity';
import { AutomationRuleEntity } from '../../automation/entity/automation-rule.entity';
import { AutomationRuleExecutionEntity } from '../../automation/entity/automation-rule-execution.entity';
import { SkillEntity } from '../../asset/entity/skill.entity';
import { CapsuleEntity } from '../../asset/entity/capsule.entity';
import { TemplateEntity } from '../../asset/entity/template.entity';
import { AssetBindingEntity } from '../../asset/entity/asset-binding.entity';
import { CurrentUser } from '../../../framework/auth/current-user.service';
import {
  AnalyticsQueryDto,
  AnalyticsOverviewVO,
  AnalyticsTrendVO,
  AgentRankingVO,
  AutomationFunnelVO,
} from '../dto/analytics.dto';

@Provide()
export class AnalyticsAppService {
  @InjectEntityModel(TaskEntity)
  @Inject()
  protected taskRepository: Repository<TaskEntity>;

  @InjectEntityModel(AgentExecutionEntity)
  @Inject()
  protected agentExecutionRepository: Repository<AgentExecutionEntity>;

  @InjectEntityModel(AgentDefinitionEntity)
  @Inject()
  protected agentDefinitionRepository: Repository<AgentDefinitionEntity>;

  @InjectEntityModel(AutomationRuleEntity)
  @Inject()
  protected automationRuleRepository: Repository<AutomationRuleEntity>;

  @InjectEntityModel(AutomationRuleExecutionEntity)
  @Inject()
  protected automationRuleExecutionRepository: Repository<AutomationRuleExecutionEntity>;

  @InjectEntityModel(SkillEntity)
  @Inject()
  protected skillRepository: Repository<SkillEntity>;

  @InjectEntityModel(CapsuleEntity)
  @Inject()
  protected capsuleRepository: Repository<CapsuleEntity>;

  @InjectEntityModel(TemplateEntity)
  @Inject()
  protected templateRepository: Repository<TemplateEntity>;

  @InjectEntityModel(AssetBindingEntity)
  @Inject()
  protected assetBindingRepository: Repository<AssetBindingEntity>;

  async getOverview(
    query: AnalyticsQueryDto,
    user: CurrentUser,
  ): Promise<AnalyticsOverviewVO> {
    const tenantId = user.tenantId;

    const { totalTasks, aiProcessedTasks } = await this.getTaskCounts(tenantId, query);
    const automatedTransitions = await this.getAutomatedTransitionCount(tenantId, query);
    const totalAgentExecutions = await this.getAgentExecutionCount(tenantId, query);
    const { totalPublishedAssets, assetsWithBindings } = await this.getAssetCounts(tenantId);

    const aiParticipationRate = this.safeRate(aiProcessedTasks, totalTasks);
    const automationCoverageRate = await this.getAutomationCoverageRate(tenantId, query, totalTasks);
    const assetReuseRate = this.safeRate(assetsWithBindings, totalPublishedAssets);
    const taskEfficiencyScore = this.safeRate(automatedTransitions, totalTasks);

    const avgRate = (aiParticipationRate + automationCoverageRate + assetReuseRate + taskEfficiencyScore) / 4;
    const intelligenceDensityLevel = this.getDensityLevel(avgRate);

    return {
      aiParticipationRate: Math.round(aiParticipationRate * 100) / 100,
      automationCoverageRate: Math.round(automationCoverageRate * 100) / 100,
      assetReuseRate: Math.round(assetReuseRate * 100) / 100,
      taskEfficiencyScore: Math.round(taskEfficiencyScore * 100) / 100,
      intelligenceDensityLevel,
      totalTasks,
      aiProcessedTasks,
      automatedTransitions,
      totalAgentExecutions,
      totalAssetsPublished: totalPublishedAssets,
    };
  }

  async getTrends(
    query: AnalyticsQueryDto,
    user: CurrentUser,
  ): Promise<AnalyticsTrendVO> {
    const tenantId = user.tenantId;

    let dateFrom: Date;
    let dateTo: Date;

    if (query.dateFrom && query.dateTo) {
      dateFrom = new Date(query.dateFrom);
      dateTo = new Date(query.dateTo);
      dateTo.setHours(23, 59, 59, 999);
    } else {
      dateTo = new Date();
      dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - 30);
    }

    const taskDailyCounts = await this.taskRepository
      .createQueryBuilder('t')
      .select("DATE_FORMAT(t.createdAt, '%Y-%m-%d')", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('t.tenantId = :tenantId', { tenantId })
      .andWhere('t.createdAt >= :dateFrom', { dateFrom })
      .andWhere('t.createdAt <= :dateTo', { dateTo })
      .groupBy("DATE_FORMAT(t.createdAt, '%Y-%m-%d')")
      .orderBy('date', 'ASC')
      .getRawMany();

    const agentDailyCounts = await this.agentExecutionRepository
      .createQueryBuilder('ae')
      .select("DATE_FORMAT(ae.createdAt, '%Y-%m-%d')", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('ae.tenantId = :tenantId', { tenantId })
      .andWhere('ae.createdAt >= :dateFrom', { dateFrom })
      .andWhere('ae.createdAt <= :dateTo', { dateTo })
      .groupBy("DATE_FORMAT(ae.createdAt, '%Y-%m-%d')")
      .orderBy('date', 'ASC')
      .getRawMany();

    const aiTaskDailyCounts = await this.taskRepository
      .createQueryBuilder('t')
      .select("DATE_FORMAT(t.createdAt, '%Y-%m-%d')", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('t.tenantId = :tenantId', { tenantId })
      .andWhere('t.aiState != :noneState', { noneState: 'none' })
      .andWhere('t.createdAt >= :dateFrom', { dateFrom })
      .andWhere('t.createdAt <= :dateTo', { dateTo })
      .groupBy("DATE_FORMAT(t.createdAt, '%Y-%m-%d')")
      .orderBy('date', 'ASC')
      .getRawMany();

    const automationDailyCounts = await this.automationRuleExecutionRepository
      .createQueryBuilder('are')
      .select("DATE_FORMAT(are.startedAt, '%Y-%m-%d')", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('are.tenantId = :tenantId', { tenantId })
      .andWhere('are.startedAt >= :dateFrom', { dateFrom })
      .andWhere('are.startedAt <= :dateTo', { dateTo })
      .groupBy("DATE_FORMAT(are.startedAt, '%Y-%m-%d')")
      .orderBy('date', 'ASC')
      .getRawMany();

    const taskMap = new Map<string, number>();
    for (const row of taskDailyCounts) {
      taskMap.set(row.date, Number(row.count));
    }

    const agentMap = new Map<string, number>();
    for (const row of agentDailyCounts) {
      agentMap.set(row.date, Number(row.count));
    }

    const aiTaskMap = new Map<string, number>();
    for (const row of aiTaskDailyCounts) {
      aiTaskMap.set(row.date, Number(row.count));
    }

    const automationMap = new Map<string, number>();
    for (const row of automationDailyCounts) {
      automationMap.set(row.date, Number(row.count));
    }

    const dates = new Set<string>();
    for (const d of [...taskMap.keys(), ...agentMap.keys()]) {
      dates.add(d);
    }

    const sortedDates = Array.from(dates).sort();

    const dataPoints = sortedDates.map((date) => {
      const taskCount = taskMap.get(date) || 0;
      const agentExecutionCount = agentMap.get(date) || 0;
      const aiTaskCount = aiTaskMap.get(date) || 0;
      const automationCount = automationMap.get(date) || 0;

      const aiParticipationRate = this.safeRate(aiTaskCount, taskCount);
      const automationCoverageRate = this.safeRate(automationCount, taskCount);

      return {
        date,
        aiParticipationRate: Math.round(aiParticipationRate * 100) / 100,
        automationCoverageRate: Math.round(automationCoverageRate * 100) / 100,
        taskCount,
        agentExecutionCount,
      };
    });

    return { dataPoints };
  }

  async getAgentRanking(
    query: AnalyticsQueryDto,
    user: CurrentUser,
  ): Promise<AgentRankingVO[]> {
    const tenantId = user.tenantId;

    const baseWhere = 'ae.tenantId = :tenantId';
    const params: Record<string, unknown> = { tenantId };

    if (query.dateFrom && query.dateTo) {
      const dateFrom = new Date(query.dateFrom);
      const dateTo = new Date(query.dateTo);
      dateTo.setHours(23, 59, 59, 999);
      params.dateFrom = dateFrom;
      params.dateTo = dateTo;
    }

    const dateFilter = query.dateFrom && query.dateTo
      ? ' AND ae.createdAt >= :dateFrom AND ae.createdAt <= :dateTo'
      : '';

    let taskFilter = '';
    if (query.projectId) {
      taskFilter += ' AND t.projectId = :projectId';
      params.projectId = query.projectId;
    }
    if (query.boardId) {
      taskFilter += ' AND t.boardId = :boardId';
      params.boardId = query.boardId;
    }

    const results = await this.agentExecutionRepository
      .createQueryBuilder('ae')
      .innerJoin(AgentDefinitionEntity, 'ad', 'ad.id = ae.agentId AND ad.tenantId = :tenantId')
      .leftJoin(TaskEntity, 't', 't.id = ae.taskId AND t.tenantId = :tenantId' + taskFilter)
      .select('ae.agentId', 'agentId')
      .addSelect('ad.name', 'agentName')
      .addSelect('COUNT(*)', 'totalExecutions')
      .addSelect(
        `SUM(CASE WHEN ae.status = 'completed' THEN 1 ELSE 0 END) / COUNT(*) * 100`,
        'successRate',
      )
      .addSelect(
        `AVG(
          CASE
            WHEN ae.startedAt IS NOT NULL AND ae.finishedAt IS NOT NULL
            THEN TIMESTAMPDIFF(SECOND, ae.startedAt, ae.finishedAt)
            ELSE NULL
          END
        )`,
        'avgDuration',
      )
      .where(baseWhere + dateFilter)
      .groupBy('ae.agentId')
      .addGroupBy('ad.name')
      .orderBy('totalExecutions', 'DESC')
      .getRawMany();

    return results.map((row) => ({
      agentId: Number(row.agentId),
      agentName: row.agentName as string,
      totalExecutions: Number(row.totalExecutions),
      successRate: row.successRate ? Math.round(Number(row.successRate) * 100) / 100 : 0,
      avgDuration: row.avgDuration ? Math.round(Number(row.avgDuration) * 100) / 100 : 0,
    }));
  }

  async getAutomationFunnel(
    query: AnalyticsQueryDto,
    user: CurrentUser,
  ): Promise<AutomationFunnelVO> {
    const tenantId = user.tenantId;

    const taskBaseQuery = this.taskRepository
      .createQueryBuilder('t')
      .where('t.tenantId = :tenantId', { tenantId });

    this.applyQueryFilters(taskBaseQuery, query);

    const totalTasks = await taskBaseQuery.getCount();

    const tasksWithAgentExecutionQuery = this.taskRepository
      .createQueryBuilder('t')
      .innerJoin(AgentExecutionEntity, 'ae', 'ae.taskId = t.id AND ae.tenantId = :tenantId', { tenantId })
      .where('t.tenantId = :tenantId', { tenantId });
    this.applyQueryFilters(tasksWithAgentExecutionQuery, query);
    const tasksWithAgentExecution = await tasksWithAgentExecutionQuery
      .select('COUNT(DISTINCT t.id)', 'count')
      .getRawOne()
      .then((r) => Number(r.count));

    const tasksWithAutomationRuleQuery = this.taskRepository
      .createQueryBuilder('t')
      .innerJoin(AutomationRuleExecutionEntity, 'are', 'are.taskId = t.id AND are.tenantId = :tenantId', { tenantId })
      .where('t.tenantId = :tenantId', { tenantId });
    this.applyQueryFilters(tasksWithAutomationRuleQuery, query);
    const tasksWithAutomationRule = await tasksWithAutomationRuleQuery
      .select('COUNT(DISTINCT t.id)', 'count')
      .getRawOne()
      .then((r) => Number(r.count));

    const autoTransitionedQuery = this.taskRepository
      .createQueryBuilder('t')
      .innerJoin(AutomationRuleExecutionEntity, 'are', 'are.taskId = t.id AND are.tenantId = :tenantId AND are.matched = 1', { tenantId })
      .where('t.tenantId = :tenantId', { tenantId });
    this.applyQueryFilters(autoTransitionedQuery, query);
    const tasksAutoTransitioned = await autoTransitionedQuery
      .select('COUNT(DISTINCT t.id)', 'count')
      .getRawOne()
      .then((r) => Number(r.count));

    const completedQuery = this.taskRepository
      .createQueryBuilder('t')
      .where('t.tenantId = :tenantId', { tenantId })
      .andWhere('t.statusCode IN (:...completedStates)', { completedStates: ['completed', 'done', 'closed'] });
    this.applyQueryFilters(completedQuery, query);
    const tasksCompleted = await completedQuery.getCount();

    return {
      totalTasks,
      tasksWithAgentExecution,
      tasksWithAutomationRule,
      tasksAutoTransitioned,
      tasksCompleted,
    };
  }

  private async getTaskCounts(
    tenantId: number,
    query: AnalyticsQueryDto,
  ): Promise<{ totalTasks: number; aiProcessedTasks: number }> {
    const baseQuery = this.taskRepository
      .createQueryBuilder('t')
      .where('t.tenantId = :tenantId', { tenantId });
    this.applyQueryFilters(baseQuery, query);
    const totalTasks = await baseQuery.getCount();

    const aiQuery = this.taskRepository
      .createQueryBuilder('t')
      .where('t.tenantId = :tenantId', { tenantId })
      .andWhere('t.aiState != :noneState', { noneState: 'none' });
    this.applyQueryFilters(aiQuery, query);
    const aiProcessedTasks = await aiQuery.getCount();

    return { totalTasks, aiProcessedTasks };
  }

  private async getAutomatedTransitionCount(
    tenantId: number,
    query: AnalyticsQueryDto,
  ): Promise<number> {
    const qb = this.automationRuleExecutionRepository
      .createQueryBuilder('are')
      .where('are.tenantId = :tenantId', { tenantId })
      .andWhere('are.matched = 1');

    if (query.dateFrom) {
      qb.andWhere('are.startedAt >= :dateFrom', { dateFrom: new Date(query.dateFrom) });
    }
    if (query.dateTo) {
      const dateTo = new Date(query.dateTo);
      dateTo.setHours(23, 59, 59, 999);
      qb.andWhere('are.startedAt <= :dateTo', { dateTo });
    }

    return qb.getCount();
  }

  private async getAgentExecutionCount(
    tenantId: number,
    query: AnalyticsQueryDto,
  ): Promise<number> {
    const qb = this.agentExecutionRepository
      .createQueryBuilder('ae')
      .where('ae.tenantId = :tenantId', { tenantId });

    if (query.dateFrom) {
      qb.andWhere('ae.createdAt >= :dateFrom', { dateFrom: new Date(query.dateFrom) });
    }
    if (query.dateTo) {
      const dateTo = new Date(query.dateTo);
      dateTo.setHours(23, 59, 59, 999);
      qb.andWhere('ae.createdAt <= :dateTo', { dateTo });
    }

    return qb.getCount();
  }

  private async getAssetCounts(
    tenantId: number,
  ): Promise<{ totalPublishedAssets: number; assetsWithBindings: number }> {
    const totalPublishedAssets = await this.skillRepository.count({
      where: { tenantId, status: 'published' } as any,
    });

    const capsuleCount = await this.capsuleRepository.count({
      where: { tenantId, status: 'published' } as any,
    });

    const templateCount = await this.templateRepository.count({
      where: { tenantId, status: 'published' } as any,
    });

    const totalPublished = totalPublishedAssets + capsuleCount + templateCount;

    const qb = this.assetBindingRepository
      .createQueryBuilder('ab')
      .select('COUNT(DISTINCT CONCAT(ab.assetType, "-", ab.assetId))', 'count')
      .where('ab.tenantId = :tenantId', { tenantId });

    const result = await qb.getRawOne();
    const assetsWithBindings = Number(result.count);

    return { totalPublishedAssets: totalPublished, assetsWithBindings };
  }

  private async getAutomationCoverageRate(
    tenantId: number,
    query: AnalyticsQueryDto,
    totalTasks: number,
  ): Promise<number> {
    if (totalTasks === 0) return 0;

    const qb = this.taskRepository
      .createQueryBuilder('t')
      .innerJoin(AutomationRuleExecutionEntity, 'are', 'are.taskId = t.id AND are.tenantId = :tenantId', { tenantId })
      .where('t.tenantId = :tenantId', { tenantId });
    this.applyQueryFilters(qb, query);

    const tasksWithAutomation = await qb
      .select('COUNT(DISTINCT t.id)', 'count')
      .getRawOne()
      .then((r) => Number(r.count));

    return (tasksWithAutomation / totalTasks) * 100;
  }

  private safeRate(numerator: number, denominator: number): number {
    if (denominator === 0) return 0;
    return (numerator / denominator) * 100;
  }

  private getDensityLevel(averageRate: number): string {
    if (averageRate >= 80) return 'L5';
    if (averageRate >= 60) return 'L4';
    if (averageRate >= 40) return 'L3';
    if (averageRate >= 20) return 'L2';
    return 'L1';
  }

  private applyQueryFilters(
    qb: ReturnType<typeof this.taskRepository.createQueryBuilder>,
    query: AnalyticsQueryDto,
  ): void {
    if (query.projectId) {
      qb.andWhere('t.projectId = :projectId', { projectId: query.projectId });
    }
    if (query.boardId) {
      qb.andWhere('t.boardId = :boardId', { boardId: query.boardId });
    }
    if (query.dateFrom) {
      qb.andWhere('t.createdAt >= :dateFrom', { dateFrom: new Date(query.dateFrom) });
    }
    if (query.dateTo) {
      const dateTo = new Date(query.dateTo);
      dateTo.setHours(23, 59, 59, 999);
      qb.andWhere('t.createdAt <= :dateTo', { dateTo });
    }
  }
}
