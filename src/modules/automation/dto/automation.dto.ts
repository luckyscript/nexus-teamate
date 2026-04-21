import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsBoolean,
  ValidateNested,
  IsEnum,
  IsObject,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export const ConditionOperator = [
  'eq',
  'neq',
  'in',
  'not_in',
  'gt',
  'lt',
  'contains',
  'exists',
] as const;
export type ConditionOperator = (typeof ConditionOperator)[number];

export const ValidConditionFields = [
  'title',
  'description',
  'status',
  'priority',
  'assigneeId',
  'reporterId',
  'boardId',
  'projectId',
  'labels',
  'tags',
  'customFields',
] as const;

export class ConditionClauseDto {
  @IsString()
  field: string;

  @IsEnum(ConditionOperator)
  op: ConditionOperator;

  @ValidateIf((o) => o.op !== 'exists')
  @IsObject()
  value: unknown;
}

export class ConditionGroupDto {
  @ValidateNested({ each: true })
  @Type(() => ConditionClauseDto)
  @IsOptional()
  @IsArray()
  all?: Array<ConditionClauseDto | ConditionGroupDto>;

  @ValidateNested({ each: true })
  @Type(() => ConditionClauseDto)
  @IsOptional()
  @IsArray()
  any?: Array<ConditionClauseDto | ConditionGroupDto>;
}

export const ActionType = [
  'bind_agent',
  'transition_status',
  'notify',
  'assign',
  'create_subtask',
  'write_asset',
] as const;
export type ActionType = (typeof ActionType)[number];

export class ActionDto {
  @IsEnum(ActionType)
  type: ActionType;

  @IsObject()
  @IsOptional()
  params?: Record<string, unknown>;
}

export class CreateAutomationRuleRequestDto {
  @IsOptional()
  @IsNumber()
  projectId?: number;

  @IsOptional()
  @IsNumber()
  boardId?: number;

  @IsString()
  name: string;

  @IsString()
  ruleKey: string;

  @IsString()
  eventType: string;

  @IsNumber()
  @Min(0)
  priority: number;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ValidateNested()
  @Type(() => ConditionGroupDto)
  conditionDsl: ConditionGroupDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionDto)
  actionDsl: ActionDto[];

  @IsOptional()
  @IsString()
  mutualExclusionKey?: string;
}

export class UpdateAutomationRuleRequestDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  ruleKey?: string;

  @IsOptional()
  @IsString()
  eventType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priority?: number;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConditionGroupDto)
  conditionDsl?: ConditionGroupDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionDto)
  actionDsl?: ActionDto[];

  @IsOptional()
  @IsString()
  mutualExclusionKey?: string;
}

export class ToggleRuleRequestDto {
  @IsBoolean()
  isEnabled: boolean;
}

export class ValidateRuleDslRequestDto {
  @ValidateNested()
  @Type(() => ConditionGroupDto)
  conditionDsl: ConditionGroupDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionDto)
  actionDsl: ActionDto[];
}

export class AutomationRuleVO {
  id: number;
  projectId: number | null;
  boardId: number | null;
  name: string;
  ruleKey: string;
  eventType: string;
  priority: number;
  isEnabled: boolean;
  mutualExclusionKey: string | null;
  rolloutScope: Record<string, unknown> | null;
  conditionDsl: Record<string, unknown>;
  actionDsl: Record<string, unknown>[];
  version: number;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export class AutomationRuleExecutionVO {
  id: number;
  ruleId: number;
  taskId: number;
  status: string;
  matched: boolean;
  resultSummary: string | null;
  errorMessage: string | null;
  startedAt: Date | null;
  finishedAt: Date | null;
  createdAt: Date;
}
