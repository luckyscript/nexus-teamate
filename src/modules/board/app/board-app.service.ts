import { Provide, Inject, HttpException, HttpStatus } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BoardRepository } from '../repository/board.repository';
import { BoardEntity } from '../entity/board.entity';
import { BoardColumnEntity } from '../entity/board-column.entity';
import { WorkflowStateTransitionEntity } from '../entity/workflow-state-transition.entity';
import {
  CreateBoardRequestDto,
  UpdateBoardColumnsRequestDto,
  UpdateTransitionsRequestDto,
  BoardResponseVO,
} from '../dto/board.dto';
import { CurrentUser } from '../../../framework/auth/current-user.service';

const DEFAULT_COLUMNS = [
  { code: 'todo', name: '待处理', seq: 1, isInitial: true, isTerminal: false },
  { code: 'in_progress', name: '进行中', seq: 2, isInitial: false, isTerminal: false },
  { code: 'reviewing', name: '验收中', seq: 3, isInitial: false, isTerminal: false },
  { code: 'done', name: '已完成', seq: 4, isInitial: false, isTerminal: true },
  { code: 'discarded', name: '已丢弃', seq: 5, isInitial: false, isTerminal: true },
];

const DEFAULT_TRANSITIONS = [
  { fromStatusCode: 'todo', toStatusCode: 'in_progress', transitionType: 'standard' },
  { fromStatusCode: 'in_progress', toStatusCode: 'reviewing', transitionType: 'standard' },
  { fromStatusCode: 'reviewing', toStatusCode: 'done', transitionType: 'standard' },
  { fromStatusCode: 'reviewing', toStatusCode: 'discarded', transitionType: 'standard' },
  { fromStatusCode: 'done', toStatusCode: 'in_progress', transitionType: 'revert' },
];

@Provide()
export class BoardAppService {
  @Inject()
  boardRepository: BoardRepository;

  @InjectEntityModel(BoardColumnEntity)
  boardColumnRepo: Repository<BoardColumnEntity>;

  @InjectEntityModel(WorkflowStateTransitionEntity)
  transitionRepo: Repository<WorkflowStateTransitionEntity>;

  async createBoard(
    projectId: number,
    dto: CreateBoardRequestDto,
    user: CurrentUser,
  ): Promise<BoardResponseVO> {
    const board: Partial<BoardEntity> = {
      tenantId: user.tenantId,
      projectId,
      name: dto.name,
      viewType: dto.viewType,
      status: 'active',
      createdBy: user.id,
      updatedBy: user.id,
    };

    const columns = DEFAULT_COLUMNS.map((c) => ({
      code: c.code,
      name: c.name,
      seq: c.seq,
      isInitial: c.isInitial ? 1 : 0,
      isTerminal: c.isTerminal ? 1 : 0,
      category: null,
      wipLimit: null,
      configJson: null,
      tenantId: user.tenantId,
      createdBy: user.id,
      updatedBy: user.id,
    }));

    const savedBoard = await this.boardRepository.create(board, columns);

    const transitions = DEFAULT_TRANSITIONS.map((t) => ({
      fromStatusCode: t.fromStatusCode,
      toStatusCode: t.toStatusCode,
      transitionType: t.transitionType,
      conditionJson: null,
      isEnabled: 1,
      boardId: savedBoard.id,
      tenantId: user.tenantId,
      createdBy: user.id,
      updatedBy: user.id,
    }));

    for (const t of transitions) {
      const entity = this.transitionRepo.create(t);
      await this.transitionRepo.save(entity);
    }

    return this.buildBoardResponse(savedBoard, user.tenantId);
  }

  async listBoards(
    projectId: number,
    query: { page?: number; pageSize?: number },
    user: CurrentUser,
  ): Promise<{ items: BoardResponseVO[]; total: number }> {
    const { items, total } = await this.boardRepository.findAll(
      user.tenantId,
      projectId,
      query.page ?? 1,
      query.pageSize ?? 20,
    );

    const vos = items.map((item) => this.boardToVO(item, []));

    return { items: vos, total };
  }

  async getBoard(id: number, user: CurrentUser): Promise<BoardResponseVO> {
    const board = await this.boardRepository.findById(id, user.tenantId);
    if (!board) {
      throw new HttpException('Board not found', HttpStatus.NOT_FOUND);
    }
    return this.buildBoardResponse(board, user.tenantId);
  }

  async updateColumns(
    boardId: number,
    dto: UpdateBoardColumnsRequestDto,
    user: CurrentUser,
  ): Promise<void> {
    const board = await this.boardRepository.findById(boardId, user.tenantId);
    if (!board) {
      throw new HttpException('Board not found', HttpStatus.NOT_FOUND);
    }

    const columns = dto.columns.map((c) => ({
      ...(c.id ? { id: c.id } : {}),
      code: c.code,
      name: c.name,
      seq: c.seq,
      isInitial: c.isInitial ? 1 : 0,
      isTerminal: c.isTerminal ? 1 : 0,
      wipLimit: c.wipLimit ?? null,
      category: null,
      updatedBy: user.id,
    }));

    await this.boardRepository.updateColumns(boardId, columns, user.tenantId);
  }

  async updateTransitions(
    boardId: number,
    dto: UpdateTransitionsRequestDto,
    user: CurrentUser,
  ): Promise<void> {
    const board = await this.boardRepository.findById(boardId, user.tenantId);
    if (!board) {
      throw new HttpException('Board not found', HttpStatus.NOT_FOUND);
    }

    const transitions = dto.transitions.map((t) => ({
      ...(t.id ? { id: t.id } : {}),
      fromStatusCode: t.fromStatusCode,
      toStatusCode: t.toStatusCode,
      transitionType: t.transitionType,
      conditionJson: t.condition ?? null,
      isEnabled: t.isEnabled ? 1 : 0,
      updatedBy: user.id,
    }));

    await this.boardRepository.updateTransitions(boardId, transitions, user.tenantId);
  }

  async deleteBoard(id: number, user: CurrentUser): Promise<void> {
    const board = await this.boardRepository.findById(id, user.tenantId);
    if (!board) {
      throw new HttpException('Board not found', HttpStatus.NOT_FOUND);
    }
    board.deletedAt = new Date();
    board.updatedBy = user.id;
    await this.boardRepository.save(board);
  }

  private async buildBoardResponse(
    board: BoardEntity,
    tenantId: number,
  ): Promise<BoardResponseVO> {
    const columns = await this.boardRepository.getColumns(board.id, tenantId);
    const transitions = await this.boardRepository.getTransitions(board.id, tenantId);
    return this.boardToVO(board, columns, transitions);
  }

  private boardToVO(
    board: BoardEntity,
    columns?: BoardColumnEntity[],
    transitions?: WorkflowStateTransitionEntity[],
  ): BoardResponseVO {
    return {
      id: board.id,
      projectId: board.projectId,
      name: board.name,
      viewType: board.viewType,
      status: board.status,
      config: board.configJson,
      columns:
        columns?.map((c) => ({
          id: c.id,
          code: c.code,
          name: c.name,
          seq: c.seq,
          category: c.category,
          isInitial: !!c.isInitial,
          isTerminal: !!c.isTerminal,
          wipLimit: c.wipLimit,
        })) ?? [],
      transitions:
        transitions?.map((t) => ({
          id: t.id,
          fromStatusCode: t.fromStatusCode,
          toStatusCode: t.toStatusCode,
          transitionType: t.transitionType,
          condition: t.conditionJson,
          isEnabled: !!t.isEnabled,
        })) ?? [],
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
    };
  }
}
