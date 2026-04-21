import { Provide, Inject } from '@midwayjs/core';
import { AgentExecutionEntity } from '../../entity/agent-execution.entity';
import { AgentDefinitionEntity } from '../../entity/agent-definition.entity';
import { AgentExecutionRepository } from '../../repository/agent-execution.repository';
import { AgentRepository } from '../../repository/agent.repository';
import { ModelGateway } from '../gateway/model-gateway';
import { ToolRunner } from '../tool/tool-runner';
import { Guardrail } from '../guardrail';
import { EventPublisher } from '../../../../framework/event/event.publisher';

export interface AgentContext {
  execution: AgentExecutionEntity;
  agent: AgentDefinitionEntity;
  input: Record<string, unknown>;
  assets: Record<string, unknown>[];
  skills: string[];
}

export interface ExecutionResult {
  output: Record<string, unknown>;
  tokensIn: number;
  tokensOut: number;
  costAmount: number;
}

@Provide()
export class AgentOrchestrator {
  @Inject()
  agentRepository: AgentRepository;

  @Inject()
  agentExecutionRepository: AgentExecutionRepository;

  @Inject()
  modelGateway: ModelGateway;

  @Inject()
  toolRunner: ToolRunner;

  @Inject()
  guardrail: Guardrail;

  @Inject()
  eventPublisher: EventPublisher;

  async prepareContext(execution: AgentExecutionEntity): Promise<AgentContext> {
    const agent = await this.agentRepository.findById(execution.agentId, execution.tenantId);
    if (!agent) {
      throw new Error(`Agent ${execution.agentId} not found for execution ${execution.id}`);
    }

    const taskContext = execution.inputPayload ?? {};
    const input = this.mergeInput(agent, taskContext);
    const assets = (agent.assetBindings as { assetType: string; assetId: number }[]) ?? [];
    const tools = (agent.toolPolicy as { tools: string[] })?.tools ?? [];

    return {
      execution,
      agent,
      input,
      assets,
      skills: tools,
    };
  }

  async execute(execution: AgentExecutionEntity): Promise<ExecutionResult> {
    const context = await this.prepareContext(execution);

    await this.agentExecutionRepository.updateStatus(execution.id, 'running');

    await this.agentExecutionRepository.createLog({
      tenantId: execution.tenantId,
      executionId: execution.id,
      logType: 'info',
      content: 'Agent execution started',
    });

    const toolPolicy = context.agent.toolPolicy as { maxCalls?: number } | null;
    const maxToolCalls = toolPolicy?.maxCalls ?? 5;
    let toolCallCount = 0;

    const result = await this.modelGateway.call(
      context.agent.modelConfig as Record<string, unknown>,
      context.agent.promptTemplate,
      context.input,
    );

    if (result.toolCalls) {
      for (const toolCall of result.toolCalls) {
        if (toolCallCount >= maxToolCalls) break;

        const allowed = this.guardrail.checkToolPolicy(context.agent, toolCall.name);
        if (!allowed) {
          await this.agentExecutionRepository.createLog({
            tenantId: execution.tenantId,
            executionId: execution.id,
            logType: 'error',
            content: `Tool ${toolCall.name} blocked by policy`,
          });
          continue;
        }

        const toolResult = await this.toolRunner.run(execution, toolCall.name, toolCall.input);
        toolCallCount++;

        await this.agentExecutionRepository.createLog({
          tenantId: execution.tenantId,
          executionId: execution.id,
          logType: 'tool_call',
          content: JSON.stringify({ tool: toolCall.name, result: toolResult }),
        });
      }
    }

    await this.agentExecutionRepository.createLog({
      tenantId: execution.tenantId,
      executionId: execution.id,
      logType: 'response',
      content: typeof result.output === 'string' ? result.output : JSON.stringify(result.output),
    });

    return {
      output: result.output,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      costAmount: result.costAmount,
    };
  }

  async handleResult(execution: AgentExecutionEntity, result: ExecutionResult): Promise<void> {
    const agent = await this.agentRepository.findById(execution.agentId, execution.tenantId);
    const validation = this.guardrail.validateOutput(agent, result.output);
    if (!validation.valid) {
      await this.agentExecutionRepository.updateStatus(execution.id, 'failed', {
        errorPayload: { errors: validation.errors },
      });
      await this.agentExecutionRepository.createLog({
        tenantId: execution.tenantId,
        executionId: execution.id,
        logType: 'error',
        content: `Output guardrail failed: ${validation.errors.join(', ')}`,
      });
      return;
    }

    await this.agentExecutionRepository.updateStatus(execution.id, 'succeeded', {
      outputPayload: result.output,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      costAmount: result.costAmount,
    });

    await this.eventPublisher.publish({
      eventName: 'agent.execution_succeeded',
      tenantId: execution.tenantId,
      userId: 0,
      payload: {
        executionId: execution.id,
        agentId: execution.agentId,
        output: result.output,
      },
      occurredAt: new Date(),
    });
  }

  private mergeInput(
    agent: AgentDefinitionEntity,
    taskContext: Record<string, unknown>,
  ): Record<string, unknown> {
    const inputSchema = agent.inputSchema as Record<string, unknown>;
    const properties = (inputSchema.properties as Record<string, unknown>) ?? {};
    const required = (inputSchema.required as string[]) ?? [];

    const merged: Record<string, unknown> = { ...taskContext };

    for (const field of required) {
      if (!(field in merged) && field in properties) {
        const defaultVal = (properties[field] as Record<string, unknown>).default;
        if (defaultVal !== undefined) {
          merged[field] = defaultVal;
        }
      }
    }

    return merged;
  }
}
