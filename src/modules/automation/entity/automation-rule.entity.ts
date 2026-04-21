import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../../common/base/tenant-base.entity';

@Entity('automation_rule')
@Index('uk_tenant_rule_key', ['tenantId', 'ruleKey'], { unique: true })
@Index('idx_tenant_board_event', ['tenantId', 'boardId', 'eventType'])
@Index('idx_tenant_project_event', ['tenantId', 'projectId', 'eventType'])
export class AutomationRuleEntity extends TenantBaseEntity {
  @Column({ type: 'bigint', unsigned: true, nullable: true })
  projectId: number | null;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  boardId: number | null;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ name: 'rule_key', type: 'varchar', length: 64 })
  ruleKey: string;

  @Column({ name: 'event_type', type: 'varchar', length: 64 })
  eventType: string;

  @Column({ type: 'int' })
  priority: number;

  @Column({ name: 'is_enabled', type: 'tinyint', default: 1 })
  isEnabled: number;

  @Column({
    name: 'mutual_exclusion_key',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  mutualExclusionKey: string | null;

  @Column({ name: 'rollout_scope', type: 'json', nullable: true })
  rolloutScope: Record<string, unknown> | null;

  @Column({ name: 'condition_dsl', type: 'json' })
  conditionDsl: Record<string, unknown>;

  @Column({ name: 'action_dsl', type: 'json' })
  actionDsl: Record<string, unknown>[];

  @Column({ type: 'int', unsigned: true, default: 1 })
  version: number;
}
