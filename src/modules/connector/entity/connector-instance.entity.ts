import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../common/base/tenant-base.entity';

@Entity('connector_instance')
export class ConnectorInstanceEntity extends TenantBaseEntity {
  @Column({ name: 'definition_id', type: 'bigint', unsigned: true })
  definitionId: number;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'varchar', length: 32, default: 'active' })
  status: string;

  @Column({ name: 'auth_config_json', type: 'json' })
  authConfigJson: Record<string, unknown>;

  @Column({ name: 'sync_config_json', type: 'json', nullable: true })
  syncConfigJson: Record<string, unknown> | null;

  @Column({ name: 'last_sync_at', type: 'datetime', precision: 3, nullable: true })
  lastSyncAt: Date | null;
}
