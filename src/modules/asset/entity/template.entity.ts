import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../../common/base/tenant-base.entity';

@Entity('template')
@Index('idx_tenant_template_key', ['tenantId', 'templateKey'])
@Index('idx_tenant_status', ['tenantId', 'status'])
@Index('idx_tenant_template_type', ['tenantId', 'templateType'])
export class TemplateEntity extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 128 })
  templateKey: string;

  @Column({ type: 'varchar', length: 32 })
  templateType: string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'varchar', length: 32, default: 'system' })
  scopeType: string;

  @Column({ type: 'varchar', length: 32, default: 'draft' })
  status: string;

  @Column({ type: 'json' })
  payload: Record<string, unknown>;

  @Column({ type: 'int', unsigned: true })
  version: number;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  publishedAt: Date | null;
}
