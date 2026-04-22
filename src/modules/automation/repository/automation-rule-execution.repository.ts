import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { AutomationRuleExecutionEntity } from '../entity/automation-rule-execution.entity';

@Provide()
export class AutomationRuleExecutionRepository {
  @InjectEntityModel(AutomationRuleExecutionEntity)
  protected repository: Repository<AutomationRuleExecutionEntity>;

  async create(
    execution: Omit<AutomationRuleExecutionEntity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<AutomationRuleExecutionEntity> {
    const entity = this.repository.create(execution);
    return this.repository.save(entity);
  }

  async findByRuleId(
    ruleId: number,
    tenantId: number,
    page: number,
    pageSize: number
  ): Promise<{ items: AutomationRuleExecutionEntity[]; total: number }> {
    return this.repository.findAndCount({
      where: { ruleId, tenantId },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    }).then(([items, total]) => ({ items, total }));
  }

  async findByTaskId(
    taskId: number,
    tenantId: number,
    page: number,
    pageSize: number
  ): Promise<{ items: AutomationRuleExecutionEntity[]; total: number }> {
    return this.repository.findAndCount({
      where: { taskId, tenantId },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    }).then(([items, total]) => ({ items, total }));
  }
}
