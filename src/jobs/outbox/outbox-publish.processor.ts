import { Provide, Inject } from '@midwayjs/core';
import { BaseWorker } from '../../framework/queue/worker.base';
import { OutboxService } from '../../framework/event/outbox.service';
import { QueueNames } from '../../framework/queue/queue.constants';

@Provide()
export class OutboxPublishProcessor extends BaseWorker {
  @Inject()
  outboxService: OutboxService;

  get queueName(): string {
    return QueueNames.OUTBOX_PUBLISH;
  }

  async process(job: any): Promise<any> {
    await this.outboxService.processPending();
  }
}
