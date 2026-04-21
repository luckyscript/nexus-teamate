import { Provide, Inject } from '@midwayjs/core';
import { AuditLogRepository, AuditLogFilters } from '../repository/audit-log.repository';
import { CurrentUser } from '../../../framework/auth/current-user.service';
import { PageRequestDto } from '../../../common/dto/pagination.dto';

export interface AuditLogParams {
  tenantId: number;
  operatorType: string;
  operatorId: number | null;
  resourceType: string;
  resourceId: number | null;
  action: string;
  detailJson?: Record<string, unknown>;
  ip?: string;
}

export interface AuditLogQuery extends PageRequestDto {
  resourceType?: string;
  resourceId?: number;
  action?: string;
  operatorType?: string;
  operatorId?: number;
  dateFrom?: string;
  dateTo?: string;
}

@Provide()
export class AuditService {
  @Inject()
  auditLogRepository: AuditLogRepository;

  async log(params: AuditLogParams): Promise<void> {
    await this.auditLogRepository.create({
      tenantId: params.tenantId,
      operatorType: params.operatorType,
      operatorId: params.operatorId,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      action: params.action,
      detailJson: params.detailJson ?? null,
      ip: params.ip ?? null,
    });
  }

  async listAuditLogs(
    query: AuditLogQuery,
    user: CurrentUser,
  ): Promise<{ list: any[]; pagination: { page: number; pageSize: number; total: number } }> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const filters: AuditLogFilters = {
      resourceType: query.resourceType,
      resourceId: query.resourceId,
      action: query.action,
      operatorType: query.operatorType,
      operatorId: query.operatorId,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
    };

    const result = await this.auditLogRepository.findAll(
      user.tenantId,
      filters,
      page,
      pageSize,
    );

    return {
      list: result.list,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
      },
    };
  }

  async getResourceHistory(
    resourceType: string,
    resourceId: number,
    user: CurrentUser,
  ): Promise<{ list: any[]; pagination: { page: number; pageSize: number; total: number } }> {
    const page = 1;
    const pageSize = 100;

    const result = await this.auditLogRepository.findByResource(
      resourceType,
      resourceId,
      user.tenantId,
      page,
      pageSize,
    );

    return {
      list: result.list,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
      },
    };
  }
}
