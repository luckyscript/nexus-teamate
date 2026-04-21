import { Job } from 'bullmq';

export abstract class BaseWorker<T = unknown> {
  protected readonly queueName: string;

  constructor(queueName: string) {
    this.queueName = queueName;
  }

  abstract process(job: Job<T>): Promise<void>;

  async onStarted(job: Job<T>): Promise<void> {}

  async onCompleted(job: Job<T>, result: unknown): Promise<void> {}

  async onFailed(job: Job<T>, error: Error): Promise<void> {
    console.error(
      `Worker ${this.queueName} failed for job ${job.id}:`,
      error.message,
      error.stack,
    );
  }

  protected async withJobHandling(
    job: Job<T>,
    handler: (job: Job<T>) => Promise<unknown>,
  ): Promise<unknown> {
    try {
      await this.onStarted(job);
      const result = await handler(job);
      await this.onCompleted(job, result);
      return result;
    } catch (error) {
      await this.onFailed(job, error as Error);
      throw error;
    }
  }
}
