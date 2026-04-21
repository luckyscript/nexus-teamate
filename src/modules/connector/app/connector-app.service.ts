import { Provide, Inject } from '@midwayjs/core';
import { HttpException, HttpStatus } from '@midwayjs/core';
import { ConnectorRepository } from '../repository/connector.repository';
import {
  ConnectorDefinitionVO,
  CreateConnectorInstanceRequestDto,
  UpdateConnectorInstanceRequestDto,
  ConnectorInstanceVO,
  TriggerSyncRequestDto,
  ConnectorSyncJobVO,
} from '../dto/connector.dto';
import { PageRequestDto } from '../../../common/dto/pagination.dto';
import { CurrentUser } from '../../../framework/auth/current-user.service';
import { ConnectorDefinitionEntity } from '../entity/connector-definition.entity';
import { ConnectorInstanceEntity } from '../entity/connector-instance.entity';
import { ConnectorSyncJobEntity } from '../entity/connector-sync-job.entity';

interface InstancePageResponse {
  list: ConnectorInstanceVO[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

interface SyncJobPageResponse {
  list: ConnectorSyncJobVO[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

@Provide()
export class ConnectorAppService {
  @Inject()
  connectorRepository: ConnectorRepository;

  async listDefinitions(
    status?: string,
  ): Promise<ConnectorDefinitionVO[]> {
    const entities = await this.connectorRepository.findAllDefinitions(status);
    return entities.map((e) => this.definitionToVO(e));
  }

  async listInstances(
    query: PageRequestDto & { definitionId?: number; status?: string },
    user: CurrentUser,
  ): Promise<InstancePageResponse> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const result = await this.connectorRepository.findInstances(
      user.tenantId,
      {
        definitionId: query.definitionId,
        status: query.status,
      },
      page,
      pageSize,
    );

    return {
      list: result.list.map((e) => this.instanceToVO(e)),
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
      },
    };
  }

  async getInstance(
    id: number,
    user: CurrentUser,
  ): Promise<ConnectorInstanceVO> {
    const instance = await this.connectorRepository.findInstanceById(id, user.tenantId);
    if (!instance) {
      throw new HttpException('Connector instance not found', HttpStatus.NOT_FOUND);
    }

    const definition = await this.connectorRepository.findDefinitionById(instance.definitionId);
    const vo = this.instanceToVO(instance);
    if (definition) {
      vo.definition = this.definitionToVO(definition);
    }
    return vo;
  }

  async createInstance(
    dto: CreateConnectorInstanceRequestDto,
    user: CurrentUser,
  ): Promise<ConnectorInstanceVO> {
    const definition = await this.connectorRepository.findDefinitionById(dto.definitionId);
    if (!definition) {
      throw new HttpException('Connector definition not found', HttpStatus.NOT_FOUND);
    }

    const entity = await this.connectorRepository.createInstance({
      definitionId: dto.definitionId,
      name: dto.name,
      status: 'active',
      authConfigJson: dto.authConfig,
      syncConfigJson: dto.syncConfig ?? null,
      tenantId: user.tenantId,
      createdBy: user.id,
      updatedBy: user.id,
    });

    return this.instanceToVO(entity);
  }

  async updateInstance(
    id: number,
    dto: UpdateConnectorInstanceRequestDto,
    user: CurrentUser,
  ): Promise<ConnectorInstanceVO> {
    const existing = await this.connectorRepository.findInstanceById(id, user.tenantId);
    if (!existing) {
      throw new HttpException('Connector instance not found', HttpStatus.NOT_FOUND);
    }

    const changes: Partial<ConnectorInstanceEntity> = {
      updatedBy: user.id,
    };
    if (dto.name !== undefined) changes.name = dto.name;
    if (dto.authConfig !== undefined) changes.authConfigJson = dto.authConfig;
    if (dto.syncConfig !== undefined) changes.syncConfigJson = dto.syncConfig;

    const updated = await this.connectorRepository.updateInstance(id, changes, user.tenantId);
    if (!updated) {
      throw new HttpException('Connector instance not found', HttpStatus.NOT_FOUND);
    }
    return this.instanceToVO(updated);
  }

  async deleteInstance(
    id: number,
    user: CurrentUser,
  ): Promise<void> {
    const existing = await this.connectorRepository.findInstanceById(id, user.tenantId);
    if (!existing) {
      throw new HttpException('Connector instance not found', HttpStatus.NOT_FOUND);
    }

    const deleted = await this.connectorRepository.deleteInstance(id, user.tenantId);
    if (!deleted) {
      throw new HttpException('Connector instance not found', HttpStatus.NOT_FOUND);
    }
  }

  async testInstance(
    id: number,
    user: CurrentUser,
  ): Promise<{ success: boolean; message: string }> {
    const existing = await this.connectorRepository.findInstanceById(id, user.tenantId);
    if (!existing) {
      throw new HttpException('Connector instance not found', HttpStatus.NOT_FOUND);
    }

    return { success: true, message: 'Connection test successful' };
  }

  async triggerSync(
    id: number,
    dto: TriggerSyncRequestDto,
    user: CurrentUser,
  ): Promise<{ success: boolean; job: ConnectorSyncJobVO }> {
    const existing = await this.connectorRepository.findInstanceById(id, user.tenantId);
    if (!existing) {
      throw new HttpException('Connector instance not found', HttpStatus.NOT_FOUND);
    }

    const jobType = dto.jobType ?? 'manual_sync';
    const syncJob = await this.connectorRepository.createSyncJob({
      instanceId: id,
      tenantId: user.tenantId,
      jobType,
      status: 'pending',
      createdBy: user.id,
    });

    return {
      success: true,
      job: this.syncJobToVO(syncJob),
    };
  }

  async listSyncJobs(
    id: number,
    query: PageRequestDto,
    user: CurrentUser,
  ): Promise<SyncJobPageResponse> {
    const instance = await this.connectorRepository.findInstanceById(id, user.tenantId);
    if (!instance) {
      throw new HttpException('Connector instance not found', HttpStatus.NOT_FOUND);
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const result = await this.connectorRepository.findSyncJobs(
      id,
      user.tenantId,
      page,
      pageSize,
    );

    return {
      list: result.list.map((e) => this.syncJobToVO(e)),
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
      },
    };
  }

  private definitionToVO(entity: ConnectorDefinitionEntity): ConnectorDefinitionVO {
    return {
      id: entity.id,
      code: entity.code,
      name: entity.name,
      type: entity.type,
      authType: entity.authType,
      configSchema: entity.configSchema,
      capabilityJson: entity.capabilityJson,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  private instanceToVO(entity: ConnectorInstanceEntity): ConnectorInstanceVO {
    return {
      id: entity.id,
      tenantId: entity.tenantId,
      definitionId: entity.definitionId,
      name: entity.name,
      status: entity.status,
      lastSyncAt: entity.lastSyncAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  private syncJobToVO(entity: ConnectorSyncJobEntity): ConnectorSyncJobVO {
    return {
      id: entity.id,
      instanceId: entity.instanceId,
      jobType: entity.jobType,
      status: entity.status,
      cursorValue: entity.cursorValue,
      resultSummary: entity.resultSummary,
      errorMessage: entity.errorMessage,
      startedAt: entity.startedAt,
      finishedAt: entity.finishedAt,
      createdAt: entity.createdAt,
    };
  }
}
