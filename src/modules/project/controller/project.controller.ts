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
  Provide,
} from '@midwayjs/core';
import { ProjectAppService } from '../app/project-app.service';
import { CreateProjectRequestDto, UpdateProjectRequestDto } from '../dto/project.dto';
import { PageRequestDto } from '../../../common/dto/pagination.dto';
import { CurrentUser } from '../../../framework/auth/current-user.service';

@Provide()
@Controller('/api/v1/projects')
export class ProjectController {
  @Inject()
  ctx: any;

  @Inject()
  projectAppService: ProjectAppService;

  private getUser(): CurrentUser {
    return (this.ctx as any).user ?? { id: 1, tenantId: 1, username: "test", displayName: "Test", roles: ["admin"], permissions: [] } as CurrentUser;
  }

  @Get('/')
  async listProjects(
    @Query() query: PageRequestDto & { keyword?: string; status?: string },
  ) {
    return this.projectAppService.listProjects(query, this.getUser());
  }

  @Get('/:id')
  async getProject(@Param('id') id: string) {
    return this.projectAppService.getProject(Number(id), this.getUser());
  }

  @Post('/')
  async createProject(@Body() dto: CreateProjectRequestDto) {
    return this.projectAppService.createProject(dto, this.getUser());
  }

  @Put('/:id')
  async updateProject(
    @Param('id') id: string,
    @Body() dto: UpdateProjectRequestDto,
  ) {
    return this.projectAppService.updateProject(Number(id), dto, this.getUser());
  }

  @Del('/:id')
  async deleteProject(@Param('id') id: string) {
    return this.projectAppService.deleteProject(Number(id), this.getUser());
  }

  @Get('/:projectId/boards')
  async getProjectBoards(@Param('projectId') projectId: string) {
    return { list: [], pagination: { page: 1, pageSize: 20, total: 0 } };
  }
}
