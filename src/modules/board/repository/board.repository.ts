import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BoardEntity } from '../entity/board.entity';
import { BoardColumnEntity } from '../entity/board-column.entity';
import { WorkflowStateTransitionEntity } from '../entity/workflow-state-transition.entity';

@Provide()
export class BoardRepository {
  @InjectEntityModel(BoardEntity)
  protected repository: Repository<BoardEntity>;

  @InjectEntityModel(BoardColumnEntity)
  private boardColumnRepo: Repository<BoardColumnEntity>;

  @InjectEntityModel(WorkflowStateTransitionEntity)
  private transitionRepo: Repository<WorkflowStateTransitionEntity>;

  async findAll(
    tenantId: number,
    projectId?: number,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<{ items: BoardEntity[]; total: number }> {
    const where: Record<string, unknown> = { tenantId };
    if (projectId !== undefined) {
      where.projectId = projectId;
    }
    const [items, total] = await this.repository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { items, total };
  }

  async findById(id: number, tenantId: number): Promise<BoardEntity | null> {
    return this.repository.findOne({ where: { id, tenantId } });
  }

  async findByProject(projectId: number, tenantId: number): Promise<BoardEntity[]> {
    return this.repository.find({
      where: { projectId, tenantId, deletedAt: null },
      order: { createdAt: 'DESC' },
    });
  }

  async create(
    board: Partial<BoardEntity>,
    columns: Partial<BoardColumnEntity>[],
  ): Promise<BoardEntity> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const savedBoard = this.repository.create(board);
      await queryRunner.manager.save(BoardEntity, savedBoard);

      for (const col of columns) {
        col.boardId = savedBoard.id;
        col.tenantId = savedBoard.tenantId;
        await queryRunner.manager.save(BoardColumnEntity, col);
      }

      await queryRunner.commitTransaction();
      return savedBoard;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateColumns(
    boardId: number,
    columns: Partial<BoardColumnEntity>[],
    tenantId: number,
  ): Promise<void> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(BoardColumnEntity, { boardId, tenantId });

      for (const col of columns) {
        const entity = queryRunner.manager.create(BoardColumnEntity, {
          ...col,
          boardId,
          tenantId,
        });
        await queryRunner.manager.save(BoardColumnEntity, entity);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateTransitions(
    boardId: number,
    transitions: Partial<WorkflowStateTransitionEntity>[],
    tenantId: number,
  ): Promise<void> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(WorkflowStateTransitionEntity, { boardId, tenantId });

      for (const t of transitions) {
        const entity = queryRunner.manager.create(WorkflowStateTransitionEntity, {
          ...t,
          boardId,
          tenantId,
        });
        await queryRunner.manager.save(WorkflowStateTransitionEntity, entity);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getColumns(boardId: number, tenantId: number): Promise<BoardColumnEntity[]> {
    return this.boardColumnRepo.find({
      where: { boardId, tenantId },
      order: { seq: 'ASC' },
    });
  }

  async getTransitions(boardId: number, tenantId: number): Promise<WorkflowStateTransitionEntity[]> {
    return this.transitionRepo.find({
      where: { boardId, tenantId },
    });
  }
}
