import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../../common/base/tenant-base.entity';

@Entity('project')
@Index('uk_tenant_code', ['tenantId', 'code'], { unique: true })
@Index('idx_tenant_owner', ['tenantId', 'ownerId'])
@Index('idx_tenant_status', ['tenantId', 'status'])
export class ProjectEntity extends TenantBaseEntity {
  @Column({ name: 'org_id', type: 'bigint', unsigned: true, nullable: true })
  orgId: number | null;

  @Column({ type: 'varchar', length: 64 })
  code: string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'owner_id', type: 'bigint', unsigned: true, nullable: true })
  ownerId: number | null;

  @Column({ type: 'varchar', length: 32, default: 'active' })
  status: string;

  @Column({ name: 'config_json', type: 'json', nullable: true })
  configJson: Record<string, unknown> | null;
}
