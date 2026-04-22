import { Provide } from '@midwayjs/core';
import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Inject,
} from '@midwayjs/core';
import { AgentAppService } from '../app/agent-app.service';
import { CurrentUser } from '../../../framework/auth/current-user.service';

@Provide()
@Controller('/api/v1/agents')
export class AgentExecutionController {
  @Inject()
  ctx: any;

  @Inject()
  agentAppService: AgentAppService;

  private getUser(): CurrentUser {
    return (this.ctx as any).user ?? { id: 1, tenantId: 1, username: "test", displayName: "Test", roles: ["admin"], permissions: [] } as CurrentUser;
  }

  @Get('/executions')
  async listExecutions(
    @Query() query: { taskId?: number; agentId?: number; status?: string },
  ) {
    return this.agentAppService.listExecutions(query, this.getUser());
  }

  @Get('/executions/:executionId')
  async getExecution(@Param('executionId') executionId: string) {
    return this.agentAppService.getExecution(Number(executionId), this.getUser());
  }

  @Post('/executions/:executionId/retry')
  async retryExecution(@Param('executionId') executionId: string) {
    return this.agentAppService.retryExecution(Number(executionId), this.getUser());
  }

  @Post('/executions/:executionId/terminate')
  async terminateExecution(@Param('executionId') executionId: string) {
    await this.agentAppService.terminateExecution(Number(executionId), this.getUser());
    return { success: true };
  }
}
