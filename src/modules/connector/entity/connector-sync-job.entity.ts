import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../common/base/tenant-base.entity';

@Entity('connector_sync_job')
export class ConnectorSyncJobEntity extends TenantBaseEntity {
  @Column({ name: 'instance_id', type: 'bigint', unsigned: true })
  instanceId: number;

  @Column({ name: 'job_type', type: 'varchar', length: 32 })
  jobType: string;

  @Column({ type: 'varchar', length: 32, default: 'pending' })
  status: string;

  @Column({ name: 'cursor_value', type: 'varchar', length: 255, nullable: true })
  cursorValue: string | null;

  @Column({ name: 'result_summary', type: 'varchar', length: 255, nullable: true })
  resultSummary: string | null;

  @Column({ name: 'error_message', type: 'varchar', length: 512, nullable: true })
  errorMessage: string | null;

  @Column({ name: 'started_at', type: 'datetime', precision: 3, nullable: true })
  startedAt: Date | null;

  @Column({ name: 'finished_at', type: 'datetime', precision: 3, nullable: true })
  finishedAt: Date | null;
}
