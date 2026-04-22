import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, Like } from 'typeorm';
import { AgentDefinitionEntity } from '../entity/agent-definition.entity';
import { CurrentUser } from '../../../framework/auth/current-user.service';

@Provide()
export class AgentRepository {
  @InjectEntityModel(AgentDefinitionEntity)
  protected repository: Repository<AgentDefinitionEntity>;

  async findAll(
    tenantId: number,
    filters: { keyword?: string; status?: string; category?: string },
    page: number,
    pageSize: number,
  ): Promise<{ items: AgentDefinitionEntity[]; total: number }> {
    const where: Record<string, unknown> = { tenantId };

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.keyword) {
      where.name = Like(`%${filters.keyword}%`);
    }

    const [items, total] = await this.repository.findAndCount({
      where: where as any,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    return { items, total };
  }

  async findById(id: number, tenantId: number): Promise<AgentDefinitionEntity | null> {
    return this.repository.findOne({ where: { id, tenantId } as any });
  }

  async findByKey(
    agentKey: string,
    tenantId: number,
    version?: number,
  ): Promise<AgentDefinitionEntity | null> {
    if (version !== undefined) {
      return this.repository.findOne({
        where: { agentKey, tenantId, version } as any,
      });
    }

    return this.repository.findOne({
      where: { agentKey, tenantId } as any,
      order: { version: 'DESC' },
    });
  }

  async create(
    agent: Partial<AgentDefinitionEntity>,
    user: CurrentUser,
  ): Promise<AgentDefinitionEntity> {
    const entity = this.repository.create({
      ...agent,
      tenantId: user.tenantId,
      createdBy: user.id,
      updatedBy: user.id,
    });
    return this.repository.save(entity);
  }

  async update(
    id: number,
    changes: Partial<AgentDefinitionEntity>,
    tenantId: number,
    user: CurrentUser,
  ): Promise<AgentDefinitionEntity | null> {
    changes.updatedBy = user.id;
    await this.repository.update({ id, tenantId } as any, changes);
    return this.repository.findOne({ where: { id, tenantId } as any });
  }

  async publish(id: number, user: CurrentUser): Promise<AgentDefinitionEntity> {
    const existing = await this.repository.findOne({ where: { id } as any });
    if (!existing) {
      throw new Error('Agent definition not found');
    }

    const newVersion = existing.version + 1;
    const published = this.repository.create({
      agentKey: existing.agentKey,
      name: existing.name,
      category: existing.category,
      ownerType: existing.ownerType,
      status: 'published',
      description: existing.description,
      promptTemplate: existing.promptTemplate,
      inputSchema: existing.inputSchema,
      outputSchema: existing.outputSchema,
      toolPolicy: existing.toolPolicy,
      assetBindings: existing.assetBindings,
      modelConfig: existing.modelConfig,
      retryPolicy: existing.retryPolicy,
      timeoutSeconds: existing.timeoutSeconds,
      version: newVersion,
      isBuiltin: existing.isBuiltin,
      tenantId: existing.tenantId,
      createdBy: user.id,
      updatedBy: user.id,
    });

    await this.repository.update({ id } as any, { status: 'deprecated', updatedBy: user.id });

    return this.repository.save(published);
  }

  async delete(id: number, tenantId: number): Promise<boolean> {
    const result = await this.repository.delete({ id, tenantId } as any);
    return (result.affected ?? 0) > 0;
  }
}
