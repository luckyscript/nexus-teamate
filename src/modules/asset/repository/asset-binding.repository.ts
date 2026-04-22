import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { AssetBindingEntity } from '../entity/asset-binding.entity';
import { CurrentUser } from '../../../framework/auth/current-user.service';

@Provide()
export class AssetBindingRepository {
  @InjectEntityModel(AssetBindingEntity)
  protected repository: Repository<AssetBindingEntity>;

  async create(
    binding: Partial<AssetBindingEntity>,
    user: CurrentUser,
  ): Promise<AssetBindingEntity> {
    const entity = this.repository.create({
      ...binding,
      tenantId: user.tenantId,
      createdBy: user.id,
      updatedBy: user.id,
    });
    return this.repository.save(entity);
  }

  async findByAsset(
    assetType: string,
    assetId: number,
    tenantId: number,
  ): Promise<AssetBindingEntity[]> {
    return this.repository.find({
      where: { tenantId, assetType, assetId } as any,
      order: { createdAt: 'DESC' },
    });
  }

  async findByTarget(
    targetType: string,
    targetId: number,
    tenantId: number,
  ): Promise<AssetBindingEntity[]> {
    return this.repository.find({
      where: { tenantId, targetType, targetId } as any,
      order: { createdAt: 'DESC' },
    });
  }

  async delete(id: number, tenantId: number): Promise<boolean> {
    const result = await this.repository.delete({ id, tenantId } as any);
    return (result.affected ?? 0) > 0;
  }
}
