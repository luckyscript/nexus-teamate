import { Provide, Inject } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../framework/db/base.repository';
import { AgentExecutionEntity } from '../entity/agent-execution.entity';
import { AgentExecutionLogEntity } from '../entity/agent-execution-log.entity';

@Provide()
export class AgentExecutionRepository extends BaseRepository<AgentExecutionEntity> {
  @InjectEntityModel(AgentExecutionEntity)
  @Inject()
  protected repository: Repository<AgentExecutionEntity>;

  @InjectEntityModel(AgentExecutionLogEntity)
  private logRepository: Repository<AgentExecutionLogEntity>;

  async create(
    execution: Partial<AgentExecutionEntity>,
  ): Promise<AgentExecutionEntity> {
    const entity = this.repository.create(execution);
    return this.repository.save(entity);
  }

  async findById(id: number, tenantId: number): Promise<AgentExecutionEntity | null> {
    return this.repository.findOne({ where: { id, tenantId } as any });
  }

  async findAll(
    query: { taskId?: number; agentId?: number; status?: string },
    tenantId: number,
  ): Promise<{ items: AgentExecutionEntity[]; total: number }> {
    const where: Record<string, unknown> = { tenantId };

    if (query.taskId !== undefined) {
      where.taskId = query.taskId;
    }
    if (query.agentId !== undefined) {
      where.agentId = query.agentId;
    }
    if (query.status) {
      where.status = query.status;
    }

    const [items, total] = await this.repository.findAndCount({
      where: where as any,
      skip: 0,
      take: 100,
      order: { createdAt: 'DESC' },
    });

    return { items, total };
  }

  async findByTaskId(
    taskId: number,
    tenantId: number,
  ): Promise<AgentExecutionEntity[]> {
    return this.repository.find({
      where: { taskId, tenantId } as any,
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(
    id: number,
    status: string,
    updates: Partial<AgentExecutionEntity> = {},
  ): Promise<void> {
    const now = new Date();
    const setFields: Record<string, unknown> = { status, ...updates };

    if (status === 'running' && !updates.startedAt) {
      setFields.startedAt = now;
    }
    if (['succeeded', 'failed', 'terminated'].includes(status) && !updates.finishedAt) {
      setFields.finishedAt = now;
    }

    await this.repository.update({ id } as any, setFields);
  }

  async createLog(
    log: Partial<AgentExecutionLogEntity>,
  ): Promise<AgentExecutionLogEntity> {
    const entity = this.logRepository.create(log);
    return this.logRepository.save(entity);
  }

  async getExecutionLogs(
    executionId: number,
    tenantId: number,
  ): Promise<AgentExecutionLogEntity[]> {
    return this.logRepository.find({
      where: { executionId, tenantId } as any,
      order: { createdAt: 'ASC' },
    });
  }

  async getExecutionStats(
    agentId: number,
    tenantId: number,
  ): Promise<{ totalRuns: number; successRate: number; avgDuration: number }> {
    const result = await this.repository
      .createQueryBuilder('e')
      .select('COUNT(*)', 'totalRuns')
      .addSelect(
        'SUM(CASE WHEN e.status = :succeeded THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0) * 100',
        'successRate',
      )
      .addSelect(
        'AVG(TIMESTAMPDIFF(SECOND, e.startedAt, e.finishedAt))',
        'avgDuration',
      )
      .where('e.agentId = :agentId AND e.tenantId = :tenantId', { agentId, tenantId })
      .setParameters({ succeeded: 'succeeded', agentId, tenantId })
      .getRawOne();

    return {
      totalRuns: Number(result?.totalRuns ?? 0),
      successRate: Number(result?.successRate ?? 0),
      avgDuration: Number(result?.avgDuration ?? 0),
    };
  }
}
