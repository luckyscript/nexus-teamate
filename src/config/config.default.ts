import { MidwayConfig } from '@midwayjs/core';
import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm';

// Custom naming strategy: camelCase -> snake_case for columns and tables
class SnakeNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
  columnName(propertyName: string, customName: string | undefined, entityName: string): string {
    return customName || propertyName.replace(/([A-Z])/g, '_$1').toLowerCase();
  }
  tableName(className: string, customName: string | undefined): string {
    return customName || className.replace(/([A-Z])/g, '_$1').toLowerCase();
  }
}

// Import all entities
import { ProjectEntity } from '../modules/project/entity/project.entity';
import { BoardEntity } from '../modules/board/entity/board.entity';
import { BoardColumnEntity } from '../modules/board/entity/board-column.entity';
import { WorkflowStateTransitionEntity } from '../modules/board/entity/workflow-state-transition.entity';
import { TaskEntity } from '../modules/task/entity/task.entity';
import { TaskCommentEntity } from '../modules/task/entity/task-comment.entity';
import { TaskEventEntity } from '../modules/task/entity/task-event.entity';
import { TaskLabelEntity } from '../modules/task/entity/task-label.entity';
import { AgentDefinitionEntity } from '../modules/agent/entity/agent-definition.entity';
import { AgentExecutionEntity } from '../modules/agent/entity/agent-execution.entity';
import { AgentExecutionLogEntity } from '../modules/agent/entity/agent-execution-log.entity';
import { SkillEntity } from '../modules/asset/entity/skill.entity';
import { CapsuleEntity } from '../modules/asset/entity/capsule.entity';
import { TemplateEntity } from '../modules/asset/entity/template.entity';
import { AssetBindingEntity } from '../modules/asset/entity/asset-binding.entity';
import { AuditLogEntity } from '../modules/audit/entity/audit-log.entity';
import { AutomationRuleEntity } from '../modules/automation/entity/automation-rule.entity';
import { AutomationRuleExecutionEntity } from '../modules/automation/entity/automation-rule-execution.entity';
import { ConnectorDefinitionEntity } from '../modules/connector/entity/connector-definition.entity';
import { ConnectorInstanceEntity } from '../modules/connector/entity/connector-instance.entity';
import { ConnectorSyncJobEntity } from '../modules/connector/entity/connector-sync-job.entity';
import { OutboxEvent } from '../framework/event/outbox.service';

export default {
  keys: 'nexus-teammate-default-key',
  egg: {
    port: 7001,
  },
  koa: {
    port: 7001,
  },
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: process.env.MYSQL_HOST || '127.0.0.1',
        port: parseInt(process.env.MYSQL_PORT || '3306', 10),
        username: process.env.MYSQL_USERNAME || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'nexus_teammate',
        synchronize: true,
        logging: false,
        entities: [
          ProjectEntity,
          BoardEntity,
          BoardColumnEntity,
          WorkflowStateTransitionEntity,
          TaskEntity,
          TaskCommentEntity,
          TaskEventEntity,
          TaskLabelEntity,
          AgentDefinitionEntity,
          AgentExecutionEntity,
          AgentExecutionLogEntity,
          SkillEntity,
          CapsuleEntity,
          TemplateEntity,
          AssetBindingEntity,
          AuditLogEntity,
          AutomationRuleEntity,
          AutomationRuleExecutionEntity,
          ConnectorDefinitionEntity,
          ConnectorInstanceEntity,
          ConnectorSyncJobEntity,
          OutboxEvent,
        ],
        charset: 'utf8mb4',
        supportBigNumbers: true,
        bigNumberStrings: true,
        namingStrategy: new SnakeNamingStrategy(),
      },
    },
  },
  redis: {
    client: {
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      host: process.env.REDIS_HOST || '127.0.0.1',
      password: process.env.REDIS_PASSWORD || '',
      db: parseInt(process.env.REDIS_DB || '0', 10),
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'nexus-teammate-jwt-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  queue: {
    connection: {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || '',
    },
  },
  modelProviders: {
    default: {
      provider: process.env.MODEL_PROVIDER || 'openai',
      apiKey: process.env.MODEL_API_KEY || '',
      baseURL: process.env.MODEL_BASE_URL || '',
    },
  },
  sse: {
    heartbeatInterval: 30000,
    maxConnections: 1000,
  },
} as MidwayConfig;
