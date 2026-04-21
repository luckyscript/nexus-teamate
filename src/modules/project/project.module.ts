import { Configuration } from '@midwayjs/core';
import { ProjectEntity } from './entity/project.entity';
import { ProjectController } from './controller/project.controller';

@Configuration({
  namespace: 'project',
  importConfigs: [],
})
export class ProjectModuleConfiguration {
  static entities = [ProjectEntity];
  static controllers = [ProjectController];
}
