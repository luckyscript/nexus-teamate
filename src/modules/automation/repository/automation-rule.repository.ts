import { Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../framework/db/base.repository';
import { AutomationRuleEntity } from '../entity/automation-rule.entity';
import { CurrentUser } from '../../../framework/auth/current-user.service';

@Provide()
export class AutomationRuleRepository extends BaseRepository<AutomationRuleEntity> {
  @InjectEntityModel(AutomationRuleEntity)
  @Inject()
  protected repository: Repository<AutomationRuleEntity>;

  async findAll(
    tenantId: number,
    filters: {
      projectId?: number;
      boardId?: number;
      eventType?: string;
      isEnabled?: boolean;
    },
    page: number,
    pageSize: number
  ): Promise<{ items: AutomationRuleEntity[]; total: number }> {
    const where: Record<string, unknown> = { tenantId };

    if (filters.projectId !== undefined) {
      where.projectId = filters.projectId;
    }
    if (filters.boardId !== undefined) {
      where.boardId = filters.boardId;
    }
    if (filters.eventType !== undefined) {
      where.eventType = filters.eventType;
    }
    if (filters.isEnabled !== undefined) {
      where.isEnabled = filters.isEnabled ? 1 : 0;
    }

    const [items, total] = await this.repository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { priority: 'DESC', createdAt: 'DESC' },
    });

    return { items, total };
  }

  async findById(
    id: number,
    tenantId: number
  ): Promise<AutomationRuleEntity | null> {
    return this.repository.findOne({ where: { id, tenantId } });
  }

  async findByEventType(
    eventType: string,
    tenantId: number,
    boardId?: number,
    projectId?: number
  ): Promise<AutomationRuleEntity[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('rule')
      .where('rule.tenantId = :tenantId', { tenantId })
      .andWhere('rule.eventType = :eventType', { eventType })
      .andWhere('rule.isEnabled = 1')
      .orderBy('rule.priority', 'DESC');

    if (boardId !== undefined) {
      queryBuilder.andWhere(
        '(rule.boardId = :boardId OR rule.boardId IS NULL)',
        { boardId }
      );
    }
    if (projectId !== undefined) {
      queryBuilder.andWhere(
        '(rule.projectId = :projectId OR rule.projectId IS NULL)',
        { projectId }
      );
    }

    return queryBuilder.getMany();
  }

  async create(
    rule: Omit<AutomationRuleEntity, 'id' | 'createdAt' | 'updatedAt' | 'version'>,
    user: CurrentUser
  ): Promise<AutomationRuleEntity> {
    const entity = this.repository.create({
      ...rule,
      createdBy: user.id,
      updatedBy: user.id,
      version: 1,
    });
    return this.repository.save(entity);
  }

  async update(
    id: number,
    changes: Partial<AutomationRuleEntity>,
    tenantId: number,
    user: CurrentUser
  ): Promise<AutomationRuleEntity | null> {
    const existing = await this.findById(id, tenantId);
    if (!existing) {
      return null;
    }

    Object.assign(existing, changes, {
      updatedBy: user.id,
      version: existing.version + 1,
    });
    return this.repository.save(existing);
  }

  async toggle(
    id: number,
    isEnabled: boolean,
    tenantId: number,
    user: CurrentUser
  ): Promise<AutomationRuleEntity | null> {
    return this.update(id, { isEnabled: isEnabled ? 1 : 0 }, tenantId, user);
  }

  async delete(id: number, tenantId: number): Promise<boolean> {
    const result = await this.repository.delete({ id, tenantId });
    return (result.affected ?? 0) > 0;
  }
}
