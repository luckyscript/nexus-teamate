import { Entity, Column } from 'typeorm';
import { BaseTimeEntity } from '../../../common/base/base-time.entity';

@Entity('task_label')
export class TaskLabelEntity extends BaseTimeEntity {
  @Column({ type: 'bigint', unsigned: true })
  tenantId: number;

  @Column({ type: 'bigint', unsigned: true })
  taskId: number;

  @Column({ type: 'varchar', length: 64 })
  labelKey: string;

  @Column({ type: 'varchar', length: 128 })
  labelValue: string;
}
