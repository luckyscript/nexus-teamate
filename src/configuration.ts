import * as web from '@midwayjs/web';
import * as typeorm from '@midwayjs/typeorm';
import { Configuration, Middleware, IMiddleware, NextFunction, App } from '@midwayjs/core';
import { Context, IMidwayApplication } from '@midwayjs/web';
import { QueueName } from './framework/queue/queue.constants';

// Test middleware to set mock user
@Middleware()
export class MockUserMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const mockUser = {
        id: 1,
        tenantId: 1,
        username: 'test',
        displayName: 'Test User',
        roles: ['admin'],
        permissions: [],
      };
      (ctx as any).user = mockUser;
      (ctx as any).currentUser = mockUser;
      return next();
    };
  }
  static getName() {
    return 'mockUser';
  }
}

// Project module
import { ProjectController } from './modules/project/controller/project.controller';
import { ProjectAppService } from './modules/project/app/project-app.service';
import { ProjectRepository } from './modules/project/repository/project.repository';

// Board module
import { BoardController } from './modules/board/controller/board.controller';
import { BoardAppService } from './modules/board/app/board-app.service';
import { BoardRepository } from './modules/board/repository/board.repository';

// Task module
import { TaskController } from './modules/task/controller/task.controller';
import { TaskAppService } from './modules/task/app/task-app.service';
import { TaskDomainService } from './modules/task/domain/task-domain.service';
import { TaskAssembler } from './modules/task/assembler/task.assembler';
import { TaskRepository } from './modules/task/repository/task.repository';
import { TaskReadRepository } from './modules/task/repository/task-read.repository';

// Other modules
import { AutomationRuleController } from './modules/automation/controller/automation-rule.controller';
import { AutomationAppService } from './modules/automation/app/automation-app.service';
import { AutomationDomainService } from './modules/automation/domain/automation-domain.service';
import { AutomationRuleRepository } from './modules/automation/repository/automation-rule.repository';
import { AutomationRuleExecutionRepository } from './modules/automation/repository/automation-rule-execution.repository';

import { AgentController } from './modules/agent/controller/agent.controller';
import { AgentExecutionController } from './modules/agent/controller/agent-execution.controller';
import { AgentAppService } from './modules/agent/app/agent-app.service';
import { AgentDomainService } from './modules/agent/domain/agent-domain.service';
import { AgentRepository } from './modules/agent/repository/agent.repository';
import { AgentExecutionRepository } from './modules/agent/repository/agent-execution.repository';

import { AssetController } from './modules/asset/controller/asset.controller';
import { AssetAppService } from './modules/asset/app/asset-app.service';
import { AssetRepository } from './modules/asset/repository/asset.repository';
import { AssetBindingRepository } from './modules/asset/repository/asset-binding.repository';

import { AnalyticsController } from './modules/analytics/controller/analytics.controller';
import { AnalyticsAppService } from './modules/analytics/app/analytics-app.service';

import { AuditController } from './modules/audit/controller/audit.controller';
import { AuditService } from './modules/audit/service/audit.service';
import { AuditLogRepository } from './modules/audit/repository/audit-log.repository';

import { StreamController } from './modules/system/controller/stream.controller';

import { ConnectorController, ConnectorWebhookController } from './modules/connector/controller/connector.controller';
import { ConnectorAppService } from './modules/connector/app/connector-app.service';
import { ConnectorRepository } from './modules/connector/repository/connector.repository';

// Framework services
import { CurrentUserService } from './framework/auth/current-user.service';
import { JwtService } from './framework/auth/jwt.service';
import { PermissionService } from './framework/auth/permission.guard';
import { DistributedLockService } from './framework/cache/distributed-lock.service';
import { RedisService } from './framework/cache/redis.service';
import { EventPublisher } from './framework/event/event.publisher';
import { OutboxService } from './framework/event/outbox.service';
import { QueueFactory } from './framework/queue/queue.factory';
import { QueueService } from './framework/queue/queue.service';
import { SSEGateway } from './framework/sse/sse.gateway';
import { SSEService } from './framework/sse/sse.service';

// Agent runtime
import { ModelGateway } from './modules/agent/runtime/gateway/model-gateway';
import { AgentOrchestrator } from './modules/agent/runtime/orchestrator/agent-orchestrator';
import { ToolRunner } from './modules/agent/runtime/tool/tool-runner';
import { Guardrail } from './modules/agent/runtime/guardrail';

// Jobs
import { AgentExecutionProcessor } from './jobs/agent/agent-execution.processor';
import { AutomationActionProcessor } from './jobs/automation/automation-action.processor';
import { ConnectorSyncProcessor } from './jobs/connector/connector-sync.processor';
import { OutboxPublishProcessor } from './jobs/outbox/outbox-publish.processor';

const allClasses = [
  // Controllers
  ProjectController, BoardController, TaskController, AutomationRuleController,
  AgentController, AgentExecutionController, AssetController, AnalyticsController,
  AuditController, StreamController, ConnectorController, ConnectorWebhookController,
  // App services
  ProjectAppService, BoardAppService, TaskAppService, AutomationAppService,
  AgentAppService, AssetAppService, AnalyticsAppService, ConnectorAppService,
  // Domain services
  TaskDomainService, TaskAssembler, AgentDomainService, AutomationDomainService,
  // Repositories
  ProjectRepository, BoardRepository, TaskRepository, TaskReadRepository,
  AgentRepository, AgentExecutionRepository, AssetRepository, AssetBindingRepository,
  AuditService, AuditLogRepository, AutomationRuleRepository,
  AutomationRuleExecutionRepository, ConnectorRepository,
  // Framework services
  CurrentUserService, JwtService, PermissionService, DistributedLockService,
  RedisService, EventPublisher, OutboxService, QueueFactory, QueueService,
  SSEGateway, SSEService,
  // Agent runtime
  ModelGateway, AgentOrchestrator, ToolRunner, Guardrail,
  // Jobs
  AgentExecutionProcessor, AutomationActionProcessor, ConnectorSyncProcessor,
  OutboxPublishProcessor,
];

function bindClasses(container: any, namespace: string) {
  for (const cls of allClasses) {
    try {
      container.bindClass(cls);
    } catch (e: any) {
      console.log('[bindClass failed]', cls.name, 'namespace:', namespace, '-', e.message?.substring(0, 100));
    }
  }
}

@Configuration({
  imports: [web, typeorm],
  importConfigs: [`${__dirname}/config`],
  detector: {
    async run(container, namespace) {
      bindClasses(container, namespace);
    },
    runSync(container, namespace) {
      bindClasses(container, namespace);
    },
  },
})
export class MainConfiguration {
  @App()
  app: IMidwayApplication;

  async onReady() {
    // Register mock user middleware for dev testing
    const mockMiddleware = new MockUserMiddleware();
    this.app.useMiddleware(mockMiddleware.resolve());

    // Register placeholder for queues (requires Redis, skip for dev)
    const queues = {} as Record<QueueName, any>;
    this.app.getApplicationContext().registerObject('queues', queues);
  }
  async onServerReady() {}
  async onStop() {}
}
