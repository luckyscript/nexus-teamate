import { Provide, Inject } from '@midwayjs/core';
import { BaseWorker } from '../../framework/queue/worker.base';
import { QueueNames } from '../../framework/queue/queue.constants';

@Provide()
export class ConnectorSyncProcessor extends BaseWorker {
  get queueName(): string {
    return QueueNames.CONNECTOR_SYNC;
  }

  async process(job: any): Promise<any> {
    const { instanceId, jobType } = job.data;
    this.logger.info(`[ConnectorSync] processing sync job ${jobType} for instance ${instanceId}`);
    return { instanceId, status: 'succeeded' };
  }
}
