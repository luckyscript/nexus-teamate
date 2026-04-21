import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsIn,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LabelDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateTaskRequestDto {
  @IsNumber()
  projectId: number;

  @IsNumber()
  boardId: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsIn(['P0', 'P1', 'P2', 'P3'])
  priority: string;

  @IsNumber()
  @IsOptional()
  assigneeId?: number;

  @IsString()
  @IsIn(['manual', 'webhook', 'api', 'connector'])
  sourceType: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LabelDto)
  @IsOptional()
  labels?: LabelDto[];

  @IsObject()
  @IsOptional()
  customFields?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  dueAt?: string;
}

export class UpdateTaskRequestDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['P0', 'P1', 'P2', 'P3'])
  priority?: string;

  @IsNumber()
  @IsOptional()
  assigneeId?: number;

  @IsString()
  @IsOptional()
  dueAt?: string;

  @IsObject()
  @IsOptional()
  customFields?: Record<string, unknown>;
}

export class TransitionTaskRequestDto {
  @IsString()
  @IsNotEmpty()
  toStatusCode: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsNumber()
  version: number;
}

export class TakeoverTaskRequestDto {
  @IsString()
  @IsIn(['takeover', 'release', 'continue', 'terminate'])
  action: string;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class CreateTaskCommentRequestDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsIn(['text', 'markdown'])
  contentType: string;
}

export class AssigneeVO {
  id: number;
  name: string;
}

export class SourceInfoVO {
  type: string;
  ref: string;
  externalId: string;
}

export class TaskDetailVO {
  id: number;
  tenantId: number;
  projectId: number;
  boardId: number;
  sourceType: string;
  sourceRef: string;
  externalId: string;
  title: string;
  description: string;
  statusCode: string;
  priority: string;
  assigneeId: number;
  reporterId: number;
  aiState: string;
  takeoverState: string;
  parentTaskId: number;
  dueAt: Date;
  customFields: Record<string, unknown>;
  extraJson: Record<string, unknown>;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  labels: LabelDto[];
  comments: Array<{
    id: number;
    authorType: string;
    authorId: number;
    authorName: string;
    content: string;
    contentType: string;
    createdAt: Date;
  }>;
  latestExecutions: Array<{
    id: number;
    agentId: number;
    status: string;
    startedAt: Date;
    finishedAt: Date;
  }>;
  availableActions: string[];
  sourceInfo: SourceInfoVO;
}

export class TaskCardVO {
  id: number;
  title: string;
  priority: string;
  aiState: string;
  takeoverState: string;
  assignee: AssigneeVO;
  latestExecution: {
    id: number;
    agentId: number;
    status: string;
  };
  labels: LabelDto[];
  dueAt: Date;
}

export class KanbanColumnVO {
  statusCode: string;
  name: string;
  count: number;
  tasks: TaskCardVO[];
}

export class KanbanResponseVO {
  viewMode: string;
  columns: KanbanColumnVO[];
  list?: {
    items: TaskCardVO[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
    };
  };
}

export class BatchUpdateRequestDto {
  @IsArray()
  taskIds: number[];

  @IsObject()
  changes: Record<string, unknown>;
}
