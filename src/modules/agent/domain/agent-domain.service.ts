import { Provide } from '@midwayjs/core';
import { AgentDefinitionEntity } from '../entity/agent-definition.entity';

@Provide()
export class AgentDomainService {
  private readonly AGENT_KEY_PATTERN = /^(system|team|user):[a-zA-Z0-9_.-]+$/;

  validateDefinition(dto: {
    agentKey: string;
    promptTemplate: string;
    inputSchema: Record<string, unknown>;
    modelConfig: Record<string, unknown>;
    timeoutSeconds: number;
  }): void {
    if (!this.AGENT_KEY_PATTERN.test(dto.agentKey)) {
      throw new Error(
        `Invalid agentKey format. Must match pattern 'system:xxx', 'team:xxx', or 'user:xxx'. Got: ${dto.agentKey}`,
      );
    }

    if (!dto.promptTemplate || dto.promptTemplate.trim().length === 0) {
      throw new Error('promptTemplate must not be empty');
    }

    if (!dto.inputSchema || typeof dto.inputSchema !== 'object') {
      throw new Error('inputSchema must be a valid JSON Schema object');
    }

    if (!dto.modelConfig.provider || typeof dto.modelConfig.provider !== 'string') {
      throw new Error('modelConfig.provider is required');
    }

    if (!dto.modelConfig.model || typeof dto.modelConfig.model !== 'string') {
      throw new Error('modelConfig.model is required');
    }

    if (!dto.timeoutSeconds || dto.timeoutSeconds <= 0) {
      throw new Error('timeoutSeconds must be greater than 0');
    }
  }

  buildExecutionInput(
    agent: AgentDefinitionEntity,
    taskContext: Record<string, unknown>,
    userInput: Record<string, unknown>,
  ): Record<string, unknown> {
    const inputSchema = agent.inputSchema as Record<string, unknown>;
    const requiredFields = (inputSchema.required as string[]) ?? [];
    const properties = (inputSchema.properties as Record<string, unknown>) ?? {};

    const merged: Record<string, unknown> = { ...taskContext, ...userInput };

    for (const field of requiredFields) {
      if (!(field in merged) && field in properties) {
        const defaultValue = (properties[field] as Record<string, unknown>).default;
        if (defaultValue !== undefined) {
          merged[field] = defaultValue;
        }
      }
    }

    return merged;
  }

  validateOutput(
    agent: AgentDefinitionEntity,
    output: Record<string, unknown>,
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!agent.outputSchema) {
      return { valid: true, errors: [] };
    }

    const outputSchema = agent.outputSchema as Record<string, unknown>;
    const requiredFields = (outputSchema.required as string[]) ?? [];
    const properties = (outputSchema.properties as Record<string, unknown>) ?? {};

    for (const field of requiredFields) {
      if (!(field in output)) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    for (const [field, value] of Object.entries(output)) {
      const schema = properties[field] as Record<string, unknown>;
      if (schema && 'type' in schema) {
        const expectedType = schema.type as string;
        const actualType = typeof value;

        if (expectedType === 'string' && actualType !== 'string') {
          errors.push(`Field '${field}' expected string, got ${actualType}`);
        } else if (expectedType === 'number' && actualType !== 'number') {
          errors.push(`Field '${field}' expected number, got ${actualType}`);
        } else if (expectedType === 'boolean' && actualType !== 'boolean') {
          errors.push(`Field '${field}' expected boolean, got ${actualType}`);
        } else if (expectedType === 'array' && !Array.isArray(value)) {
          errors.push(`Field '${field}' expected array, got ${actualType}`);
        } else if (expectedType === 'object' && (actualType !== 'object' || Array.isArray(value))) {
          errors.push(`Field '${field}' expected object, got ${actualType}`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }
}
