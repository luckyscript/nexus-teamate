import { Provide, Inject } from '@midwayjs/core';
import { HttpException, HttpStatus } from '@midwayjs/core';
import { AgentRepository } from '../repository/agent.repository';
import { AgentExecutionRepository } from '../repository/agent-execution.repository';
import { AgentDomainService } from '../domain/agent-domain.service';
import { EventPublisher } from '../../../framework/event/event.publisher';
import { QueueService } from '../../../framework/queue/queue.service';
import { QUEUE_NAMES } from '../../../framework/queue/queue.constants';
import { CurrentUser } from '../../../framework/auth/current-user.service';
import {
  CreateAgentRequestDto,
  UpdateAgentRequestDto,
  ExecuteAgentRequestDto,
  AgentDetailVO,
  AgentExecutionVO,
  AgentExecutionLogVO,
} from '../dto/agent.dto';
import { AgentDefinitionEntity } from '../entity/agent-definition.entity';
import { AgentExecutionEntity } from '../entity/agent-execution.entity';
import { AgentExecutionLogEntity } from '../entity/agent-execution-log.entity';
import { AgentOrchestrator } from '../runtime/orchestrator/agent-orchestrator';

@Provide()
export class AgentAppService {
  @Inject()
  agentRepository: AgentRepository;

  @Inject()
  agentExecutionRepository: AgentExecutionRepository;

  @Inject()
  agentDomainService: AgentDomainService;

  @Inject()
  eventPublisher: EventPublisher;

  @Inject()
  queueService: QueueService;

  @Inject()
  agentOrchestrator: AgentOrchestrator;

  async createAgent(
    dto: CreateAgentRequestDto,
    user: CurrentUser,
  ): Promise<AgentDetailVO> {
    this.agentDomainService.validateDefinition({
      agentKey: dto.agentKey,
      promptTemplate: dto.promptTemplate,
      inputSchema: dto.inputSchema,
      modelConfig: dto.modelConfig,
      timeoutSeconds: dto.timeoutSeconds,
    });

    const existing = await this.agentRepository.findByKey(dto.agentKey, user.tenantId, 1);
    if (existing) {
      throw new HttpException('An agent with this key already exists', HttpStatus.CONFLICT);
    }

    const entity = await this.agentRepository.create(
      {
        agentKey: dto.agentKey,
        name: dto.name,
        category: dto.category,
        ownerType: this.deriveOwnerType(dto.agentKey),
        status: dto.status ?? 'draft',
        description: null,
        promptTemplate: dto.promptTemplate,
        inputSchema: dto.inputSchema,
        outputSchema: dto.outputSchema ?? null,
        toolPolicy: dto.toolPolicy ?? null,
        assetBindings: dto.assetBindings ?? null,
        modelConfig: dto.modelConfig,
        retryPolicy: dto.retryPolicy ?? null,
        timeoutSeconds: dto.timeoutSeconds,
        version: 1,
        isBuiltin: 0,
      },
      user,
    );

    return this.toDetailVO(entity, { totalRuns: 0, successRate: 0, avgDuration: 0 });
  }

  async listAgents(
    query: { keyword?: string; status?: string; category?: string; page?: number; pageSize?: number },
    user: CurrentUser,
  ): Promise<{ list: AgentDetailVO[]; pagination: { page: number; pageSize: number; total: number } }> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const result = await this.agentRepository.findAll(user.tenantId, {
      keyword: query.keyword,
      status: query.status,
      category: query.category,
    }, page, pageSize);

    const list = await Promise.all(
      result.items.map(async (entity) => {
        const stats = await this.agentExecutionRepository.getExecutionStats(entity.id, user.tenantId);
        return this.toDetailVO(entity, stats);
      }),
    );

