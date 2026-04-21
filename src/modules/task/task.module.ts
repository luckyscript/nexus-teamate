import { Configuration, Inject } from '@midwayjs/core';
import { TaskEntity } from './entity/task.entity';
import { TaskLabelEntity } from './entity/task-label.entity';
import { TaskCommentEntity } from './entity/task-comment.entity';
import { TaskEventEntity } from './entity/task-event.entity';
import { TaskController } from './controller/task.controller';

@Configuration({
  importConfigs: [],
})
export class TaskModuleConfiguration {
  @Inject()
  taskController: TaskController;
}

export {
  TaskEntity,
  TaskLabelEntity,
  TaskCommentEntity,
  TaskEventEntity,
  TaskController,
};
