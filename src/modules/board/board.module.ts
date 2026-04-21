import { Configuration } from '@midwayjs/core';
import { BoardEntity } from './entity/board.entity';
import { BoardColumnEntity } from './entity/board-column.entity';
import { WorkflowStateTransitionEntity } from './entity/workflow-state-transition.entity';
import { BoardRepository } from './repository/board.repository';
import { BoardAppService } from './app/board-app.service';
import { BoardController } from './controller/board.controller';

@Configuration({
  namespace: 'board',
  importConfigs: [],
})
export class BoardModuleConfiguration {
  static entities = [BoardEntity, BoardColumnEntity, WorkflowStateTransitionEntity];
  static controllers = [BoardController];
}

export {
  BoardEntity,
  BoardColumnEntity,
  WorkflowStateTransitionEntity,
  BoardRepository,
  BoardAppService,
  BoardController,
};
