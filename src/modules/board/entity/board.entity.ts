import { Entity, Column, Index } from 'typeorm';
import { SoftDeleteTenantEntity } from '../../../common/base/soft-delete-tenant.entity';

@Entity('board')
@Index('idx_board_project', ['projectId'])
export class BoardEntity extends SoftDeleteTenantEntity {
  @Column({ type: 'bigint', unsigned: true })
  projectId: number;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'varchar', length: 32, default: 'kanban' })
  viewType: string;

  @Column({ type: 'varchar', length: 32, default: 'active' })
  status: string;

  @Column({ name: 'config_json', type: 'json', nullable: true })
  configJson: Record<string, unknown> | null;
}
