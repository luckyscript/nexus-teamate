import { Entity, Column } from 'typeorm';
import { BaseTimeEntity } from '../../../common/base/base-time.entity';

@Entity('connector_definition')
export class ConnectorDefinitionEntity extends BaseTimeEntity {
  @Column({ type: 'varchar', length: 64, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'varchar', length: 32 })
  type: string;

  @Column({ name: 'auth_type', type: 'varchar', length: 32 })
  authType: string;

  @Column({ name: 'config_schema', type: 'json', nullable: true })
  configSchema: Record<string, unknown> | null;

  @Column({ name: 'capability_json', type: 'json', nullable: true })
  capabilityJson: Record<string, unknown> | null;

  @Column({ type: 'varchar', length: 32, default: 'active' })
  status: string;
}
