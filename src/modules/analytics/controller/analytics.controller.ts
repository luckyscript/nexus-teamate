import {
  Controller,
  Get,
  Query,
  Inject,
} from '@midwayjs/core';
import { AnalyticsAppService } from '../app/analytics-app.service';
import { AnalyticsQueryDto } from '../dto/analytics.dto';
import { CurrentUser } from '../../../framework/auth/current-user.service';

@Controller('/api/v1/analytics')
export class AnalyticsController {
  @Inject()
  analyticsAppService: AnalyticsAppService;

  private getUser(): CurrentUser {
    return this.ctx.user as CurrentUser;
  }

  @Get('/overview')
  async getOverview(@Query() query: AnalyticsQueryDto) {
    return this.analyticsAppService.getOverview(query, this.getUser());
  }

  @Get('/trends')
  async getTrends(@Query() query: AnalyticsQueryDto) {
    return this.analyticsAppService.getTrends(query, this.getUser());
  }

  @Get('/agents/ranking')
  async getAgentRanking(@Query() query: AnalyticsQueryDto) {
    return this.analyticsAppService.getAgentRanking(query, this.getUser());
  }

  @Get('/automation/funnel')
  async getAutomationFunnel(@Query() query: AnalyticsQueryDto) {
    return this.analyticsAppService.getAutomationFunnel(query, this.getUser());
  }
}
