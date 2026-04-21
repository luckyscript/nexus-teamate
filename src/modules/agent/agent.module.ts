import { Configuration } from '@midwayjs/core';
import { AgentDefinitionEntity } from './entity/agent-definition.entity';
import { AgentExecutionEntity } from './entity/agent-execution.entity';
import { AgentExecutionLogEntity } from './entity/agent-execution-log.entity';
import { AgentController } from './controller/agent.controller';
import { AgentExecutionController } from './controller/agent-execution.controller';

@Configuration({
  namespace: 'agent',
})
export class AgentModuleConfiguration {
  static entities = [
    AgentDefinitionEntity,
    AgentExecutionEntity,
    AgentExecutionLogEntity,
  ];
  static controllers = [AgentController, AgentExecutionController];
}
