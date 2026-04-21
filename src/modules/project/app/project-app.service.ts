import { Provide, Inject } from '@midwayjs/core';
import { HttpException, HttpStatus } from '@midwayjs/core';
import { ProjectRepository } from '../repository/project.repository';
import {
  CreateProjectRequestDto,
  UpdateProjectRequestDto,
  ProjectResponseVO,
} from '../dto/project.dto';
import { PageRequestDto } from '../../../common/dto/pagination.dto';
import { CurrentUser } from '../../../framework/auth/current-user.service';
import { ProjectEntity } from '../entity/project.entity';

interface ProjectPageResponse {
  list: ProjectResponseVO[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

@Provide()
export class ProjectAppService {
  @Inject()
  projectRepository: ProjectRepository;

  async createProject(
    dto: CreateProjectRequestDto,
    user: CurrentUser,
  ): Promise<ProjectResponseVO> {
    const existing = await this.projectRepository.findByCode(dto.code, user.tenantId);
    if (existing) {
      throw new HttpException(
        'Project code already exists',
        HttpStatus.CONFLICT,
      );
    }

    const entity = await this.projectRepository.create({
      code: dto.code,
      name: dto.name,
      description: dto.description ?? null,
      ownerId: dto.ownerId ?? null,
      tenantId: user.tenantId,
      status: 'active',
      createdBy: user.id,
      updatedBy: user.id,
    });

    return this.toVO(entity);
  }

  async listProjects(
    query: PageRequestDto & { keyword?: string; status?: string },
    user: CurrentUser,
  ): Promise<ProjectPageResponse> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const result = await this.projectRepository.findAll(
      user.tenantId,
      query.keyword,
      query.status,
      page,
      pageSize,
    );

    return {
      list: result.list.map((e) => this.toVO(e)),
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
      },
    };
  }

  async getProject(
    id: number,
    user: CurrentUser,
  ): Promise<ProjectResponseVO> {
    const project = await this.projectRepository.findById(id, user.tenantId);
    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }
    return this.toVO(project);
  }

  async updateProject(
    id: number,
    dto: UpdateProjectRequestDto,
    user: CurrentUser,
  ): Promise<ProjectResponseVO> {
    const existing = await this.projectRepository.findById(id, user.tenantId);
    if (!existing) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }

    if (dto.code && dto.code !== existing.code) {
      const duplicate = await this.projectRepository.findByCode(dto.code, user.tenantId);
      if (duplicate) {
        throw new HttpException(
          'Project code already exists',
          HttpStatus.CONFLICT,
        );
      }
    }

    const changes: Partial<ProjectEntity> = {
      updatedBy: user.id,
    };
    if (dto.code !== undefined) changes.code = dto.code;
    if (dto.name !== undefined) changes.name = dto.name;
    if (dto.description !== undefined) changes.description = dto.description;
    if (dto.ownerId !== undefined) changes.ownerId = dto.ownerId;
    if (dto.status !== undefined) changes.status = dto.status;

    const updated = await this.projectRepository.update(id, changes, user.tenantId);
    if (!updated) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }
    return this.toVO(updated);
  }

  async deleteProject(
    id: number,
    user: CurrentUser,
  ): Promise<void> {
    const existing = await this.projectRepository.findById(id, user.tenantId);
    if (!existing) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }

    const deleted = await this.projectRepository.delete(id, user.tenantId);
    if (!deleted) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }
  }

  private toVO(entity: ProjectEntity): ProjectResponseVO {
    return {
      id: entity.id,
      tenantId: entity.tenantId,
      orgId: entity.orgId,
      code: entity.code,
      name: entity.name,
      description: entity.description,
      ownerId: entity.ownerId,
      status: entity.status,
      configJson: entity.configJson,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
