import { Provide, Inject } from '@midwayjs/core';
import { TaskEntity } from '../entity/task.entity';
import { TaskLabelEntity } from '../entity/task-label.entity';
import { TaskCommentEntity } from '../entity/task-comment.entity';
import {
  CreateTaskRequestDto,
  TaskDetailVO,
  TaskCardVO,
  KanbanResponseVO,
  KanbanColumnVO,
  LabelDto,
  AssigneeVO,
  SourceInfoVO,
} from '../dto/task.dto';
import { CurrentUser } from '../../../framework/auth/current-user.service';

@Provide()
export class TaskAssembler {
  toEntity(dto: CreateTaskRequestDto, user: CurrentUser): Partial<TaskEntity> {
    return {
      tenantId: user.tenantId,
      projectId: dto.projectId,
      boardId: dto.boardId,
      sourceType: dto.sourceType,
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      assigneeId: dto.assigneeId,
      reporterId: user.id,
      aiState: 'none',
      takeoverState: 'none',
      dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
      customFields: dto.customFields,
      version: 0,
    };
  }

  toDetailVO(
    entity: TaskEntity,
    labels: TaskLabelEntity[],
    comments: TaskCommentEntity[],
    latestExecutions: Array<{
      id: number;
      agentId: number;
      status: string;
      startedAt: Date;
      finishedAt: Date;
    }> = [],
    availableActions: string[] = [],
  ): TaskDetailVO {
    const vo = new TaskDetailVO();
    vo.id = entity.id;
    vo.tenantId = entity.tenantId;
    vo.projectId = entity.projectId;
    vo.boardId = entity.boardId;
    vo.sourceType = entity.sourceType;
    vo.sourceRef = entity.sourceRef;
    vo.externalId = entity.externalId;
    vo.title = entity.title;
    vo.description = entity.description;
    vo.statusCode = entity.statusCode;
    vo.priority = entity.priority;
    vo.assigneeId = entity.assigneeId;
    vo.reporterId = entity.reporterId;
    vo.aiState = entity.aiState;
    vo.takeoverState = entity.takeoverState;
    vo.parentTaskId = entity.parentTaskId;
    vo.dueAt = entity.dueAt;
    vo.customFields = entity.customFields;
    vo.extraJson = entity.extraJson;
    vo.version = entity.version;
    vo.createdAt = entity.createdAt;
    vo.updatedAt = entity.updatedAt;
    vo.labels = labels.map((l) => ({ key: l.labelKey, value: l.labelValue }));
    vo.comments = comments.map((c) => ({
      id: c.id,
      authorType: c.authorType,
      authorId: c.authorId,
      authorName: c.authorName,
      content: c.content,
      contentType: c.contentType,
      createdAt: c.createdAt,
    }));
    vo.latestExecutions = latestExecutions;
    vo.availableActions = availableActions;
    vo.sourceInfo = {
      type: entity.sourceType,
      ref: entity.sourceRef,
      externalId: entity.externalId,
    };
    return vo;
  }

  toCardVO(entity: TaskEntity, labels: LabelDto[] = []): TaskCardVO {
    const vo = new TaskCardVO();
    vo.id = entity.id;
    vo.title = entity.title;
    vo.priority = entity.priority;
    vo.aiState = entity.aiState;
    vo.takeoverState = entity.takeoverState;
    vo.assignee = {
      id: entity.assigneeId,
      name: '',
    };
    vo.latestExecution = null;
    vo.labels = labels;
    vo.dueAt = entity.dueAt;
    return vo;
  }

  toKanbanVO(
    groupedTasks: Record<string, { list: TaskEntity[]; total: number }>,
    columnDefs: Array<{ statusCode: string; name: string }>,
  ): KanbanResponseVO {
    const vo = new KanbanResponseVO();
    vo.viewMode = 'kanban';
    vo.columns = columnDefs.map((col) => {
      const columnVo = new KanbanColumnVO();
      columnVo.statusCode = col.statusCode;
      columnVo.name = col.name;
      const group = groupedTasks[col.statusCode];
      columnVo.count = group?.total ?? 0;
      columnVo.tasks = (group?.list ?? []).map((task) => this.toCardVO(task));
      return columnVo;
    });
    return vo;
  }
}
