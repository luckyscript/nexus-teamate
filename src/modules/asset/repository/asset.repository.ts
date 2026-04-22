import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, Like } from 'typeorm';
import { SkillEntity } from '../entity/skill.entity';
import { CapsuleEntity } from '../entity/capsule.entity';
import { TemplateEntity } from '../entity/template.entity';
import { CurrentUser } from '../../../framework/auth/current-user.service';

@Provide()
export class AssetRepository {
  @InjectEntityModel(SkillEntity)
  protected repository: Repository<SkillEntity>;

  private capsuleRepository: Repository<CapsuleEntity>;

  private templateRepository: Repository<TemplateEntity>;

  async findSkills(
    tenantId: number,
    filters: { keyword?: string; category?: string; status?: string; visibility?: string; tags?: string[] },
    page: number,
    pageSize: number,
  ) {
    const where: Record<string, unknown> = { tenantId };

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.visibility) {
      where.visibility = filters.visibility;
    }
    if (filters.keyword) {
      where.name = Like(`%${filters.keyword}%`);
    }
    if (filters.tags && filters.tags.length > 0) {
      where.tagsJson = Like(`%"${filters.tags[0]}"%`);
    }

    const [list, total] = await this.repository.findAndCount({
      where: where as any,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    return { list, total, page, pageSize };
  }

  async findCapsules(
    tenantId: number,
    filters: { keyword?: string; sceneType?: string; status?: string; visibility?: string },
    page: number,
    pageSize: number,
  ) {
    const where: Record<string, unknown> = { tenantId };

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.sceneType) {
      where.sceneType = filters.sceneType;
    }
    if (filters.visibility) {
      where.visibility = filters.visibility;
    }
    if (filters.keyword) {
      where.name = Like(`%${filters.keyword}%`);
    }

    const [list, total] = await this.capsuleRepository.findAndCount({
      where: where as any,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    return { list, total, page, pageSize };
  }

  async findTemplates(
    tenantId: number,
    filters: { keyword?: string; templateType?: string; scopeType?: string; status?: string },
    page: number,
    pageSize: number,
  ) {
    const where: Record<string, unknown> = { tenantId };

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.templateType) {
      where.templateType = filters.templateType;
    }
    if (filters.scopeType) {
      where.scopeType = filters.scopeType;
    }
    if (filters.keyword) {
      where.name = Like(`%${filters.keyword}%`);
    }

    const [list, total] = await this.templateRepository.findAndCount({
      where: where as any,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    return { list, total, page, pageSize };
  }

  async findSkillById(id: number, tenantId: number): Promise<SkillEntity | null> {
    return this.repository.findOne({ where: { id, tenantId } as any });
  }

  async findCapsuleById(id: number, tenantId: number): Promise<CapsuleEntity | null> {
    return this.capsuleRepository.findOne({ where: { id, tenantId } as any });
  }

  async findTemplateById(id: number, tenantId: number): Promise<TemplateEntity | null> {
    return this.templateRepository.findOne({ where: { id, tenantId } as any });
  }

  async createSkill(skill: Partial<SkillEntity>, user: CurrentUser): Promise<SkillEntity> {
    const entity = this.repository.create({
      ...skill,
      tenantId: user.tenantId,
      createdBy: user.id,
      updatedBy: user.id,
    });
    return this.repository.save(entity);
  }

  async createCapsule(capsule: Partial<CapsuleEntity>, user: CurrentUser): Promise<CapsuleEntity> {
    const entity = this.capsuleRepository.create({
      ...capsule,
      tenantId: user.tenantId,
      createdBy: user.id,
      updatedBy: user.id,
    });
    return this.capsuleRepository.save(entity);
  }

  async createTemplate(template: Partial<TemplateEntity>, user: CurrentUser): Promise<TemplateEntity> {
    const entity = this.templateRepository.create({
      ...template,
      tenantId: user.tenantId,
      createdBy: user.id,
      updatedBy: user.id,
    });
    return this.templateRepository.save(entity);
  }

  async updateSkill(
    id: number,
    changes: Partial<SkillEntity>,
    tenantId: number,
    user: CurrentUser,
  ): Promise<SkillEntity | null> {
    changes.updatedBy = user.id;
    await this.repository.update({ id, tenantId } as any, changes);
    return this.repository.findOne({ where: { id, tenantId } as any });
  }

  async updateCapsule(
    id: number,
    changes: Partial<CapsuleEntity>,
    tenantId: number,
    user: CurrentUser,
  ): Promise<CapsuleEntity | null> {
    changes.updatedBy = user.id;
    await this.capsuleRepository.update({ id, tenantId } as any, changes);
    return this.capsuleRepository.findOne({ where: { id, tenantId } as any });
  }

  async updateTemplate(
    id: number,
    changes: Partial<TemplateEntity>,
    tenantId: number,
    user: CurrentUser,
  ): Promise<TemplateEntity | null> {
    changes.updatedBy = user.id;
    await this.templateRepository.update({ id, tenantId } as any, changes);
    return this.templateRepository.findOne({ where: { id, tenantId } as any });
  }

  async publishSkill(id: number, tenantId: number, user: CurrentUser): Promise<SkillEntity | null> {
    const existing = await this.repository.findOne({ where: { id, tenantId } as any });
    if (!existing) {
      return null;
    }
    await this.repository.update(
      { id, tenantId } as any,
      {
        status: 'published',
        publishedAt: new Date(),
        version: existing.version + 1,
        updatedBy: user.id,
      },
    );
    return this.repository.findOne({ where: { id, tenantId } as any });
  }

  async publishCapsule(id: number, tenantId: number, user: CurrentUser): Promise<CapsuleEntity | null> {
    const existing = await this.capsuleRepository.findOne({ where: { id, tenantId } as any });
    if (!existing) {
      return null;
    }
    await this.capsuleRepository.update(
      { id, tenantId } as any,
      {
        status: 'published',
        publishedAt: new Date(),
        version: existing.version + 1,
        updatedBy: user.id,
      },
    );
    return this.capsuleRepository.findOne({ where: { id, tenantId } as any });
  }

  async publishTemplate(id: number, tenantId: number, user: CurrentUser): Promise<TemplateEntity | null> {
    const existing = await this.templateRepository.findOne({ where: { id, tenantId } as any });
    if (!existing) {
      return null;
    }
    await this.templateRepository.update(
      { id, tenantId } as any,
      {
        status: 'published',
        publishedAt: new Date(),
        version: existing.version + 1,
        updatedBy: user.id,
      },
    );
    return this.templateRepository.findOne({ where: { id, tenantId } as any });
  }
}
