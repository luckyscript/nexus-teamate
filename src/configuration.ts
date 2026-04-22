import * as web from '@midwayjs/web';
import * as typeorm from '@midwayjs/typeorm';
import { Configuration, Middleware, IMiddleware, NextFunction, App } from '@midwayjs/core';
import { Context, IMidwayApplication } from '@midwayjs/web';
import { QueueName } from './framework/queue/queue.constants';

// Dev middleware to set mock user for testing
@Middleware()
export class MockUserMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const mockUser = {
        id: 1,
        tenantId: 1,
        username: 'test',
        displayName: 'Test User',
        roles: ['admin'],
        permissions: [],
      };
      (ctx as any).user = mockUser;
      (ctx as any).currentUser = mockUser;
      return next();
    };
  }
  static getName() {
    return 'mockUser';
  }
}

@Configuration({
  imports: [web, typeorm],
  importConfigs: [`${__dirname}/config`],
})
export class MainConfiguration {
  @App()
  app: IMidwayApplication;

  async onReady() {
    this.app.useMiddleware(MockUserMiddleware);

    // Register placeholder for queues (requires Redis, skip for dev)
    const queues = {} as Record<QueueName, any>;
    this.app.getApplicationContext().registerObject('queues', queues);
  }
  async onServerReady() {}
  async onStop() {}
}
