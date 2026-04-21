import { Configuration, Inject } from '@midwayjs/core';
import { StreamController } from './controller/stream.controller';

@Configuration({
  importConfigs: [],
})
export class SystemModuleConfiguration {
  @Inject()
  streamController: StreamController;
}

export { StreamController };
