import { Column } from 'typeorm';
import { BaseTimeEntity } from './base-time.entity';

export abstract class TenantBaseEntity extends BaseTimeEntity {
  @Column({ type: 'bigint', unsigned: true })
  tenantId: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  createdBy: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  updatedBy: number;
}
