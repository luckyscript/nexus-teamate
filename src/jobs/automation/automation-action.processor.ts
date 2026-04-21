import { Provide, Inject } from '@midwayjs/core';
import { BaseWorker } from '../../framework/queue/worker.base';
import { AutomationAppService } from '../../modules/automation/app/automation-app.service';
import { QueueNames } from '../../framework/queue/queue.constants';

@Provide()
export class AutomationActionProcessor extends BaseWorker {
  @Inject()
  automationAppService: AutomationAppService;

  get queueName(): string {
    return QueueNames.AUTOMATION_ACTION;
  }

  async process(job: any): Promise<any> {
    const { ruleId, taskId, eventType, taskContext } = job.data;

    this.logger.info(`[AutomationAction] processing rule ${ruleId} for task ${taskId}`);

    try {
      await this.automationAppService.executeRuleActions(ruleId, taskId, taskContext);
      return { ruleId, taskId, status: 'succeeded' };
    } catch (error) {
      this.logger.error(`[AutomationAction] rule ${ruleId} failed: ${error.message}`);
      throw error;
    }
  }
}
