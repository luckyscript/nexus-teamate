import { Configuration } from '@midwayjs/core';
import { StreamController } from './controller/stream.controller';

@Configuration({
  importConfigs: [],
})
export class SystemModuleConfiguration {}

export { StreamController };
