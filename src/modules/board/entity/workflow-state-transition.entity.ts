import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../../common/base/tenant-base.entity';

@Entity('workflow_state_transition')
@Index('idx_wst_board', ['boardId'])
export class WorkflowStateTransitionEntity extends TenantBaseEntity {
  @Column({ type: 'bigint', unsigned: true })
  boardId: number;

  @Column({ name: 'from_status_code', type: 'varchar', length: 64 })
  fromStatusCode: string;

  @Column({ name: 'to_status_code', type: 'varchar', length: 64 })
  toStatusCode: string;

  @Column({ name: 'transition_type', type: 'varchar', length: 32 })
  transitionType: string;

  @Column({ name: 'condition_json', type: 'json', nullable: true })
  conditionJson: Record<string, unknown> | null;

  @Column({ name: 'is_enabled', type: 'tinyint', default: 1 })
  isEnabled: number;
}
