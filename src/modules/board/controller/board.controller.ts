import {
  Controller,
  Get,
  Post,
  Put,
  Del,
  Param,
  Body,
  Query,
  Inject,
} from '@midwayjs/core';
import { BoardAppService } from '../app/board-app.service';
import {
  CreateBoardRequestDto,
  UpdateBoardColumnsRequestDto,
  UpdateTransitionsRequestDto,
  PageRequestDto,
} from '../dto/board.dto';
import { CurrentUser } from '../../../framework/auth/current-user.service';

@Controller('/api/v1')
export class BoardController {
  @Inject()
  boardAppService: BoardAppService;

  private getUser(): CurrentUser {
    return (this.ctx as any).user as CurrentUser;
  }

  @Get('/projects/:projectId/boards')
  async listBoards(
    @Param('projectId') projectId: number,
    @Query() query: PageRequestDto,
  ) {
    return this.boardAppService.listBoards(projectId, query, this.getUser());
  }

  @Post('/projects/:projectId/boards')
  async createBoard(
    @Param('projectId') projectId: number,
    @Body() dto: CreateBoardRequestDto,
  ) {
    return this.boardAppService.createBoard(projectId, dto, this.getUser());
  }

  @Get('/boards/:boardId')
  async getBoard(
    @Param('boardId') boardId: number,
  ) {
    return this.boardAppService.getBoard(boardId, this.getUser());
  }

  @Put('/boards/:boardId/columns')
  async updateColumns(
    @Param('boardId') boardId: number,
    @Body() dto: UpdateBoardColumnsRequestDto,
  ) {
    return this.boardAppService.updateColumns(boardId, dto, this.getUser());
  }

  @Put('/boards/:boardId/transitions')
  async updateTransitions(
    @Param('boardId') boardId: number,
    @Body() dto: UpdateTransitionsRequestDto,
  ) {
    return this.boardAppService.updateTransitions(boardId, dto, this.getUser());
  }

  @Del('/boards/:boardId')
  async deleteBoard(
    @Param('boardId') boardId: number,
  ) {
    return this.boardAppService.deleteBoard(boardId, this.getUser());
  }
}