    return {
      list,
      pagination: { page, pageSize, total: result.total },
    };
  }

  async getAgent(id: number, user: CurrentUser): Promise<AgentDetailVO> {
    const entity = await this.agentRepository.findById(id, user.tenantId);
    if (!entity) {
      throw new HttpException('Agent not found', HttpStatus.NOT_FOUND);
    }

    const stats = await this.agentExecutionRepository.getExecutionStats(id, user.tenantId);
    return this.toDetailVO(entity, stats);
  }

  async updateAgent(
    id: number,
    dto: UpdateAgentRequestDto,
    user: CurrentUser,
  ): Promise<AgentDetailVO> {
    const existing = await this.agentRepository.findById(id, user.tenantId);
    if (!existing) {
      throw new HttpException('Agent not found', HttpStatus.NOT_FOUND);
    }

    if (existing.status === 'published') {
      throw new HttpException('Cannot update a published agent version', HttpStatus.BAD_REQUEST);
    }

    if (dto.agentKey && dto.agentKey !== existing.agentKey) {
      this.agentDomainService.validateDefinition({
        agentKey: dto.agentKey,
        promptTemplate: dto.promptTemplate ?? existing.promptTemplate,
        inputSchema: dto.inputSchema ?? existing.inputSchema,
        modelConfig: (dto.modelConfig ?? existing.modelConfig) as Record<string, unknown>,
        timeoutSeconds: dto.timeoutSeconds ?? existing.timeoutSeconds,
      });
    }

    const changes: Partial<AgentDefinitionEntity> = {};
    if (dto.agentKey !== undefined) changes.agentKey = dto.agentKey;
    if (dto.name !== undefined) changes.name = dto.name;
    if (dto.category !== undefined) changes.category = dto.category;
    if (dto.status !== undefined) changes.status = dto.status;
    if (dto.promptTemplate !== undefined) changes.promptTemplate = dto.promptTemplate;
    if (dto.inputSchema !== undefined) changes.inputSchema = dto.inputSchema;
    if (dto.outputSchema !== undefined) changes.outputSchema = dto.outputSchema;
    if (dto.toolPolicy !== undefined) changes.toolPolicy = dto.toolPolicy;
    if (dto.assetBindings !== undefined) changes.assetBindings = dto.assetBindings;
    if (dto.modelConfig !== undefined) changes.modelConfig = dto.modelConfig;
    if (dto.retryPolicy !== undefined) changes.retryPolicy = dto.retryPolicy;
    if (dto.timeoutSeconds !== undefined) changes.timeoutSeconds = dto.timeoutSeconds;

    const updated = await this.agentRepository.update(id, changes, user.tenantId, user);
    if (!updated) {
      throw new HttpException('Agent not found', HttpStatus.NOT_FOUND);
    }

    const stats = await this.agentExecutionRepository.getExecutionStats(id, user.tenantId);
    return this.toDetailVO(updated, stats);
  }

  async publishAgent(id: number, user: CurrentUser): Promise<AgentDetailVO> {
    const existing = await this.agentRepository.findById(id, user.tenantId);
    if (!existing) {
      throw new HttpException('Agent not found', HttpStatus.NOT_FOUND);
    }

    if (existing.status !== 'draft') {
      throw new HttpException('Only draft agents can be published', HttpStatus.BAD_REQUEST);
    }

    const published = await this.agentRepository.publish(id, user);

    await this.eventPublisher.publish({
      eventName: 'agent.published',
      tenantId: user.tenantId,
      userId: user.id,
      payload: { agentId: published.id, agentKey: published.agentKey, version: published.version },
      occurredAt: new Date(),
    });

    const stats = await this.agentExecutionRepository.getExecutionStats(published.id, user.tenantId);
    return this.toDetailVO(published, stats);
  }

  async executeAgent(
    agentId: number,
    dto: ExecuteAgentRequestDto,
    user: CurrentUser,
  ): Promise<{ executionId: number; status: string }> {
    const agent = await this.agentRepository.findById(agentId, user.tenantId);
    if (!agent) {
      throw new HttpException('Agent not found', HttpStatus.NOT_FOUND);
    }

    if (agent.status !== 'published') {
      throw new HttpException('Only published agents can be executed', HttpStatus.BAD_REQUEST);
    }

    const execution = await this.agentExecutionRepository.create({
      tenantId: user.tenantId,
      taskId: dto.taskId ?? null,
      agentId,
      triggerType: dto.triggerType,
      status: 'queued',
      queueName: QUEUE_NAMES.AGENT_EXECUTION,
      inputPayload: dto.input,
    });

    await this.queueService.addJob(
      QUEUE_NAMES.AGENT_EXECUTION,
      'execute_agent',
      {
        executionId: execution.id,
        agentId,
        tenantId: user.tenantId,
        userId: user.id,
        input: dto.input,
        taskId: dto.taskId,
      },
    );

    return { executionId: execution.id, status: 'queued' };
  }

  async getExecution(executionId: number, user: CurrentUser): Promise<{ execution: AgentExecutionVO; logs: AgentExecutionLogVO[] }> {
    const execution = await this.agentExecutionRepository.findById(executionId, user.tenantId);
    if (!execution) {
      throw new HttpException('Execution not found', HttpStatus.NOT_FOUND);
    }

    const logs = await this.agentExecutionRepository.getExecutionLogs(executionId, user.tenantId);
    const agent = await this.agentRepository.findById(execution.agentId, user.tenantId);

    return {
      execution: this.toExecutionVO(execution, agent?.name ?? 'Unknown'),
      logs: logs.map((log) => this.toExecutionLogVO(log)),
    };
  }

  async listExecutions(
    query: { taskId?: number; agentId?: number; status?: string },
    user: CurrentUser,
  ): Promise<{ items: AgentExecutionVO[]; total: number }> {
    const result = await this.agentExecutionRepository.findAll(query, user.tenantId);

    const items = await Promise.all(
      result.items.map(async (exec) => {
        const agent = await this.agentRepository.findById(exec.agentId, user.tenantId);
        return this.toExecutionVO(exec, agent?.name ?? 'Unknown');
      }),
    );

    return { items, total: result.total };
  }

  async retryExecution(executionId: number, user: CurrentUser): Promise<{ executionId: number; status: string }> {
    const execution = await this.agentExecutionRepository.findById(executionId, user.tenantId);
    if (!execution) {
      throw new HttpException('Execution not found', HttpStatus.NOT_FOUND);
    }

    if (execution.status !== 'failed') {
      throw new HttpException('Only failed executions can be retried', HttpStatus.BAD_REQUEST);
    }

    const retryCount = (execution.retryCount ?? 0) + 1;

    await this.agentExecutionRepository.updateStatus(executionId, 'queued', {
      retryCount,
      startedAt: null,
      finishedAt: null,
      errorPayload: null,
    });

    await this.queueService.addJob(
      QUEUE_NAMES.AGENT_EXECUTION,
      'execute_agent',
      {
        executionId: execution.id,
        agentId: execution.agentId,
        tenantId: user.tenantId,
        userId: user.id,
        input: execution.inputPayload,
        taskId: execution.taskId,
        retryCount,
      },
    );

    return { executionId: execution.id, status: 'queued' };
  }

  async startExecution(
    executionId: number,
    data: { agentId: number; taskId: number | null; inputPayload: Record<string, unknown> },
  ): Promise<void> {
    const execution = await this.agentExecutionRepository.findById(executionId, 0);
    if (!execution) {
      throw new HttpException('Execution not found', HttpStatus.NOT_FOUND);
    }

    await this.agentExecutionRepository.updateStatus(executionId, 'running', {
      startedAt: new Date(),
      inputPayload: data.inputPayload,
    });

    const result = await this.agentOrchestrator.execute(execution);

    await this.agentExecutionRepository.updateStatus(executionId, 'succeeded', {
      outputPayload: result.output as any,
      finishedAt: new Date(),
      tokensIn: result.tokensIn || 0,
      tokensOut: result.tokensOut || 0,
    });

    await this.eventPublisher.publishAgentExecution('succeeded', executionId, execution.tenantId, {
      agentId: execution.agentId,
      taskId: execution.taskId,
    });
  }

  async failExecution(
    executionId: number,
    error: Error | { message: string },
  ): Promise<void> {
    const message = error instanceof Error ? error.message : error.message;
    await this.agentExecutionRepository.updateStatus(executionId, 'failed', {
      errorPayload: { message, stack: error instanceof Error ? error.stack : null } as any,
      finishedAt: new Date(),
    });

    const execution = await this.agentExecutionRepository.findById(executionId, 0);
    if (execution) {
      await this.eventPublisher.publishAgentExecution('failed', executionId, execution.tenantId, {
        agentId: execution.agentId,
        taskId: execution.taskId,
        errorMessage: message,
      });
    }
  }

  async terminateExecution(executionId: number, user: CurrentUser): Promise<void> {
    const execution = await this.agentExecutionRepository.findById(executionId, user.tenantId);
    if (!execution) {
      throw new HttpException('Execution not found', HttpStatus.NOT_FOUND);
    }

    if (execution.status !== 'running' && execution.status !== 'queued') {
      throw new HttpException('Only running or queued executions can be terminated', HttpStatus.BAD_REQUEST);
    }

    await this.agentExecutionRepository.updateStatus(executionId, 'terminated', {
      finishedAt: new Date(),
    });

    await this.eventPublisher.publish({
      eventName: 'agent.execution_terminated',
      tenantId: user.tenantId,
      userId: user.id,
      payload: { executionId, agentId: execution.agentId },
      occurredAt: new Date(),
    });
  }

  private deriveOwnerType(agentKey: string): string {
    const prefix = agentKey.split(':')[0];
    if (prefix === 'system') return 'system';
    if (prefix === 'team') return 'team';
    return 'user';
  }

  private toDetailVO(
    entity: AgentDefinitionEntity,
    stats: { totalRuns: number; successRate: number; avgDuration: number },
  ): AgentDetailVO {
    return {
      id: entity.id,
      tenantId: entity.tenantId,
      agentKey: entity.agentKey,
      name: entity.name,
      category: entity.category,
      ownerType: entity.ownerType,
      status: entity.status,
      description: entity.description,
      promptTemplate: entity.promptTemplate,
      inputSchema: entity.inputSchema,
      outputSchema: entity.outputSchema,
      toolPolicy: entity.toolPolicy,
      assetBindings: entity.assetBindings,
      modelConfig: entity.modelConfig,
      retryPolicy: entity.retryPolicy,
      timeoutSeconds: entity.timeoutSeconds,
      version: entity.version,
      isBuiltin: entity.isBuiltin,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      executionStats: stats,
    };
  }

  private toExecutionVO(entity: AgentExecutionEntity, agentName: string): AgentExecutionVO {
    return {
      id: entity.id,
      tenantId: entity.tenantId,
      taskId: entity.taskId,
      agentId: entity.agentId,
      agentName,
      triggerType: entity.triggerType,
      triggerRef: entity.triggerRef,
      status: entity.status,
      queueName: entity.queueName,
      inputPayload: entity.inputPayload,
      outputPayload: entity.outputPayload,
      errorPayload: entity.errorPayload,
      tokensIn: entity.tokensIn,
      tokensOut: entity.tokensOut,
      costAmount: Number(entity.costAmount ?? 0),
      retryCount: entity.retryCount,
      startedAt: entity.startedAt,
      finishedAt: entity.finishedAt,
      createdAt: entity.createdAt,
    };
  }

  private toExecutionLogVO(entity: AgentExecutionLogEntity): AgentExecutionLogVO {
    return {
      id: entity.id,
      executionId: entity.executionId,
      logType: entity.logType,
      content: entity.content,
      extra: entity.extraJson,
      createdAt: entity.createdAt,
    };
  }
}
