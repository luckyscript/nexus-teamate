import { Provide, Scope, ScopeEnum, Inject } from '@midwayjs/core';
import { Queue, Worker, QueueOptions, WorkerOptions, ConnectionOptions } from 'bullmq';
import { QUEUE_NAMES, QueueName } from './queue.constants';
import Redis from 'ioredis';

export interface QueueFactoryConfig {
  redis: ConnectionOptions;
  prefix?: string;
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class QueueFactory {
  private queues: Map<QueueName, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();

  async initialize(config: QueueFactoryConfig): Promise<Record<QueueName, Queue>> {
    const result = {} as Record<QueueName, Queue>;

    for (const name of Object.values(QUEUE_NAMES)) {
      const queue = new Queue(name, {
        connection: config.redis,
        prefix: config.prefix ?? '{nexus}',
        defaultJobOptions: {
          removeOnComplete: { age: 86400, count: 1000 },
          removeOnFail: { age: 604800 },
        },
      });
      this.queues.set(name, queue);
      result[name] = queue;
    }

    return result;
  }

  getQueue(name: QueueName): Queue | undefined {
    return this.queues.get(name);
  }

  createWorker(
    queueName: QueueName,
    processor: (job: import('bullmq').Job) => Promise<unknown>,
    workerOptions?: Partial<WorkerOptions> & { connection: ConnectionOptions },
  ): Worker {
    const workerId = `${queueName}-${Date.now()}`;

    const worker = new Worker(queueName, processor, {
      connection: workerOptions?.connection ?? {},
      concurrency: workerOptions?.concurrency ?? 5,
      removeOnComplete: { age: 86400, count: 1000 },
      removeOnFail: { age: 604800 },
      ...workerOptions,
    });

    this.workers.set(workerId, worker);

    worker.on('failed', (job, err) => {
      console.error(`Worker ${queueName} job ${job?.id} failed:`, err.message);
    });

    return worker;
  }

  async close(): Promise<void> {
    for (const queue of this.queues.values()) {
      await queue.close();
    }
    for (const worker of this.workers.values()) {
      await worker.close();
    }
    this.queues.clear();
    this.workers.clear();
  }
}
