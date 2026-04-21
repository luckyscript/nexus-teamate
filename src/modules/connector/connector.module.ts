import { Configuration } from '@midwayjs/core';
import { ConnectorDefinitionEntity } from './entity/connector-definition.entity';
import { ConnectorInstanceEntity } from './entity/connector-instance.entity';
import { ConnectorSyncJobEntity } from './entity/connector-sync-job.entity';
import { ConnectorController, ConnectorWebhookController } from './controller/connector.controller';

@Configuration({
  namespace: 'connector',
  importConfigs: [],
})
export class ConnectorModuleConfiguration {
  static entities = [
    ConnectorDefinitionEntity,
    ConnectorInstanceEntity,
    ConnectorSyncJobEntity,
  ];
  static controllers = [ConnectorController, ConnectorWebhookController];
}
