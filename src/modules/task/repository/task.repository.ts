import { Provide, InjectDataSource } from '@midwayjs/core';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../../framework/db/base.repository';
import { TaskEntity } from '../entity/task.entity';
import { TaskLabelEntity } from '../entity/task-label.entity';
import { TaskEventEntity } from '../entity/task-event.entity';

@Provide()
export class TaskRepository extends BaseRepository<TaskEntity> {
  @InjectDataSource()
  dataSource: DataSource;

  getRepo() {
    return this.dataSource.getRepository(TaskEntity);
  }

  getLabelRepo() {
    return this.dataSource.getRepository(TaskLabelEntity);
  }

  getEventRepo() {
    return this.dataSource.getRepository(TaskEventEntity);
  }

  async create(
    task: Partial<TaskEntity>,
    labels?: Array<{ key: string; value: string }>,
  ): Promise<TaskEntity> {
    return this.dataSource.transaction(async (manager) => {
      const entity = manager.getRepository(TaskEntity).create(task);
      const saved = await manager.getRepository(TaskEntity).save(entity);

      if (labels && labels.length > 0) {
        const labelEntities = labels.map((l) =>
          manager.getRepository(TaskLabelEntity).create({
            taskId: saved.id,
            tenantId: saved.tenantId,
            labelKey: l.key,
            labelValue: l.value,
          }),
        );
        await manager.getRepository(TaskLabelEntity).save(labelEntities);
      }

      return saved;
    });
  }

  async update(
    id: number,
    changes: Partial<TaskEntity>,
    tenantId: number,
  ): Promise<TaskEntity> {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(TaskEntity);
      const task = await repo.findOne({ where: { id, tenantId } });
      if (!task) {
        throw new Error('Task not found');
      }
      Object.assign(task, changes);
      task.version = task.version + 1;
      return repo.save(task);
    });
  }

  async transition(
    id: number,
    toStatusCode: string,
    reason: string,
    version: number,
    tenantId: number,
  ): Promise<TaskEntity> {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(TaskEntity);
      const task = await repo.findOne({ where: { id, tenantId } });
      if (!task) {
        throw new Error('Task not found');
      }
      if (task.version !== version) {
        throw new Error(
          `Version mismatch: expected ${version}, got ${task.version}`,
        );
      }
      task.statusCode = toStatusCode;
      task.version = task.version + 1;
      return repo.save(task);
    });
  }

  async updateAiState(
    id: number,
    aiState: string,
    tenantId: number,
  ): Promise<TaskEntity> {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(TaskEntity);
      const task = await repo.findOne({ where: { id, tenantId } });
      if (!task) {
        throw new Error('Task not found');
      }
      task.aiState = aiState;
      task.version = task.version + 1;
      return repo.save(task);
    });
  }

  async updateTakeoverState(
    id: number,
    takeoverState: string,
    tenantId: number,
  ): Promise<TaskEntity> {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(TaskEntity);
      const task = await repo.findOne({ where: { id, tenantId } });
      if (!task) {
        throw new Error('Task not found');
      }
      task.takeoverState = takeoverState;
      task.version = task.version + 1;
      return repo.save(task);
    });
  }

  async delete(id: number, tenantId: number): Promise<void> {
    const repo = this.getRepo();
    const task = await repo.findOne({ where: { id, tenantId } });
    if (!task) {
      throw new Error('Task not found');
    }
    task.deletedAt = new Date();
    task.version = task.version + 1;
    await repo.save(task);
  }

  async writeEvent(event: Partial<TaskEventEntity>): Promise<TaskEventEntity> {
    const repo = this.getEventRepo();
    const entity = repo.create(event);
    return repo.save(entity);
  }
}
