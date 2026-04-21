import { Provide, Inject } from '@midwayjs/core';
import { TaskRepository } from '../repository/task.repository';
import { TaskReadRepository, TaskFilters } from '../repository/task-read.repository';
import { TaskDomainService, StatusTransition } from '../domain/task-domain.service';
import { TaskAssembler } from '../assembler/task.assembler';
import { EventPublisher } from '../../../framework/event/event.publisher';
import { CurrentUser } from '../../../framework/auth/current-user.service';
import {
  CreateTaskRequestDto,
  UpdateTaskRequestDto,
  TransitionTaskRequestDto,
  TakeoverTaskRequestDto,
  CreateTaskCommentRequestDto,
} from '../dto/task.dto';
import { TaskEntity } from '../entity/task.entity';
import { TaskCommentEntity } from '../entity/task-comment.entity';

@Provide()
export class TaskAppService {
  @Inject()
  taskRepository: TaskRepository;

  @Inject()
  taskReadRepository: TaskReadRepository;

  @Inject()
  taskDomainService: TaskDomainService;

  @Inject()
  taskAssembler: TaskAssembler;

  @Inject()
  eventPublisher: EventPublisher;

  private getDefaultTransitions(): StatusTransition[] {
    return [
      { from: 'todo', to: 'in_progress' },
      { from: 'todo', to: 'cancelled' },
      { from: 'in_progress', to: 'in_review' },
      { from: 'in_progress', to: 'todo' },
      { from: 'in_progress', to: 'cancelled' },
      { from: 'in_review', to: 'done' },
      { from: 'in_review', to: 'in_progress' },
      { from: 'in_review', to: 'cancelled' },
      { from: 'done', to: 'in_progress' },
      { from: 'cancelled', to: 'todo' },
    ];
  }

  async createTask(
    dto: CreateTaskRequestDto,
    user: CurrentUser,
  ): Promise<{ taskId: number }> {
    const validation = this.taskDomainService.validateCreate({
      title: dto.title,
      priority: dto.priority,
      sourceType: dto.sourceType,
      dueAt: dto.dueAt,
    });
    if (!validation.valid) {
      throw new Error(`Invalid task input: ${validation.errors?.join(', ')}`);
    }

    const taskData = this.taskAssembler.toEntity(dto, user);
    taskData.statusCode = 'todo';

    const saved = await this.taskRepository.create(taskData, dto.labels);

    await this.taskRepository.writeEvent({
      tenantId: user.tenantId,
      taskId: saved.id,
      eventType: 'task.created',
      operatorType: 'user',
      operatorId: user.id,
      payload: { title: saved.title, priority: saved.priority },
    });

    await this.eventPublisher.publishTaskCreated(saved.id, user.tenantId, {
      title: saved.title,
      priority: saved.priority,
      sourceType: saved.sourceType,
      boardId: saved.boardId,
      projectId: saved.projectId,
      assigneeId: saved.assigneeId,
      reporterId: saved.reporterId,
    });

    return { taskId: saved.id };
  }

  async getTask(id: number, user: CurrentUser) {
    const task = await this.taskReadRepository.findById(id, user.tenantId);
    if (!task) {
      throw new Error('Task not found');
    }

    const labels = await this.taskReadRepository.findLabelsForTask(id);
    const comments = await this.taskReadRepository.findCommentsForTask(
      id,
      user.tenantId,
    );
    const latestExecutions =
      await this.taskReadRepository.findLatestExecutions(id);
    const transitions = this.getDefaultTransitions();
    const availableActions = this.taskDomainService.resolveAvailableActions(
      task,
      transitions,
      task.aiState,
      task.takeoverState,
    );

    return this.taskAssembler.toDetailVO(
      task,
      labels,
      comments,
      latestExecutions,
      availableActions.map((a) => a.action),
    );
  }

  async listTasksByBoard(
    boardId: number,
    query: {
      page?: number;
      pageSize?: number;
      keyword?: string;
      status?: string;
      priority?: string;
      assigneeId?: number;
      sourceType?: string;
      aiState?: string;
      takeoverState?: string;
      viewMode?: 'kanban' | 'list';
      columns?: Array<{ statusCode: string; name: string }>;
    },
    user: CurrentUser,
  ) {
    const filters: TaskFilters = {
      keyword: query.keyword,
      status: query.status,
      priority: query.priority,
      assigneeId: query.assigneeId,
      sourceType: query.sourceType,
      aiState: query.aiState,
      takeoverState: query.takeoverState,
    };

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const viewMode = query.viewMode ?? 'list';

    if (viewMode === 'kanban' && query.columns) {
      const result = await this.taskReadRepository.findAllByBoard(
        boardId,
        user.tenantId,
        filters,
        page,
        pageSize,
        'kanban',
        query.columns,
      );
      const grouped = result as Record<string, { list: TaskEntity[]; total: number }>;
      return this.taskAssembler.toKanbanVO(grouped, query.columns);
    }

    const result = await this.taskReadRepository.findAllByBoard(
      boardId,
      user.tenantId,
      filters,
      page,
      pageSize,
      'list',
    );
    const pageResult = result as {
      list: TaskEntity[];
      total: number;
      page: number;
      pageSize: number;
    };

    return {
      viewMode: 'list',
      list: pageResult.list.map((t) => this.taskAssembler.toCardVO(t)),
      pagination: {
        page: pageResult.page,
        pageSize: pageResult.pageSize,
        total: pageResult.total,
      },
    };
  }

