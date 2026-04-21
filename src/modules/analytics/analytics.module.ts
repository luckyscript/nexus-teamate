import { Configuration } from '@midwayjs/core';
import { AnalyticsController } from './controller/analytics.controller';

@Configuration({
  namespace: 'analytics',
})
export class AnalyticsModuleConfiguration {
  static controllers = [AnalyticsController];
}
