import { Provide, Inject } from '@midwayjs/core';
import { HttpException, HttpStatus } from '@midwayjs/core';
import { AssetRepository } from '../repository/asset.repository';
import { AssetBindingRepository } from '../repository/asset-binding.repository';
import { CurrentUser } from '../../../framework/auth/current-user.service';
import {
  CreateSkillRequestDto,
  UpdateSkillRequestDto,
  CreateCapsuleRequestDto,
  UpdateCapsuleRequestDto,
  CreateTemplateRequestDto,
  UpdateTemplateRequestDto,
  CreateAssetBindingRequestDto,
  SkillVO,
  CapsuleVO,
  TemplateVO,
  AssetBindingVO,
} from '../dto/asset.dto';
import { SkillEntity } from '../entity/skill.entity';
import { CapsuleEntity } from '../entity/capsule.entity';
import { TemplateEntity } from '../entity/template.entity';

@Provide()
export class AssetAppService {
  @Inject()
  assetRepository: AssetRepository;

  @Inject()
  assetBindingRepository: AssetBindingRepository;

  async createSkill(dto: CreateSkillRequestDto, user: CurrentUser): Promise<SkillVO> {
    const entity = await this.assetRepository.createSkill(
      {
        skillKey: dto.skillKey,
        name: dto.name,
        category: dto.category,
        status: 'draft',
        visibility: dto.visibility ?? 'private',
        summary: dto.summary ?? null,
        content: dto.content,
        tagsJson: dto.tags ?? null,
        version: 1,
        publishedAt: null,
      },
      user,
    );
    return this.toSkillVO(entity);
  }

  async listSkills(
    query: { keyword?: string; category?: string; status?: string; page?: number; pageSize?: number },
    user: CurrentUser,
  ) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const result = await this.assetRepository.findSkills(user.tenantId, {
      keyword: query.keyword,
      category: query.category,
      status: query.status,
    }, page, pageSize);

