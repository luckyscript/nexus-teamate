import { Entity, Column, Index } from 'typeorm';
import { BaseTimeEntity } from '../../../common/base/base-time.entity';

@Entity('audit_log')
@Index('idx_tenant_resource', ['tenantId', 'resourceType', 'resourceId', 'createdAt'])
@Index('idx_tenant_operator', ['tenantId', 'operatorId', 'createdAt'])
export class AuditLogEntity extends BaseTimeEntity {
  @Column({ type: 'bigint', unsigned: true })
  tenantId: number;

  @Column({ name: 'operator_type', type: 'varchar', length: 32 })
  operatorType: string;

  @Column({ name: 'operator_id', type: 'bigint', unsigned: true, nullable: true })
  operatorId: number | null;

  @Column({ name: 'resource_type', type: 'varchar', length: 32 })
  resourceType: string;

  @Column({ name: 'resource_id', type: 'bigint', unsigned: true, nullable: true })
  resourceId: number | null;

  @Column({ type: 'varchar', length: 64 })
  action: string;

  @Column({ name: 'detail_json', type: 'json', nullable: true })
  detailJson: Record<string, unknown> | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  ip: string | null;
}
