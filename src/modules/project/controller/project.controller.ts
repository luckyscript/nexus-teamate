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
import { ProjectAppService } from '../app/project-app.service';
import { CreateProjectRequestDto, UpdateProjectRequestDto } from '../dto/project.dto';
import { PageRequestDto } from '../../../common/dto/pagination.dto';
import { CurrentUser } from '../../../framework/auth/current-user.service';

@Controller('/api/v1/projects')
export class ProjectController {
  @Inject()
  projectAppService: ProjectAppService;

  private getUser(ctx: any): CurrentUser {
    return ctx.user as CurrentUser;
  }

  @Get('/')
  async listProjects(
    @Query() query: PageRequestDto & { keyword?: string; status?: string },
  ) {
    return this.projectAppService.listProjects(query, this.getUser(this.ctx));
  }

  @Get('/:id')
  async getProject(@Param('id') id: string) {
    return this.projectAppService.getProject(Number(id), this.getUser(this.ctx));
  }

  @Post('/')
  async createProject(@Body() dto: CreateProjectRequestDto) {
    return this.projectAppService.createProject(dto, this.getUser(this.ctx));
  }

  @Put('/:id')
  async updateProject(
    @Param('id') id: string,
    @Body() dto: UpdateProjectRequestDto,
  ) {
    return this.projectAppService.updateProject(Number(id), dto, this.getUser(this.ctx));
  }

  @Del('/:id')
  async deleteProject(@Param('id') id: string) {
    return this.projectAppService.deleteProject(Number(id), this.getUser(this.ctx));
  }

  @Get('/:projectId/boards')
  async getProjectBoards(@Param('projectId') projectId: string) {
    return { list: [], pagination: { page: 1, pageSize: 20, total: 0 } };
  }
}
