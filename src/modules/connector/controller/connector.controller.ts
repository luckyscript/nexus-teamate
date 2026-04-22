import { Provide } from '@midwayjs/core';
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

@Provide()
@Controller('/api/v1/connectors')
export class ConnectorController {
  @Inject()
  ctx: any;

  @Inject()
  connectorAppService: ConnectorAppService;

  private getUser(): CurrentUser {
    return (this.ctx as any).user ?? { id: 1, tenantId: 1, username: "test", displayName: "Test", roles: ["admin"], permissions: [] } as CurrentUser;
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
    return this.connectorAppService.listInstances(query, this.getUser());
  }

  @Get('/instances/:instanceId')
  async getInstance(@Param('instanceId') instanceId: string) {
    return this.connectorAppService.getInstance(Number(instanceId), this.getUser());
  }

  @Post('/instances')
  async createInstance(@Body() dto: CreateConnectorInstanceRequestDto) {
    return this.connectorAppService.createInstance(dto, this.getUser());
  }

  @Put('/instances/:instanceId')
  async updateInstance(
    @Param('instanceId') instanceId: string,
    @Body() dto: UpdateConnectorInstanceRequestDto,
  ) {
    return this.connectorAppService.updateInstance(Number(instanceId), dto, this.getUser());
  }

  @Del('/instances/:instanceId')
  async deleteInstance(@Param('instanceId') instanceId: string) {
    return this.connectorAppService.deleteInstance(Number(instanceId), this.getUser());
  }

  @Post('/instances/:instanceId/test')
  async testInstance(@Param('instanceId') instanceId: string) {
    return this.connectorAppService.testInstance(Number(instanceId), this.getUser());
  }

  @Post('/instances/:instanceId/sync')
  async triggerSync(
    @Param('instanceId') instanceId: string,
    @Body() dto: TriggerSyncRequestDto,
  ) {
    return this.connectorAppService.triggerSync(Number(instanceId), dto, this.getUser());
  }

  @Get('/instances/:instanceId/jobs')
  async listSyncJobs(
    @Param('instanceId') instanceId: string,
    @Query() query: PageRequestDto,
  ) {
    return this.connectorAppService.listSyncJobs(Number(instanceId), query, this.getUser());
  }
}

@Provide()
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
