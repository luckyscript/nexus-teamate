import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../../common/base/tenant-base.entity';

@Entity('agent_execution')
@Index('idx_tenant_task_created', ['tenantId', 'taskId', 'createdAt'])
@Index('idx_tenant_agent_status', ['tenantId', 'agentId', 'status'])
@Index('idx_tenant_status_created', ['tenantId', 'status', 'createdAt'])
export class AgentExecutionEntity extends TenantBaseEntity {
  @Column({ type: 'bigint', unsigned: true, nullable: true })
  taskId: number | null;

  @Column({ type: 'bigint', unsigned: true })
  agentId: number;

  @Column({ type: 'varchar', length: 32 })
  triggerType: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  triggerRef: string | null;

  @Column({ type: 'varchar', length: 32, default: 'queued' })
  status: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  queueName: string | null;

  @Column({ type: 'json' })
  inputPayload: Record<string, unknown>;

  @Column({ type: 'json', nullable: true })
  outputPayload: Record<string, unknown> | null;

  @Column({ type: 'json', nullable: true })
  errorPayload: Record<string, unknown> | null;

  @Column({ type: 'int', unsigned: true, default: 0 })
  tokensIn: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  tokensOut: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  costAmount: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  retryCount: number;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  startedAt: Date | null;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  finishedAt: Date | null;
}
