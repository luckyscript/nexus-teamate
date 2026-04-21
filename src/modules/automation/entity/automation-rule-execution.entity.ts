import { Entity, Column, Index } from 'typeorm';
import { BaseTimeEntity } from '../../../common/base/base-time.entity';

@Entity('automation_rule_execution')
@Index('idx_execution_rule', ['tenantId', 'ruleId'])
@Index('idx_execution_task', ['tenantId', 'taskId'])
export class AutomationRuleExecutionEntity extends BaseTimeEntity {
  @Column({ type: 'bigint', unsigned: true })
  tenantId: number;

  @Column({ name: 'rule_id', type: 'bigint', unsigned: true })
  ruleId: number;

  @Column({ name: 'task_id', type: 'bigint', unsigned: true })
  taskId: number;

  @Column({
    name: 'trigger_event_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  triggerEventId: number | null;

  @Column({ type: 'varchar', length: 32 })
  status: string;

  @Column({ type: 'tinyint', default: 0 })
  matched: number;

  @Column({
    name: 'result_summary',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  resultSummary: string | null;

  @Column({
    name: 'error_message',
    type: 'varchar',
    length: 512,
    nullable: true,
  })
  errorMessage: string | null;

  @Column({ name: 'started_at', type: 'datetime', precision: 3, nullable: true })
  startedAt: Date | null;

  @Column({
    name: 'finished_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
  })
  finishedAt: Date | null;
}
