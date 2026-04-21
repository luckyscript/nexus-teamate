import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsObject,
  IsEnum,
  ValidateNested,
  IsDefined,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ModelConfigDto {
  @IsDefined()
  @IsString()
  provider: string;

  @IsDefined()
  @IsString()
  model: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxTokens?: number;
}

export class ToolPolicyDto {
  @IsDefined()
  @IsArray()
  @IsString({ each: true })
  tools: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxCalls?: number;
}

export class RetryPolicyDto {
  @IsDefined()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxRetries: number;

  @IsDefined()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  backoffMs: number;
}

export class CreateAgentRequestDto {
  @IsDefined()
  @IsString()
  agentKey: string;

  @IsDefined()
  @IsString()
  name: string;

  @IsDefined()
  @IsEnum(['system', 'team', 'extension'])
  category: string;

  @IsOptional()
  @IsEnum(['draft', 'published', 'deprecated', 'disabled'])
  status?: string;

  @IsDefined()
  @IsString()
  promptTemplate: string;

  @IsDefined()
  @IsObject()
  inputSchema: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  outputSchema?: Record<string, unknown>;

  @IsOptional()
  @ValidateNested()
  @Type(() => ToolPolicyDto)
  toolPolicy?: ToolPolicyDto;

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  assetBindings?: Record<string, unknown>[];

  @IsDefined()
  @ValidateNested()
  @Type(() => ModelConfigDto)
  modelConfig: ModelConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => RetryPolicyDto)
  retryPolicy?: RetryPolicyDto;

  @IsDefined()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  timeoutSeconds: number;
}

export class UpdateAgentRequestDto {
  @IsOptional()
  @IsString()
  agentKey?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['system', 'team', 'extension'])
  category?: string;

  @IsOptional()
  @IsEnum(['draft', 'published', 'deprecated', 'disabled'])
  status?: string;

  @IsOptional()
  @IsString()
  promptTemplate?: string;

  @IsOptional()
  @IsObject()
  inputSchema?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  outputSchema?: Record<string, unknown>;

  @IsOptional()
  @ValidateNested()
  @Type(() => ToolPolicyDto)
  toolPolicy?: ToolPolicyDto;

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  assetBindings?: Record<string, unknown>[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ModelConfigDto)
  modelConfig?: ModelConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => RetryPolicyDto)
  retryPolicy?: RetryPolicyDto;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  timeoutSeconds?: number;
}

export class ExecuteAgentRequestDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  taskId?: number;

  @IsDefined()
  @IsObject()
  input: Record<string, unknown>;

  @IsDefined()
  @IsEnum(['manual', 'automation', 'schedule'])
  triggerType: string;
}

export class ExecutionStatsVO {
  totalRuns: number;
  successRate: number;
  avgDuration: number;
}

export class AgentDetailVO {
  id: number;
  tenantId: number;
  agentKey: string;
  name: string;
  category: string;
  ownerType: string;
  status: string;
  description: string | null;
  promptTemplate: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown> | null;
  toolPolicy: Record<string, unknown> | null;
  assetBindings: Record<string, unknown> | null;
  modelConfig: Record<string, unknown>;
  retryPolicy: Record<string, unknown> | null;
  timeoutSeconds: number;
  version: number;
  isBuiltin: number;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: Date;
  updatedAt: Date;
  executionStats: ExecutionStatsVO;
}

export class AgentExecutionVO {
  id: number;
  tenantId: number;
  taskId: number | null;
  agentId: number;
  agentName: string;
  triggerType: string;
  triggerRef: string | null;
  status: string;
  queueName: string | null;
  inputPayload: Record<string, unknown>;
  outputPayload: Record<string, unknown> | null;
  errorPayload: Record<string, unknown> | null;
  tokensIn: number;
  tokensOut: number;
  costAmount: number;
  retryCount: number;
  startedAt: Date | null;
  finishedAt: Date | null;
  createdAt: Date;
}

export class AgentExecutionLogVO {
  id: number;
  executionId: number;
  logType: string;
  content: string;
  extra: Record<string, unknown> | null;
  createdAt: Date;
}
