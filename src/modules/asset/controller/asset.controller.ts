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
import { AssetAppService } from '../app/asset-app.service';
import {
  CreateSkillRequestDto,
  UpdateSkillRequestDto,
  CreateCapsuleRequestDto,
  UpdateCapsuleRequestDto,
  CreateTemplateRequestDto,
  UpdateTemplateRequestDto,
  CreateAssetBindingRequestDto,
} from '../dto/asset.dto';
import { PageRequestDto } from '../../../common/dto/pagination.dto';
import { CurrentUser } from '../../../framework/auth/current-user.service';

@Provide()
@Controller('/api/v1/assets')
export class AssetController {
  @Inject()
  ctx: any;

  @Inject()
  assetAppService: AssetAppService;

  private getUser(): CurrentUser {
    return (this.ctx as any).user ?? { id: 1, tenantId: 1, username: "test", displayName: "Test", roles: ["admin"], permissions: [] } as CurrentUser;
  }

  // Skill endpoints

  @Get('/skills')
  async listSkills(@Query() query: PageRequestDto & { keyword?: string; category?: string; status?: string }) {
    return this.assetAppService.listSkills(query, this.getUser());
  }

  @Post('/skills')
  async createSkill(@Body() dto: CreateSkillRequestDto) {
    return this.assetAppService.createSkill(dto, this.getUser());
  }

  @Get('/skills/:skillId')
  async getSkill(@Param('skillId') skillId: string) {
    return this.assetAppService.getSkill(Number(skillId), this.getUser());
  }

  @Put('/skills/:skillId')
  async updateSkill(@Param('skillId') skillId: string, @Body() dto: UpdateSkillRequestDto) {
    return this.assetAppService.updateSkill(Number(skillId), dto, this.getUser());
  }

  @Post('/skills/:skillId/publish')
  async publishSkill(@Param('skillId') skillId: string) {
    return this.assetAppService.publishSkill(Number(skillId), this.getUser());
  }

  // Capsule endpoints

  @Get('/capsules')
  async listCapsules(@Query() query: PageRequestDto & { keyword?: string; sceneType?: string; status?: string }) {
    return this.assetAppService.listCapsules(query, this.getUser());
  }

  @Post('/capsules')
  async createCapsule(@Body() dto: CreateCapsuleRequestDto) {
    return this.assetAppService.createCapsule(dto, this.getUser());
  }

  @Get('/capsules/:capsuleId')
  async getCapsule(@Param('capsuleId') capsuleId: string) {
    return this.assetAppService.getCapsule(Number(capsuleId), this.getUser());
  }

  @Put('/capsules/:capsuleId')
  async updateCapsule(@Param('capsuleId') capsuleId: string, @Body() dto: UpdateCapsuleRequestDto) {
    return this.assetAppService.updateCapsule(Number(capsuleId), dto, this.getUser());
  }

  @Post('/capsules/:capsuleId/publish')
  async publishCapsule(@Param('capsuleId') capsuleId: string) {
    return this.assetAppService.publishCapsule(Number(capsuleId), this.getUser());
  }

  // Template endpoints

  @Get('/templates')
  async listTemplates(@Query() query: PageRequestDto & { keyword?: string; templateType?: string; scopeType?: string; status?: string }) {
    return this.assetAppService.listTemplates(query, this.getUser());
  }

  @Post('/templates')
  async createTemplate(@Body() dto: CreateTemplateRequestDto) {
    return this.assetAppService.createTemplate(dto, this.getUser());
  }

  @Get('/templates/:templateId')
  async getTemplate(@Param('templateId') templateId: string) {
    return this.assetAppService.getTemplate(Number(templateId), this.getUser());
  }

  @Put('/templates/:templateId')
  async updateTemplate(@Param('templateId') templateId: string, @Body() dto: UpdateTemplateRequestDto) {
    return this.assetAppService.updateTemplate(Number(templateId), dto, this.getUser());
  }

  @Post('/templates/:templateId/publish')
  async publishTemplate(@Param('templateId') templateId: string) {
    return this.assetAppService.publishTemplate(Number(templateId), this.getUser());
  }

  // Binding endpoints

  @Post('/bindings')
  async createBinding(@Body() dto: CreateAssetBindingRequestDto) {
    return this.assetAppService.createBinding(dto, this.getUser());
  }

  @Get('/bindings')
  async listBindings(@Query() query: PageRequestDto & { assetType?: string; assetId?: string; targetType?: string; targetId?: string }) {
    const params = {
      ...query,
      assetId: query.assetId ? Number(query.assetId) : undefined,
      targetId: query.targetId ? Number(query.targetId) : undefined,
    };
    return this.assetAppService.listBindings(params, this.getUser());
  }

  @Del('/bindings/:bindingId')
  async deleteBinding(@Param('bindingId') bindingId: string) {
    return this.assetAppService.deleteBinding(Number(bindingId), this.getUser());
  }
}
