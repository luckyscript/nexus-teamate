import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../../common/base/tenant-base.entity';

@Entity('capsule')
@Index('idx_tenant_capsule_key', ['tenantId', 'capsuleKey'])
@Index('idx_tenant_status', ['tenantId', 'status'])
@Index('idx_tenant_scene_type', ['tenantId', 'sceneType'])
export class CapsuleEntity extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 128 })
  capsuleKey: string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'varchar', length: 64 })
  sceneType: string;

  @Column({ type: 'varchar', length: 32, default: 'draft' })
  status: string;

  @Column({ type: 'varchar', length: 32, default: 'private' })
  visibility: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  summary: string | null;

  @Column({ type: 'mediumtext' })
  content: string;

  @Column({ type: 'json', nullable: true })
  tagsJson: string[] | null;

  @Column({ type: 'int', unsigned: true })
  version: number;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  publishedAt: Date | null;
}
