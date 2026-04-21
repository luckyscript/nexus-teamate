import { Provide, Inject } from '@midwayjs/core';
import { BaseWorker } from '../../framework/queue/worker.base';
import { AgentAppService } from '../../modules/agent/app/agent-app.service';
import { QueueNames } from '../../framework/queue/queue.constants';

@Provide()
export class AgentExecutionProcessor extends BaseWorker {
  @Inject()
  agentAppService: AgentAppService;

  get queueName(): string {
    return QueueNames.AGENT_EXECUTION;
  }

  async process(job: any): Promise<any> {
    const { executionId, agentId, taskId, inputPayload } = job.data;

    this.logger.info(`[AgentExecution] processing execution ${executionId} for agent ${agentId}`);

    try {
      await this.agentAppService.startExecution(executionId, {
        agentId,
        taskId,
        inputPayload,
      });
      return { executionId, status: 'succeeded' };
    } catch (error) {
      this.logger.error(`[AgentExecution] execution ${executionId} failed: ${error.message}`);
      await this.agentAppService.failExecution(executionId, error);
      throw error;
    }
  }
}
