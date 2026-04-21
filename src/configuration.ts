import { Framework as WebFramework } from '@midwayjs/web';
import { Framework as TypeORMFramework } from '@midwayjs/typeorm';
import { Bootstrap, Configuration, Inject, IMidwayApplication } from '@midwayjs/core';

import { ProjectModuleConfiguration } from './modules/project/project.module';
import { BoardModuleConfiguration } from './modules/board/board.module';
import { TaskModuleConfiguration } from './modules/task/task.module';
import { AutomationModuleConfiguration } from './modules/automation/automation.module';
import { AgentModuleConfiguration } from './modules/agent/agent.module';
import { AssetModuleConfiguration } from './modules/asset/asset.module';
import { AnalyticsModuleConfiguration } from './modules/analytics/analytics.module';
import { AuditModuleConfiguration } from './modules/audit/audit.module';
import { SystemModuleConfiguration } from './modules/system/system.module';
import { ConnectorModuleConfiguration } from './modules/connector/connector.module';

@Configuration({
  imports: [
    WebFramework,
    TypeORMFramework,
    ProjectModuleConfiguration,
    BoardModuleConfiguration,
    TaskModuleConfiguration,
    AutomationModuleConfiguration,
    AgentModuleConfiguration,
    AssetModuleConfiguration,
    AnalyticsModuleConfiguration,
    AuditModuleConfiguration,
    SystemModuleConfiguration,
    ConnectorModuleConfiguration,
  ],
  importConfigs: ['./config'],
})
export class MainConfiguration {
  @Inject()
  webFramework: WebFramework;

  async onReady() {
    const app = this.webFramework.getApplicationContext().get<IMidwayApplication>(IMidwayApplication);
    app.useCors();
  }

  async onServerReady() {}

  async onStop() {}
}
