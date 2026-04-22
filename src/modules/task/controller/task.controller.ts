import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Inject,
  Provide,
} from '@midwayjs/core';
import { Context } from '@midwayjs/web';
import { TaskAppService } from '../app/task-app.service';
import {
  CreateTaskRequestDto,
  UpdateTaskRequestDto,
  TransitionTaskRequestDto,
  TakeoverTaskRequestDto,
  CreateTaskCommentRequestDto,
  BatchUpdateRequestDto,
} from '../dto/task.dto';

interface ListTasksQuery {
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
  columns?: string;
}

interface TaskParam {
  taskId: number;
}

interface BoardParam {
  boardId: number;
}

interface EventsQuery {
  page?: number;
  pageSize?: number;
}

function getCurrentUser(ctx: Context) {
  return {
    id: (ctx as any).userId ?? 0,
    tenantId: (ctx as any).tenantId ?? 0,
    username: (ctx as any).username ?? '',
    displayName: (ctx as any).displayName ?? '',
    roles: (ctx as any).roles ?? [],
    permissions: (ctx as any).permissions ?? [],
  };
}

@Provide()
@Controller('/api/v1')
export class TaskController {
  @Inject()
  ctx: Context;

  @Inject()
  taskAppService: TaskAppService;

  @Get('/boards/:boardId/tasks')
  async listTasksByBoard(
    @Param() boardParam: BoardParam,
    @Query() query: ListTasksQuery,
  ) {
    const columns = query.columns
      ? JSON.parse(query.columns)
      : [
          { statusCode: 'todo', name: 'To Do' },
          { statusCode: 'in_progress', name: 'In Progress' },
          { statusCode: 'in_review', name: 'In Review' },
          { statusCode: 'done', name: 'Done' },
        ];
    return this.taskAppService.listTasksByBoard(
      boardParam.boardId,
      { ...query, columns },
      getCurrentUser(this.ctx),
    );
  }

  @Post('/tasks')
  async createTask(@Body() dto: CreateTaskRequestDto) {
    return this.taskAppService.createTask(dto, getCurrentUser(this.ctx));
  }

  @Get('/tasks/:taskId')
  async getTask(@Param() param: TaskParam) {
    return this.taskAppService.getTask(param.taskId, getCurrentUser(this.ctx));
  }

  @Put('/tasks/:taskId')
  async updateTask(
    @Param() param: TaskParam,
    @Body() dto: UpdateTaskRequestDto,
  ) {
    return this.taskAppService.updateTask(
      param.taskId,
      dto,
      getCurrentUser(this.ctx),
    );
  }

  @Post('/tasks/:taskId/transition')
  async transitionTask(
    @Param() param: TaskParam,
    @Body() dto: TransitionTaskRequestDto,
  ) {
    return this.taskAppService.transitionTask(
      param.taskId,
      dto,
      getCurrentUser(this.ctx),
    );
  }

  @Post('/tasks/:taskId/takeover')
  async takeoverTask(
    @Param() param: TaskParam,
    @Body() dto: TakeoverTaskRequestDto,
  ) {
    return this.taskAppService.takeoverTask(
      param.taskId,
      dto,
      getCurrentUser(this.ctx),
    );
  }

  @Get('/tasks/:taskId/comments')
  async listComments(@Param() param: TaskParam) {
    return this.taskAppService.listComments(
      param.taskId,
      getCurrentUser(this.ctx),
    );
  }

  @Post('/tasks/:taskId/comments')
  async addComment(
    @Param() param: TaskParam,
    @Body() dto: CreateTaskCommentRequestDto,
  ) {
    return this.taskAppService.addComment(
      param.taskId,
      dto,
      getCurrentUser(this.ctx),
    );
  }

  @Get('/tasks/:taskId/events')
  async listEvents(
    @Param() param: TaskParam,
    @Query() query: EventsQuery,
  ) {
    return this.taskAppService.listEvents(
      param.taskId,
      getCurrentUser(this.ctx),
      query.page ?? 1,
      query.pageSize ?? 20,
    );
  }

  @Post('/tasks/batch-update')
  async batchUpdate(@Body() dto: BatchUpdateRequestDto) {
    const user = getCurrentUser(this.ctx);
    const results = [];
    for (const taskId of dto.taskIds) {
      await this.taskAppService.updateTask(
        taskId,
        dto.changes as unknown as UpdateTaskRequestDto,
        user,
      );
      results.push({ taskId, success: true });
    }
    return { results, count: results.length };
  }
}
