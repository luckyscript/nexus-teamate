import { Provide } from '@midwayjs/core';
import { AgentExecutionEntity } from '../../entity/agent-execution.entity';

@Provide()
export class ToolRunner {
  async run(
    execution: AgentExecutionEntity,
    toolName: string,
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    console.log(
      `[ToolRunner] Executing tool=${toolName} for execution=${execution.id}`,
    );

    return {
      status: 'stub',
      message: '[MVP Stub] Tool runner response. Implement tool registry and execution.',
      toolName,
      input,
    };
  }
}
