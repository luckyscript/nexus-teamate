import { Entity, Column, Index } from 'typeorm';
import { BaseTimeEntity } from '../../../common/base/base-time.entity';

@Entity('agent_execution_log')
@Index('idx_execution', ['tenantId', 'executionId'])
export class AgentExecutionLogEntity extends BaseTimeEntity {
  @Column({ type: 'bigint', unsigned: true })
  tenantId: number;

  @Column({ type: 'bigint', unsigned: true })
  executionId: number;

  @Column({ type: 'varchar', length: 32 })
  logType: string;

  @Column({ type: 'mediumtext' })
  content: string;

  @Column({ type: 'json', nullable: true })
  extraJson: Record<string, unknown> | null;
}