  async updateTask(
    id: number,
    dto: UpdateTaskRequestDto,
    user: CurrentUser,
  ): Promise<TaskEntity> {
    const task = await this.taskReadRepository.findById(id, user.tenantId);
    if (!task) {
      throw new Error('Task not found');
    }

    const changes: Partial<TaskEntity> = {};
    if (dto.title !== undefined) changes.title = dto.title;
    if (dto.description !== undefined) changes.description = dto.description;
    if (dto.priority !== undefined) changes.priority = dto.priority;
    if (dto.assigneeId !== undefined) changes.assigneeId = dto.assigneeId;
    if (dto.dueAt !== undefined)
      changes.dueAt = dto.dueAt ? new Date(dto.dueAt) : null;
    if (dto.customFields !== undefined) changes.customFields = dto.customFields;

    const updated = await this.taskRepository.update(
      id,
      changes,
      user.tenantId,
    );

    await this.taskRepository.writeEvent({
      tenantId: user.tenantId,
      taskId: id,
      eventType: 'task.updated',
      operatorType: 'user',
      operatorId: user.id,
      payload: { changes: Object.keys(changes) },
    });

    await this.eventPublisher.publishTaskUpdated(id, user.tenantId, {
      changes,
      updatedBy: user.id,
    });

    return updated;
  }

  async transitionTask(
    id: number,
    dto: TransitionTaskRequestDto,
    user: CurrentUser,
  ): Promise<TaskEntity> {
    const task = await this.taskReadRepository.findById(id, user.tenantId);
    if (!task) {
      throw new Error('Task not found');
    }

    const transitions = this.getDefaultTransitions();
    const validation = this.taskDomainService.validateTransition({
      taskId: id,
      fromStatusCode: task.statusCode,
      toStatusCode: dto.toStatusCode,
      version: dto.version,
      currentVersion: task.version,
      transitions,
    });

    if (!validation.valid) {
      throw new Error(`Invalid transition: ${validation.error}`);
    }

    const updated = await this.taskRepository.transition(
      id,
      dto.toStatusCode,
      dto.reason,
      dto.version,
      user.tenantId,
    );

    await this.taskRepository.writeEvent({
      tenantId: user.tenantId,
      taskId: id,
      eventType: 'task.status_changed',
      operatorType: 'user',
      operatorId: user.id,
      payload: {
        fromStatus: task.statusCode,
        toStatus: dto.toStatusCode,
        reason: dto.reason,
      },
    });

    await this.eventPublisher.publishTaskStatusChanged(id, user.tenantId, {
      fromStatus: task.statusCode,
      toStatus: dto.toStatusCode,
    });

    return updated;
  }

  async takeoverTask(
    id: number,
    dto: TakeoverTaskRequestDto,
    user: CurrentUser,
  ): Promise<TaskEntity> {
    const task = await this.taskReadRepository.findById(id, user.tenantId);
    if (!task) {
      throw new Error('Task not found');
    }

    const stateMap: Record<string, string> = {
      takeover: 'active',
      release: 'released',
      continue: 'active',
      terminate: 'none',
    };

    const newState = stateMap[dto.action];
    if (!newState) {
      throw new Error(`Invalid takeover action: ${dto.action}`);
    }

    const fromState = task.takeoverState;
    const updated = await this.taskRepository.updateTakeoverState(
      id,
      newState,
      user.tenantId,
    );

    await this.taskRepository.writeEvent({
      tenantId: user.tenantId,
      taskId: id,
      eventType: 'task.takeover_changed',
      operatorType: 'user',
      operatorId: user.id,
      payload: {
        action: dto.action,
        fromState,
        toState: newState,
        reason: dto.reason,
      },
    });

    await this.eventPublisher.publishTaskTakeoverChanged(id, user.tenantId, {
      fromState,
      toState: newState,
    });

    return updated;
  }

  async addComment(
    taskId: number,
    dto: CreateTaskCommentRequestDto,
    user: CurrentUser,
  ): Promise<TaskCommentEntity> {
    const task = await this.taskReadRepository.findById(taskId, user.tenantId);
    if (!task) {
      throw new Error('Task not found');
    }

    const commentRepo = this.taskReadRepository.getCommentRepo();
    const comment = commentRepo.create({
      tenantId: user.tenantId,
      taskId,
      authorType: 'user',
      authorId: user.id,
      authorName: user.displayName || user.username,
      content: dto.content,
      contentType: dto.contentType,
    });
    const saved = await commentRepo.save(comment);

    await this.taskRepository.writeEvent({
      tenantId: user.tenantId,
      taskId,
      eventType: 'task.comment_added',
      operatorType: 'user',
      operatorId: user.id,
      payload: { commentId: saved.id, contentType: dto.contentType },
    });

    return saved;
  }

  async listComments(taskId: number, user: CurrentUser) {
    const task = await this.taskReadRepository.findById(taskId, user.tenantId);
    if (!task) {
      throw new Error('Task not found');
    }

    const comments = await this.taskReadRepository.findCommentsForTask(
      taskId,
      user.tenantId,
    );
    return comments.map((c) => ({
      id: c.id,
      authorType: c.authorType,
      authorId: c.authorId,
      authorName: c.authorName,
      content: c.content,
      contentType: c.contentType,
      createdAt: c.createdAt,
    }));
  }

  async listEvents(
    taskId: number,
    user: CurrentUser,
    page = 1,
    pageSize = 20,
  ) {
    const task = await this.taskReadRepository.findById(taskId, user.tenantId);
    if (!task) {
      throw new Error('Task not found');
    }

    const result = await this.taskReadRepository.findEvents(
      taskId,
      user.tenantId,
      page,
      pageSize,
    );
    return {
      list: result.list.map((e) => ({
        id: e.id,
        eventType: e.eventType,
        operatorType: e.operatorType,
        operatorId: e.operatorId,
        payload: e.payload,
        createdAt: e.createdAt,
      })),
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
      },
    };
  }
}
