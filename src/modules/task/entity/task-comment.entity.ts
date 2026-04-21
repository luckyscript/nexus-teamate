import { Entity, Column } from 'typeorm';
import { BaseTimeEntity } from '../../../common/base/base-time.entity';

@Entity('task_comment')
export class TaskCommentEntity extends BaseTimeEntity {
  @Column({ type: 'bigint', unsigned: true })
  tenantId: number;

  @Column({ type: 'bigint', unsigned: true })
  taskId: number;

  @Column({ type: 'varchar', length: 32 })
  authorType: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  authorId: number;

  @Column({ type: 'varchar', length: 128, nullable: true })
  authorName: string;

  @Column({ type: 'mediumtext' })
  content: string;

  @Column({ type: 'varchar', length: 32 })
  contentType: string;

  @Column({ type: 'json', nullable: true })
  extraJson: Record<string, unknown>;
}
