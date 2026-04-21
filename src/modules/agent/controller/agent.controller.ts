import {
  Controller,
  Get,
  Post,
  Put,
  Query,
  Body,
  Param,
  Inject,
} from '@midwayjs/core';
import { AgentAppService } from '../app/agent-app.service';
import {
  CreateAgentRequestDto,
  UpdateAgentRequestDto,
  ExecuteAgentRequestDto,
} from '../dto/agent.dto';
import { PageRequestDto } from '../../../common/dto/pagination.dto';
import { CurrentUser } from '../../../framework/auth/current-user.service';

@Controller('/api/v1/agents')
export class AgentController {
  @Inject()
  agentAppService: AgentAppService;

  private getUser(): CurrentUser {
    return this.ctx.user as CurrentUser;
  }

  @Get('/')
  async listAgents(
    @Query() query: PageRequestDto & { keyword?: string; status?: string; category?: string },
  ) {
    return this.agentAppService.listAgents(query, this.getUser());
  }

  @Get('/:agentId')
  async getAgent(@Param('agentId') agentId: string) {
    return this.agentAppService.getAgent(Number(agentId), this.getUser());
  }

  @Post('/')
  async createAgent(@Body() dto: CreateAgentRequestDto) {
    return this.agentAppService.createAgent(dto, this.getUser());
  }

  @Put('/:agentId')
  async updateAgent(
    @Param('agentId') agentId: string,
    @Body() dto: UpdateAgentRequestDto,
  ) {
    return this.agentAppService.updateAgent(Number(agentId), dto, this.getUser());
  }

  @Post('/:agentId/publish')
  async publishAgent(@Param('agentId') agentId: string) {
    return this.agentAppService.publishAgent(Number(agentId), this.getUser());
  }

  @Post('/:agentId/execute')
  async executeAgent(
    @Param('agentId') agentId: string,
    @Body() dto: ExecuteAgentRequestDto,
  ) {
    return this.agentAppService.executeAgent(Number(agentId), dto, this.getUser());
  }
}
