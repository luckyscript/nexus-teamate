import {
  IsString,
  IsOptional,
  IsNumber,
  IsDefined,
  Length,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ConnectorDefinitionVO {
  id: number;
  code: string;
  name: string;
  type: string;
  authType: string;
  configSchema: Record<string, unknown> | null;
  capabilityJson: Record<string, unknown> | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CreateConnectorInstanceRequestDto {
  @IsDefined()
  @Type(() => Number)
  @IsNumber()
  definitionId: number;

  @IsDefined()
  @IsString()
  @Length(1, 128)
  name: string;

  @IsDefined()
  authConfig: Record<string, unknown>;

  @IsOptional()
  syncConfig?: Record<string, unknown>;
}

export class UpdateConnectorInstanceRequestDto {
  @IsOptional()
  @IsString()
  @Length(1, 128)
  name?: string;

  @IsOptional()
  authConfig?: Record<string, unknown>;

  @IsOptional()
  syncConfig?: Record<string, unknown>;
}

export class ConnectorInstanceVO {
  id: number;
  tenantId: number;
  definitionId: number;
  name: string;
  status: string;
  lastSyncAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  definition?: ConnectorDefinitionVO;
}

export class TriggerSyncRequestDto {
  @IsOptional()
  @IsEnum(['full_sync', 'incremental_sync', 'manual_sync'])
  jobType?: string = 'manual_sync';
}

export class ConnectorSyncJobVO {
  id: number;
  instanceId: number;
  jobType: string;
  status: string;
  cursorValue: string | null;
  resultSummary: string | null;
  errorMessage: string | null;
  startedAt: Date | null;
  finishedAt: Date | null;
  createdAt: Date;
}
