import { Entity, Column, Index } from 'typeorm';
import { SoftDeleteTenantEntity } from '../../../common/base/soft-delete-tenant.entity';

@Entity('task')
@Index('idx_tenant_project_status', ['tenantId', 'projectId', 'statusCode'])
@Index('idx_tenant_board_status', ['tenantId', 'boardId', 'statusCode'])
@Index('idx_tenant_assignee_status', ['tenantId', 'assigneeId', 'statusCode'])
@Index('idx_tenant_parent', ['tenantId', 'parentTaskId'])
@Index('idx_tenant_source_ref', ['tenantId', 'sourceRef'])
@Index('idx_tenant_created_at', ['tenantId', 'createdAt'])
@Index('idx_tenant_due_at', ['tenantId', 'dueAt'])
export class TaskEntity extends SoftDeleteTenantEntity {
  @Column({ type: 'bigint', unsigned: true })
  projectId: number;

  @Column({ type: 'bigint', unsigned: true })
  boardId: number;

  @Column({ type: 'varchar', length: 32 })
  sourceType: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  sourceRef: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  externalId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'mediumtext', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 64 })
  statusCode: string;

  @Column({ type: 'varchar', length: 16 })
  priority: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  assigneeId: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  reporterId: number;

  @Column({ type: 'varchar', length: 32, default: 'none' })
  aiState: string;

  @Column({ type: 'varchar', length: 32, default: 'none' })
  takeoverState: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  parentTaskId: number;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  dueAt: Date;

  @Column({ type: 'json', nullable: true })
  customFields: Record<string, unknown>;

  @Column({ type: 'json', nullable: true })
  extraJson: Record<string, unknown>;

  @Column({ type: 'int', unsigned: true, default: 0 })
  version: number;
}
