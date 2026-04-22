import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { PageResult } from '../../../framework/db/base.repository';
import { AuditLogEntity } from '../entity/audit-log.entity';

export interface AuditLogFilters {
  resourceType?: string;
  resourceId?: number;
  action?: string;
  operatorType?: string;
  operatorId?: number;
  dateFrom?: Date;
  dateTo?: Date;
}

@Provide()
export class AuditLogRepository {
  @InjectEntityModel(AuditLogEntity)
  protected repository: Repository<AuditLogEntity>;

  async create(auditLog: Partial<AuditLogEntity>): Promise<AuditLogEntity> {
    const entity = this.repository.create(auditLog);
    return this.repository.save(entity);
  }

  async findAll(
    tenantId: number,
    filters: AuditLogFilters,
    page: number,
    pageSize: number,
  ): Promise<PageResult<AuditLogEntity>> {
    const where: Record<string, unknown> = { tenantId };

    if (filters.resourceType) {
      where.resourceType = filters.resourceType;
    }
    if (filters.resourceId !== undefined && filters.resourceId !== null) {
      where.resourceId = filters.resourceId;
    }
    if (filters.action) {
      where.action = filters.action;
    }
    if (filters.operatorType) {
      where.operatorType = filters.operatorType;
    }
    if (filters.operatorId !== undefined && filters.operatorId !== null) {
      where.operatorId = filters.operatorId;
    }
    if (filters.dateFrom || filters.dateTo) {
      const dateConditions: string[] = [];
      const params: Date[] = [];
      if (filters.dateFrom) {
        dateConditions.push('audit_log.createdAt >= ?');
        params.push(filters.dateFrom);
      }
      if (filters.dateTo) {
        dateConditions.push('audit_log.createdAt <= ?');
        params.push(filters.dateTo);
      }
      const [list, total] = await this.repository
        .createQueryBuilder('audit_log')
        .where(Object.entries(where).reduce((acc, [key, value]) => {
          (acc as Record<string, unknown>)[`audit_log.${key}`] = value;
          return acc;
        }, {} as Record<string, unknown>))
        .andWhere(dateConditions.join(' AND '), params)
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .orderBy('audit_log.createdAt', 'DESC')
        .getManyAndCount();
      return { list, total, page, pageSize };
    }

    const [list, total] = await this.repository.findAndCount({
      where: where as any,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findByResource(
    resourceType: string,
    resourceId: number,
    tenantId: number,
    page: number,
    pageSize: number,
  ): Promise<PageResult<AuditLogEntity>> {
    const where = { tenantId, resourceType, resourceId };
    const [list, total] = await this.repository.findAndCount({
      where: where as any,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }
}
