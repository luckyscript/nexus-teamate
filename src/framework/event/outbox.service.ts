import { Provide, Scope, ScopeEnum, Inject } from '@midwayjs/core';
import { InjectDataSource } from '@midwayjs/typeorm';
import { DataSource, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { QUEUE_NAMES } from '../queue/queue.constants';
import { QueueService } from '../queue/queue.service';

@Entity('outbox_event')
export class OutboxEvent {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  tenantId: number;

  @Column({ name: 'event_type', type: 'varchar', length: 64 })
  eventType: string;

  @Column({ name: 'aggregate_type', type: 'varchar', length: 64 })
  aggregateType: string;

  @Column({ name: 'aggregate_id', type: 'bigint', unsigned: true })
  aggregateId: number;

  @Column({ name: 'payload', type: 'json' })
  payload: Record<string, unknown>;

  @Column({ name: 'publish_status', type: 'varchar', length: 32 })
  publishStatus: string;

  @Column({ name: 'retry_count', type: 'int', unsigned: true, default: 0 })
  retryCount: number;

  @Column({ name: 'next_retry_at', type: 'datetime', precision: 3, nullable: true })
  nextRetryAt: Date;

  @CreateDateColumn({ type: 'datetime', precision: 3 })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', precision: 3 })
  updatedAt: Date;
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class OutboxService {
  @InjectDataSource()
  dataSource: DataSource;

  @Inject()
  queueService: QueueService;

  private readonly BATCH_SIZE = 50;
  private readonly MAX_RETRIES = 10;
  private readonly RETRY_DELAY_MS = 60000;

  async enqueue(event: Omit<OutboxEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<OutboxEvent> {
    const repository = this.dataSource.getRepository(OutboxEvent);
    const entity = repository.create(event);
    return repository.save(entity);
  }

  async enqueueBatch(
    events: Array<Omit<OutboxEvent, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<OutboxEvent[]> {
    const repository = this.dataSource.getRepository(OutboxEvent);
    const entities = events.map(e => repository.create(e));
    return repository.save(entities);
  }

  async publishPending(): Promise<number> {
    const repository = this.dataSource.getRepository(OutboxEvent);

    const pendingEvents = await repository
      .createQueryBuilder('outbox')
      .where('outbox.publishStatus = :status', { status: 'pending' })
      .andWhere('(outbox.nextRetryAt IS NULL OR outbox.nextRetryAt <= NOW())')
      .orderBy('outbox.createdAt', 'ASC')
      .limit(this.BATCH_SIZE)
      .getMany();

    if (pendingEvents.length === 0) return 0;

    let published = 0;
    for (const event of pendingEvents) {
      try {
        await this.queueService.addJob(
          QUEUE_NAMES.OUTBOX_PUBLISH,
          event.eventType,
          {
            outboxId: event.id,
            eventType: event.eventType,
            aggregateType: event.aggregateType,
            aggregateId: event.aggregateId,
            payload: event.payload,
            tenantId: event.tenantId,
          },
        );

        await repository.update(event.id, {
          publishStatus: 'published',
        });

        published++;
      } catch {
        const nextRetry = new Date(Date.now() + this.RETRY_DELAY_MS * Math.pow(2, event.retryCount));
        await repository.update(event.id, {
          retryCount: event.retryCount + 1,
          nextRetryAt: nextRetry,
          publishStatus: event.retryCount + 1 >= this.MAX_RETRIES ? 'failed' : 'pending',
        });
      }
    }

    return published;
  }

  async processPending(): Promise<number> {
    return this.publishPending();
  }

  async markPublished(outboxId: number): Promise<void> {
    const repository = this.dataSource.getRepository(OutboxEvent);
    await repository.update(outboxId, {
      publishStatus: 'published',
    });
  }

  async markFailed(outboxId: number, errorMessage: string): Promise<void> {
    const repository = this.dataSource.getRepository(OutboxEvent);
    const event = await repository.findOne({ where: { id: outboxId } });
    if (!event) return;

    const nextRetry = new Date(Date.now() + this.RETRY_DELAY_MS * Math.pow(2, event.retryCount));
    const willRetry = event.retryCount + 1 < this.MAX_RETRIES;

    await repository.update(outboxId, {
      retryCount: event.retryCount + 1,
      nextRetryAt: willRetry ? nextRetry : null,
      publishStatus: willRetry ? 'pending' : 'failed',
    });
  }

  async cleanPublished(maxAgeDays: number = 7): Promise<number> {
    const repository = this.dataSource.getRepository(OutboxEvent);
    const cutoffDate = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);

    const result = await repository
      .createQueryBuilder()
      .delete()
      .where('publishStatus = :status', { status: 'published' })
      .andWhere('createdAt < :cutoff', { cutoff: cutoffDate })
      .execute();

    return result.affected || 0;
  }
}
