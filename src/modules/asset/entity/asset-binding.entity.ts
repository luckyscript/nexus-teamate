import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../../common/base/tenant-base.entity';

@Entity('asset_binding')
@Index('idx_tenant_asset', ['tenantId', 'assetType', 'assetId'])
@Index('idx_tenant_target', ['tenantId', 'targetType', 'targetId'])
export class AssetBindingEntity extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 32 })
  assetType: string;

  @Column({ type: 'bigint', unsigned: true })
  assetId: number;

  @Column({ type: 'varchar', length: 32 })
  targetType: string;

  @Column({ type: 'bigint', unsigned: true })
  targetId: number;

  @Column({ type: 'varchar', length: 32, default: 'runtime_context' })
  bindType: string;
}
