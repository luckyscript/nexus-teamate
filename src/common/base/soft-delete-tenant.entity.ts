import { Column } from 'typeorm';
import { TenantBaseEntity } from './tenant-base.entity';

export abstract class SoftDeleteTenantEntity extends TenantBaseEntity {
  @Column({ type: 'datetime', precision: 3, nullable: true })
  deletedAt: Date;
}
