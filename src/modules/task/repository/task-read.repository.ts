import { Provide, InjectDataSource } from '@midwayjs/core';
import { DataSource, Like } from 'typeorm';
import { BaseRepository } from '../../../framework/db/base.repository';
import { TaskEntity } from '../entity/task.entity';
import { TaskLabelEntity } from '../entity/task-label.entity';
import { TaskCommentEntity } from '../entity/task-comment.entity';
import { TaskEventEntity } from '../entity/task-event.entity';
import { PageResult } from '../../../framework/db/base.repository';

export interface TaskFilters {
  keyword?: string;
  status?: string;
  priority?: string;
  assigneeId?: number;
  sourceType?: string;
  aiState?: string;
  takeoverState?: string;
}

export interface StatusColumnDef {
  statusCode: string;
  name: string;
}

@Provide()
export class TaskReadRepository extends BaseRepository<TaskEntity> {
  @InjectDataSource()
  dataSource: DataSource;

  getRepo() {
    return this.dataSource.getRepository(TaskEntity);
  }

  getLabelRepo() {
    return this.dataSource.getRepository(TaskLabelEntity);
  }

  getCommentRepo() {
    return this.dataSource.getRepository(TaskCommentEntity);
  }

  getEventRepo() {
    return this.dataSource.getRepository(TaskEventEntity);
  }

  async findAllByBoard(
    boardId: number,
    tenantId: number,
    filters: TaskFilters,
    page: number,
    pageSize: number,
    viewMode: 'kanban' | 'list' = 'list',
    columns?: StatusColumnDef[],
  ): Promise<PageResult<TaskEntity> | Record<string, PageResult<TaskEntity>>> {
    const repo = this.getRepo();
    const baseWhere: Record<string, unknown> = {
      tenantId,
      boardId,
      deletedAt: null,
    };

    if (filters.keyword) {
      baseWhere['title'] = Like(`%${filters.keyword}%`);
    }
    if (filters.status) {
      baseWhere['statusCode'] = filters.status;
    }
    if (filters.priority) {
      baseWhere['priority'] = filters.priority;
    }
    if (filters.assigneeId) {
      baseWhere['assigneeId'] = filters.assigneeId;
    }
    if (filters.sourceType) {
      baseWhere['sourceType'] = filters.sourceType;
    }
    if (filters.aiState) {
      baseWhere['aiState'] = filters.aiState;
    }
    if (filters.takeoverState) {
      baseWhere['takeoverState'] = filters.takeoverState;
    }

    if (viewMode === 'kanban' && columns && columns.length > 0) {
      const result: Record<string, PageResult<TaskEntity>> = {};
      for (const col of columns) {
        const where = { ...baseWhere, statusCode: col.statusCode };
        const [list, total] = await repo.findAndCount({
          where,
          skip: 0,
          take: 100,
          order: { createdAt: 'DESC' },
        });
        result[col.statusCode] = { list, total, page: 1, pageSize: 100 };
      }
      return result;
    }

    const [list, total] = await repo.findAndCount({
      where: baseWhere,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findById(
    id: number,
    tenantId: number,
  ): Promise<TaskEntity | null> {
    const repo = this.getRepo();
    return repo.findOne({ where: { id, tenantId, deletedAt: null } });
  }

  async findLabelsForTask(taskId: number): Promise<TaskLabelEntity[]> {
    const repo = this.getLabelRepo();
    return repo.find({ where: { taskId }, order: { createdAt: 'ASC' } });
  }

  async findCommentsForTask(
    taskId: number,
    tenantId: number,
  ): Promise<TaskCommentEntity[]> {
    const repo = this.getCommentRepo();
    return repo.find({
      where: { taskId, tenantId },
      order: { createdAt: 'ASC' },
    });
  }

  async findByParent(
    parentTaskId: number,
    tenantId: number,
  ): Promise<TaskEntity[]> {
    const repo = this.getRepo();
    return repo.find({
      where: { parentTaskId, tenantId, deletedAt: null },
      order: { createdAt: 'ASC' },
    });
  }

  async findEvents(
    taskId: number,
    tenantId: number,
    page: number,
    pageSize: number,
  ): Promise<PageResult<TaskEventEntity>> {
    const repo = this.getEventRepo();
    const [list, total] = await repo.findAndCount({
      where: { taskId, tenantId },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findLatestExecutions(taskId: number): Promise<
    Array<{
      id: number;
      agentId: number;
      status: string;
      startedAt: Date;
      finishedAt: Date;
    }>
  > {
    try {
      const result = await this.dataSource.query(
        `SELECT id, agent_id as agentId, status, started_at as startedAt, finished_at as finishedAt
         FROM agent_execution
         WHERE task_id = ? AND deleted_at IS NULL
         ORDER BY created_at DESC
         LIMIT 10`,
        [taskId],
      );
      return result.map((row: Record<string, unknown>) => ({
        id: Number(row.id),
        agentId: Number(row.agentId),
        status: String(row.status),
        startedAt: row.startedAt ? new Date(row.startedAt as string) : null,
        finishedAt: row.finishedAt ? new Date(row.finishedAt as string) : null,
      }));
    } catch {
      return [];
    }
  }
}
