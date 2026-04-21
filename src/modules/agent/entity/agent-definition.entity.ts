import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../../common/base/tenant-base.entity';

@Entity('agent_definition')
@Index('uk_tenant_agent_key_version', ['tenantId', 'agentKey', 'version'], { unique: true })
@Index('idx_tenant_status', ['tenantId', 'status'])
@Index('idx_tenant_category', ['tenantId', 'category'])
export class AgentDefinitionEntity extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 128 })
  agentKey: string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'varchar', length: 32 })
  category: string;

  @Column({ type: 'varchar', length: 32 })
  ownerType: string;

  @Column({ type: 'varchar', length: 32, default: 'draft' })
  status: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'mediumtext' })
  promptTemplate: string;

  @Column({ type: 'json' })
  inputSchema: Record<string, unknown>;

  @Column({ type: 'json', nullable: true })
  outputSchema: Record<string, unknown> | null;

  @Column({ type: 'json', nullable: true })
  toolPolicy: Record<string, unknown> | null;

  @Column({ type: 'json', nullable: true })
  assetBindings: Record<string, unknown> | null;

  @Column({ type: 'json' })
  modelConfig: Record<string, unknown>;

  @Column({ type: 'json', nullable: true })
  retryPolicy: Record<string, unknown> | null;

  @Column({ type: 'int', unsigned: true })
  timeoutSeconds: number;

  @Column({ type: 'int', unsigned: true })
  version: number;

  @Column({ type: 'tinyint', default: 0 })
  isBuiltin: number;
}
