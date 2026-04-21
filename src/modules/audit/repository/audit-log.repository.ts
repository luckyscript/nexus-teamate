import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository, PageResult } from '../../../framework/db/base.repository';
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
export class AuditLogRepository extends BaseRepository<AuditLogEntity> {
  @InjectEntityModel(AuditLogEntity)
  auditLogModel: Repository<AuditLogEntity>;

  async create(auditLog: Partial<AuditLogEntity>): Promise<AuditLogEntity> {
    const entity = this.auditLogModel.create(auditLog);
    return this.auditLogModel.save(entity);
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
      const [list, total] = await this.auditLogModel
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

    return this.findAndPaginate(where as any, page, pageSize, {
      orderBy: { createdAt: 'DESC' },
    });
  }

  async findByResource(
    resourceType: string,
    resourceId: number,
    tenantId: number,
    page: number,
    pageSize: number,
  ): Promise<PageResult<AuditLogEntity>> {
    const where = { tenantId, resourceType, resourceId };
    return this.findAndPaginate(where as any, page, pageSize, {
      orderBy: { createdAt: 'DESC' },
    });
  }
}
