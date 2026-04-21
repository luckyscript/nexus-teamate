import { Queue, JobsOptions } from 'bullmq';
import { Inject, Injectable, Scope, ScopeEnum } from '@midwayjs/core';
import { QUEUE_NAMES, QUEUE_OPTIONS, QueueName } from './queue.constants';

export interface JobData<T = unknown> {
  type: string;
  payload: T;
  metadata?: Record<string, unknown>;
}

@Injectable()
@Scope(ScopeEnum.Singleton)
export class QueueService {
  @Inject()
  queues: Record<QueueName, Queue>;

  async addJob<T = unknown>(
    queueName: QueueName,
    jobName: string,
    data: T,
    options?: JobsOptions,
  ) {
    const queue = this.queues[queueName];
    if (!queue) {
      throw new Error(`Queue ${queueName} not initialized`);
    }

    const jobData: JobData<T> = {
      type: jobName,
      payload: data,
      metadata: { createdAt: new Date().toISOString() },
    };

    const jobOptions = { ...QUEUE_OPTIONS[queueName], ...options };

    const job = await queue.add(jobName, jobData, jobOptions);
    return job.id;
  }

  async addJobs<T = unknown>(
    queueName: QueueName,
    jobs: Array<{ name: string; data: T; options?: JobsOptions }>,
  ) {
    const queue = this.queues[queueName];
    if (!queue) {
      throw new Error(`Queue ${queueName} not initialized`);
    }

    const bullJobs = jobs.map(({ name, data, options }) => ({
      name,
      data: {
        type: name,
        payload: data,
        metadata: { createdAt: new Date().toISOString() },
      } as JobData<T>,
      opts: { ...QUEUE_OPTIONS[queueName], ...options },
    }));

    const added = await queue.addBulk ?
      (async () => {
        const results: string[] = [];
        for (const job of bullJobs) {
          const j = await queue.add(job.name, job.data, job.opts);
          results.push(j.id);
        }
        return results;
      })() : [];

    return added;
  }

  async getJobCount(queueName: QueueName): Promise<number> {
    const queue = this.queues[queueName];
    if (!queue) return 0;
    return queue.getCounts();
  }

  async pause(queueName: QueueName): Promise<void> {
    await this.queues[queueName]?.pause();
  }

  async resume(queueName: QueueName): Promise<void> {
    await this.queues[queueName]?.resume();
  }

  async drain(queueName: QueueName): Promise<void> {
    await this.queues[queueName]?.drain();
  }
}
