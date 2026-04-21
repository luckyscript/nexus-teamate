import {
  Controller,
  Get,
  Post,
  Put,
  Del,
  Query,
  Body,
  Param,
  Inject,
} from '@midwayjs/core';
import { ConnectorAppService } from '../app/connector-app.service';
import {
  CreateConnectorInstanceRequestDto,
  UpdateConnectorInstanceRequestDto,
  TriggerSyncRequestDto,
} from '../dto/connector.dto';
import { PageRequestDto } from '../../../common/dto/pagination.dto';
import { CurrentUser } from '../../../framework/auth/current-user.service';

@Controller('/api/v1/connectors')
export class ConnectorController {
  @Inject()
  connectorAppService: ConnectorAppService;

  private getUser(ctx: any): CurrentUser {
    return ctx.user as CurrentUser;
  }

  @Get('/definitions')
  async listDefinitions(
    @Query('status') status?: string,
  ) {
    return this.connectorAppService.listDefinitions(status);
  }

  @Get('/instances')
  async listInstances(
    @Query() query: PageRequestDto & { definitionId?: number; status?: string },
  ) {
    return this.connectorAppService.listInstances(query, this.getUser(this.ctx));
  }

  @Get('/instances/:instanceId')
  async getInstance(@Param('instanceId') instanceId: string) {
    return this.connectorAppService.getInstance(Number(instanceId), this.getUser(this.ctx));
  }

  @Post('/instances')
  async createInstance(@Body() dto: CreateConnectorInstanceRequestDto) {
    return this.connectorAppService.createInstance(dto, this.getUser(this.ctx));
  }

  @Put('/instances/:instanceId')
  async updateInstance(
    @Param('instanceId') instanceId: string,
    @Body() dto: UpdateConnectorInstanceRequestDto,
  ) {
    return this.connectorAppService.updateInstance(Number(instanceId), dto, this.getUser(this.ctx));
  }

  @Del('/instances/:instanceId')
  async deleteInstance(@Param('instanceId') instanceId: string) {
    return this.connectorAppService.deleteInstance(Number(instanceId), this.getUser(this.ctx));
  }

  @Post('/instances/:instanceId/test')
  async testInstance(@Param('instanceId') instanceId: string) {
    return this.connectorAppService.testInstance(Number(instanceId), this.getUser(this.ctx));
  }

  @Post('/instances/:instanceId/sync')
  async triggerSync(
    @Param('instanceId') instanceId: string,
    @Body() dto: TriggerSyncRequestDto,
  ) {
    return this.connectorAppService.triggerSync(Number(instanceId), dto, this.getUser(this.ctx));
  }

  @Get('/instances/:instanceId/jobs')
  async listSyncJobs(
    @Param('instanceId') instanceId: string,
    @Query() query: PageRequestDto,
  ) {
    return this.connectorAppService.listSyncJobs(Number(instanceId), query, this.getUser(this.ctx));
  }
}

@Controller('/api/v1/connectors/webhooks')
export class ConnectorWebhookController {
  @Inject()
  connectorAppService: ConnectorAppService;

  @Post('/:connectorCode')
  async receiveWebhook(
    @Param('connectorCode') connectorCode: string,
    @Body() body: any,
  ) {
    console.log(`[Webhook] Received webhook for connector: ${connectorCode}`, JSON.stringify(body));
    return { success: true, message: 'Webhook received' };
  }
}
