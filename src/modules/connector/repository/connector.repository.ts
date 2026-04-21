import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository, PageResult } from '../../../framework/db/base.repository';
import { ConnectorDefinitionEntity } from '../entity/connector-definition.entity';
import { ConnectorInstanceEntity } from '../entity/connector-instance.entity';
import { ConnectorSyncJobEntity } from '../entity/connector-sync-job.entity';

@Provide()
export class ConnectorRepository extends BaseRepository<ConnectorInstanceEntity> {
  @InjectEntityModel(ConnectorDefinitionEntity)
  definitionModel: Repository<ConnectorDefinitionEntity>;

  @InjectEntityModel(ConnectorInstanceEntity)
  instanceModel: Repository<ConnectorInstanceEntity>;

  @InjectEntityModel(ConnectorSyncJobEntity)
  syncJobModel: Repository<ConnectorSyncJobEntity>;

  async findAllDefinitions(status?: string): Promise<ConnectorDefinitionEntity[]> {
    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }
    return this.definitionModel.find({ where, order: { createdAt: 'DESC' } });
  }

  async findDefinitionById(id: number): Promise<ConnectorDefinitionEntity | null> {
    return this.definitionModel.findOne({ where: { id } });
  }

  async findDefinitionByCode(code: string): Promise<ConnectorDefinitionEntity | null> {
    return this.definitionModel.findOne({ where: { code } });
  }

  async findInstances(
    tenantId: number,
    filters: { definitionId?: number; status?: string },
    page: number,
    pageSize: number,
  ): Promise<PageResult<ConnectorInstanceEntity>> {
    const where: Record<string, unknown> = { tenantId };
    if (filters.definitionId) {
      where.definitionId = filters.definitionId;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    return this.findAndPaginate(where as any, page, pageSize, {
      orderBy: { createdAt: 'DESC' },
    });
  }

  async findInstanceById(
    id: number,
    tenantId: number,
  ): Promise<ConnectorInstanceEntity | null> {
    return this.instanceModel.findOne({ where: { id, tenantId } });
  }

  async createInstance(
    instance: Partial<ConnectorInstanceEntity>,
  ): Promise<ConnectorInstanceEntity> {
    const entity = this.instanceModel.create(instance);
    return this.instanceModel.save(entity);
  }

  async updateInstance(
    id: number,
    changes: Partial<ConnectorInstanceEntity>,
    tenantId: number,
  ): Promise<ConnectorInstanceEntity | null> {
    await this.instanceModel.update({ id, tenantId }, changes);
    return this.instanceModel.findOne({ where: { id, tenantId } });
  }

  async deleteInstance(id: number, tenantId: number): Promise<boolean> {
    const result = await this.instanceModel.delete({ id, tenantId });
    return (result.affected ?? 0) > 0;
  }

  async createSyncJob(
    syncJob: Partial<ConnectorSyncJobEntity>,
  ): Promise<ConnectorSyncJobEntity> {
    const entity = this.syncJobModel.create(syncJob);
    return this.syncJobModel.save(entity);
  }

  async findSyncJobs(
    instanceId: number,
    tenantId: number,
    page: number,
    pageSize: number,
  ): Promise<PageResult<ConnectorSyncJobEntity>> {
    return this.findAndPaginate(
      { tenantId, instanceId } as any,
      page,
      pageSize,
      { orderBy: { createdAt: 'DESC' } },
    );
  }

  async findLatestSyncJob(
    instanceId: number,
    tenantId: number,
  ): Promise<ConnectorSyncJobEntity | null> {
    return this.syncJobModel.findOne({
      where: { instanceId, tenantId },
      order: { createdAt: 'DESC' },
    });
  }
}
