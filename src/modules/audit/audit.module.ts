import { Configuration } from '@midwayjs/core';
import { AuditLogEntity } from './entity/audit-log.entity';
import { AuditController } from './controller/audit.controller';
import { AuditLogRepository } from './repository/audit-log.repository';
import { AuditService } from './service/audit.service';

@Configuration({
  namespace: 'audit',
  importConfigs: [],
})
export class AuditModuleConfiguration {
  static entities = [AuditLogEntity];
  static controllers = [AuditController];
}

export {
  AuditLogEntity,
  AuditLogRepository,
  AuditService,
  AuditController,
};