    return {
      list: result.list.map((e) => this.toSkillVO(e)),
      pagination: { page, pageSize, total: result.total },
    };
  }

  async getSkill(id: number, user: CurrentUser): Promise<SkillVO> {
    const entity = await this.assetRepository.findSkillById(id, user.tenantId);
    if (!entity) {
      throw new HttpException('Skill not found', HttpStatus.NOT_FOUND);
    }
    return this.toSkillVO(entity);
  }

  async updateSkill(id: number, dto: UpdateSkillRequestDto, user: CurrentUser): Promise<SkillVO> {
    const existing = await this.assetRepository.findSkillById(id, user.tenantId);
    if (!existing) {
      throw new HttpException('Skill not found', HttpStatus.NOT_FOUND);
    }

    if (existing.status === 'published') {
      throw new HttpException('Cannot update a published skill', HttpStatus.BAD_REQUEST);
    }

    const changes: Partial<SkillEntity> = {};
    if (dto.skillKey !== undefined) changes.skillKey = dto.skillKey;
    if (dto.name !== undefined) changes.name = dto.name;
    if (dto.category !== undefined) changes.category = dto.category;
    if (dto.visibility !== undefined) changes.visibility = dto.visibility;
    if (dto.summary !== undefined) changes.summary = dto.summary;
    if (dto.content !== undefined) changes.content = dto.content;
    if (dto.tags !== undefined) changes.tagsJson = dto.tags;

    const updated = await this.assetRepository.updateSkill(id, changes, user.tenantId, user);
    if (!updated) {
      throw new HttpException('Skill not found', HttpStatus.NOT_FOUND);
    }
    return this.toSkillVO(updated);
  }

  async publishSkill(id: number, user: CurrentUser): Promise<SkillVO> {
    const existing = await this.assetRepository.findSkillById(id, user.tenantId);
    if (!existing) {
      throw new HttpException('Skill not found', HttpStatus.NOT_FOUND);
    }

    if (existing.status !== 'draft') {
      throw new HttpException('Only draft skills can be published', HttpStatus.BAD_REQUEST);
    }

    const updated = await this.assetRepository.publishSkill(id, user.tenantId, user);
    if (!updated) {
      throw new HttpException('Skill not found', HttpStatus.NOT_FOUND);
    }
    return this.toSkillVO(updated);
  }

  async deleteSkill(id: number, user: CurrentUser): Promise<void> {
    const existing = await this.assetRepository.findSkillById(id, user.tenantId);
    if (!existing) {
      throw new HttpException('Skill not found', HttpStatus.NOT_FOUND);
    }

    await this.assetRepository.repository.delete({ id, tenantId: user.tenantId } as any);
  }

  async createCapsule(dto: CreateCapsuleRequestDto, user: CurrentUser): Promise<CapsuleVO> {
    const entity = await this.assetRepository.createCapsule(
      {
        capsuleKey: dto.capsuleKey,
        name: dto.name,
        sceneType: dto.sceneType,
        status: 'draft',
        visibility: dto.visibility ?? 'private',
        summary: dto.summary ?? null,
        content: dto.content,
        tagsJson: dto.tags ?? null,
        version: 1,
        publishedAt: null,
      },
      user,
    );
    return this.toCapsuleVO(entity);
  }

  async listCapsules(
    query: { keyword?: string; sceneType?: string; status?: string; page?: number; pageSize?: number },
    user: CurrentUser,
  ) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const result = await this.assetRepository.findCapsules(user.tenantId, {
      keyword: query.keyword,
      sceneType: query.sceneType,
      status: query.status,
    }, page, pageSize);

    return {
      list: result.list.map((e) => this.toCapsuleVO(e)),
      pagination: { page, pageSize, total: result.total },
    };
  }

  async getCapsule(id: number, user: CurrentUser): Promise<CapsuleVO> {
    const entity = await this.assetRepository.findCapsuleById(id, user.tenantId);
    if (!entity) {
      throw new HttpException('Capsule not found', HttpStatus.NOT_FOUND);
    }
    return this.toCapsuleVO(entity);
  }

  async updateCapsule(id: number, dto: UpdateCapsuleRequestDto, user: CurrentUser): Promise<CapsuleVO> {
    const existing = await this.assetRepository.findCapsuleById(id, user.tenantId);
    if (!existing) {
      throw new HttpException('Capsule not found', HttpStatus.NOT_FOUND);
    }

    if (existing.status === 'published') {
      throw new HttpException('Cannot update a published capsule', HttpStatus.BAD_REQUEST);
    }

    const changes: Partial<CapsuleEntity> = {};
    if (dto.capsuleKey !== undefined) changes.capsuleKey = dto.capsuleKey;
    if (dto.name !== undefined) changes.name = dto.name;
    if (dto.sceneType !== undefined) changes.sceneType = dto.sceneType;
    if (dto.visibility !== undefined) changes.visibility = dto.visibility;
    if (dto.summary !== undefined) changes.summary = dto.summary;
    if (dto.content !== undefined) changes.content = dto.content;
    if (dto.tags !== undefined) changes.tagsJson = dto.tags;

    const updated = await this.assetRepository.updateCapsule(id, changes, user.tenantId, user);
    if (!updated) {
      throw new HttpException('Capsule not found', HttpStatus.NOT_FOUND);
    }
    return this.toCapsuleVO(updated);
  }

  async publishCapsule(id: number, user: CurrentUser): Promise<CapsuleVO> {
    const existing = await this.assetRepository.findCapsuleById(id, user.tenantId);
    if (!existing) {
      throw new HttpException('Capsule not found', HttpStatus.NOT_FOUND);
    }

    if (existing.status !== 'draft') {
      throw new HttpException('Only draft capsules can be published', HttpStatus.BAD_REQUEST);
    }

    const updated = await this.assetRepository.publishCapsule(id, user.tenantId, user);
    if (!updated) {
      throw new HttpException('Capsule not found', HttpStatus.NOT_FOUND);
    }
    return this.toCapsuleVO(updated);
  }

  async deleteCapsule(id: number, user: CurrentUser): Promise<void> {
    const existing = await this.assetRepository.findCapsuleById(id, user.tenantId);
    if (!existing) {
      throw new HttpException('Capsule not found', HttpStatus.NOT_FOUND);
    }

    await this.assetRepository.capsuleRepository.delete({ id, tenantId: user.tenantId } as any);
  }

  async createTemplate(dto: CreateTemplateRequestDto, user: CurrentUser): Promise<TemplateVO> {
    const entity = await this.assetRepository.createTemplate(
      {
        templateKey: dto.templateKey,
        templateType: dto.templateType,
        name: dto.name,
        scopeType: dto.scopeType ?? 'system',
        status: 'draft',
        payload: dto.payload,
        version: 1,
        publishedAt: null,
      },
      user,
    );
    return this.toTemplateVO(entity);
  }

  async listTemplates(
    query: { keyword?: string; templateType?: string; scopeType?: string; status?: string; page?: number; pageSize?: number },
    user: CurrentUser,
  ) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const result = await this.assetRepository.findTemplates(user.tenantId, {
      keyword: query.keyword,
      templateType: query.templateType,
      scopeType: query.scopeType,
      status: query.status,
    }, page, pageSize);

    return {
      list: result.list.map((e) => this.toTemplateVO(e)),
      pagination: { page, pageSize, total: result.total },
    };
  }

  async getTemplate(id: number, user: CurrentUser): Promise<TemplateVO> {
    const entity = await this.assetRepository.findTemplateById(id, user.tenantId);
    if (!entity) {
      throw new HttpException('Template not found', HttpStatus.NOT_FOUND);
    }
    return this.toTemplateVO(entity);
  }

  async updateTemplate(id: number, dto: UpdateTemplateRequestDto, user: CurrentUser): Promise<TemplateVO> {
    const existing = await this.assetRepository.findTemplateById(id, user.tenantId);
    if (!existing) {
      throw new HttpException('Template not found', HttpStatus.NOT_FOUND);
    }

    if (existing.status === 'published') {
      throw new HttpException('Cannot update a published template', HttpStatus.BAD_REQUEST);
    }

    const changes: Partial<TemplateEntity> = {};
    if (dto.templateKey !== undefined) changes.templateKey = dto.templateKey;
    if (dto.templateType !== undefined) changes.templateType = dto.templateType;
    if (dto.name !== undefined) changes.name = dto.name;
    if (dto.scopeType !== undefined) changes.scopeType = dto.scopeType;
    if (dto.payload !== undefined) changes.payload = dto.payload;

    const updated = await this.assetRepository.updateTemplate(id, changes, user.tenantId, user);
    if (!updated) {
      throw new HttpException('Template not found', HttpStatus.NOT_FOUND);
    }
    return this.toTemplateVO(updated);
  }

  async publishTemplate(id: number, user: CurrentUser): Promise<TemplateVO> {
    const existing = await this.assetRepository.findTemplateById(id, user.tenantId);
    if (!existing) {
      throw new HttpException('Template not found', HttpStatus.NOT_FOUND);
    }

    if (existing.status !== 'draft') {
      throw new HttpException('Only draft templates can be published', HttpStatus.BAD_REQUEST);
    }

    const updated = await this.assetRepository.publishTemplate(id, user.tenantId, user);
    if (!updated) {
      throw new HttpException('Template not found', HttpStatus.NOT_FOUND);
    }
    return this.toTemplateVO(updated);
  }

  async deleteTemplate(id: number, user: CurrentUser): Promise<void> {
    const existing = await this.assetRepository.findTemplateById(id, user.tenantId);
    if (!existing) {
      throw new HttpException('Template not found', HttpStatus.NOT_FOUND);
    }

    await this.assetRepository.templateRepository.delete({ id, tenantId: user.tenantId } as any);
  }

  async createBinding(dto: CreateAssetBindingRequestDto, user: CurrentUser): Promise<AssetBindingVO> {
    const entity = await this.assetBindingRepository.create(
      {
        assetType: dto.assetType,
        assetId: dto.assetId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        bindType: dto.bindType ?? 'runtime_context',
      },
      user,
    );
    return this.toBindingVO(entity);
  }

  async listBindings(
    query: { assetType?: string; assetId?: number; targetType?: string; targetId?: number; page?: number; pageSize?: number },
    user: CurrentUser,
  ) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (query.assetType) {
      where.assetType = query.assetType;
    }
    if (query.assetId !== undefined) {
      where.assetId = query.assetId;
    }
    if (query.targetType) {
      where.targetType = query.targetType;
    }
    if (query.targetId !== undefined) {
      where.targetId = query.targetId;
    }

    const [list, total] = await this.assetBindingRepository.repository.findAndCount({
      where: where as any,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    return {
      list: list.map((e) => this.toBindingVO(e)),
      pagination: { page, pageSize, total },
    };
  }

  async deleteBinding(id: number, user: CurrentUser): Promise<void> {
    const deleted = await this.assetBindingRepository.delete(id, user.tenantId);
    if (!deleted) {
      throw new HttpException('Binding not found', HttpStatus.NOT_FOUND);
    }
  }

  private toSkillVO(entity: SkillEntity): SkillVO {
    return {
      id: entity.id,
      tenantId: entity.tenantId,
      skillKey: entity.skillKey,
      name: entity.name,
      category: entity.category,
      status: entity.status,
      visibility: entity.visibility,
      summary: entity.summary,
      content: entity.content,
      tags: entity.tagsJson,
      version: entity.version,
      publishedAt: entity.publishedAt,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  private toCapsuleVO(entity: CapsuleEntity): CapsuleVO {
    return {
      id: entity.id,
      tenantId: entity.tenantId,
      capsuleKey: entity.capsuleKey,
      name: entity.name,
      sceneType: entity.sceneType,
      status: entity.status,
      visibility: entity.visibility,
      summary: entity.summary,
      content: entity.content,
      tags: entity.tagsJson,
      version: entity.version,
      publishedAt: entity.publishedAt,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  private toTemplateVO(entity: TemplateEntity): TemplateVO {
    return {
      id: entity.id,
      tenantId: entity.tenantId,
      templateKey: entity.templateKey,
      templateType: entity.templateType,
      name: entity.name,
      scopeType: entity.scopeType,
      status: entity.status,
      payload: entity.payload,
      version: entity.version,
      publishedAt: entity.publishedAt,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  private toBindingVO(entity: AssetBindingEntity): AssetBindingVO {
    return {
      id: entity.id,
      tenantId: entity.tenantId,
      assetType: entity.assetType,
      assetId: entity.assetId,
      targetType: entity.targetType,
      targetId: entity.targetId,
      bindType: entity.bindType,
      createdBy: entity.createdBy,
      createdAt: entity.createdAt,
    };
  }
}
