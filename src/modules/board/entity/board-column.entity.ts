import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../../common/base/tenant-base.entity';

@Entity('board_column')
@Index('idx_board_column_board', ['boardId'])
export class BoardColumnEntity extends TenantBaseEntity {
  @Column({ type: 'bigint', unsigned: true })
  boardId: number;

  @Column({ type: 'varchar', length: 64 })
  code: string;

  @Column({ type: 'varchar', length: 64 })
  name: string;

  @Column({ type: 'int' })
  seq: number;

  @Column({ type: 'varchar', length: 32, nullable: true })
  category: string;

  @Column({ name: 'is_initial', type: 'tinyint', default: 0 })
  isInitial: number;

  @Column({ name: 'is_terminal', type: 'tinyint', default: 0 })
  isTerminal: number;

  @Column({ name: 'wip_limit', type: 'int', nullable: true })
  wipLimit: number | null;

  @Column({ name: 'config_json', type: 'json', nullable: true })
  configJson: Record<string, unknown> | null;
}
