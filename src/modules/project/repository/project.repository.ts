import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, Like } from 'typeorm';
import { BaseRepository, PageResult } from '../../../framework/db/base.repository';
import { ProjectEntity } from '../entity/project.entity';

@Provide()
export class ProjectRepository extends BaseRepository<ProjectEntity> {
  @InjectEntityModel(ProjectEntity)
  projectModel: Repository<ProjectEntity>;

  async findAll(
    tenantId: number,
    keyword?: string,
    status?: string,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<PageResult<ProjectEntity>> {
    const where: Record<string, unknown> = { tenantId };
    if (status) {
      where.status = status;
    }
    if (keyword) {
      where.name = Like(`%${keyword}%`);
    }
    return this.findAndPaginate(where as any, page, pageSize, {
      orderBy: { createdAt: 'DESC' },
    });
  }

  async findById(id: number, tenantId: number): Promise<ProjectEntity | null> {
    return this.projectModel.findOne({ where: { id, tenantId } });
  }

  async findByCode(code: string, tenantId: number): Promise<ProjectEntity | null> {
    return this.projectModel.findOne({ where: { code, tenantId } });
  }

  async create(project: Partial<ProjectEntity>): Promise<ProjectEntity> {
    const entity = this.projectModel.create(project);
    return this.projectModel.save(entity);
  }

  async update(
    id: number,
    changes: Partial<ProjectEntity>,
    tenantId: number,
  ): Promise<ProjectEntity | null> {
    await this.projectModel.update({ id, tenantId }, changes);
    return this.projectModel.findOne({ where: { id, tenantId } });
  }

  async delete(id: number, tenantId: number): Promise<boolean> {
    const result = await this.projectModel.delete({ id, tenantId });
    return (result.affected ?? 0) > 0;
  }
}
