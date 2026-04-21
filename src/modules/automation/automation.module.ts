import { Configuration } from '@midwayjs/core';

@Configuration({
  namespace: 'automation',
})
export class AutomationModuleConfiguration {
  async onReady() {}
}

export {
  AutomationRuleEntity,
  AutomationRuleExecutionEntity,
  AutomationRuleRepository,
  AutomationRuleExecutionRepository,
  AutomationDomainService,
  AutomationAppService,
  AutomationRuleController,
};

import { AutomationRuleEntity } from './entity/automation-rule.entity';
import { AutomationRuleExecutionEntity } from './entity/automation-rule-execution.entity';
import { AutomationRuleRepository } from './repository/automation-rule.repository';
import { AutomationRuleExecutionRepository } from './repository/automation-rule-execution.repository';
import { AutomationDomainService } from './domain/automation-domain.service';
import { AutomationAppService } from './app/automation-app.service';
import { AutomationRuleController } from './controller/automation-rule.controller';
