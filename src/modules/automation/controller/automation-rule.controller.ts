import { Controller, Get, Post, Put, Body, Param, Query } from '@midwayjs/core';
import { Inject } from '@midwayjs/core';
import {
  CreateAutomationRuleRequestDto,
  UpdateAutomationRuleRequestDto,
  ToggleRuleRequestDto,
  ValidateRuleDslRequestDto,
} from '../dto/automation.dto';
import { AutomationAppService, ListRulesQuery } from '../app/automation-app.service';
import { CurrentUser, CurrentUserService } from '../../../framework/auth/current-user.service';
import { PageRequestDto } from '../../../common/dto/pagination.dto';

@Controller('/api/v1/automation')
export class AutomationRuleController {
  @Inject()
  automationAppService: AutomationAppService;

  @Inject()
  currentUserService: CurrentUserService;

  private async getUser(): Promise<CurrentUser> {
    return this.currentUserService.getUser();
  }

  @Get('/rules')
  async listRules(
    @Query() query: PageRequestDto
  ): Promise<{ items: any[]; total: number }> {
    const user = await this.getUser();
    const listQuery: ListRulesQuery = {
      ...query,
      projectId: query.projectId as number | undefined,
      boardId: query.boardId as number | undefined,
      eventType: query.eventType as string | undefined,
      isEnabled: query.isEnabled as boolean | undefined,
    };
    return this.automationAppService.listRules(listQuery, user);
  }

  @Get('/rules/:ruleId')
  async getRule(@Param('ruleId') ruleId: number): Promise<any | null> {
    const user = await this.getUser();
    return this.automationAppService.getRule(ruleId, user);
  }

  @Post('/rules')
  async createRule(
    @Body() dto: CreateAutomationRuleRequestDto
  ): Promise<any> {
    const user = await this.getUser();
    return this.automationAppService.createRule(dto, user);
  }

  @Put('/rules/:ruleId')
  async updateRule(
    @Param('ruleId') ruleId: number,
    @Body() dto: UpdateAutomationRuleRequestDto
  ): Promise<any | null> {
    const user = await this.getUser();
    return this.automationAppService.updateRule(ruleId, { ...dto, id: ruleId }, user);
  }

  @Post('/rules/:ruleId/toggle')
  async toggleRule(
    @Param('ruleId') ruleId: number,
    @Body() dto: ToggleRuleRequestDto
  ): Promise<any | null> {
    const user = await this.getUser();
    return this.automationAppService.toggleRule(ruleId, dto, user);
  }

  @Post('/rules/validate')
  async validateDsl(
    @Body() dto: ValidateRuleDslRequestDto
  ): Promise<{ valid: boolean; errors: string[] }> {
    const user = await this.getUser();
    return this.automationAppService.validateDsl(dto, user);
  }

  @Get('/rules/:ruleId/executions')
  async listExecutions(
    @Param('ruleId') ruleId: number,
    @Query() query: PageRequestDto
  ): Promise<{ items: any[]; total: number }> {
    const user = await this.getUser();
    return this.automationAppService.listExecutions(ruleId, query, user);
  }
}
