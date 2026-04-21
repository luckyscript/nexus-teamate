import { Provide, Inject } from '@midwayjs/core';
import { AgentRepository } from '../../repository/agent.repository';
import { AgentDefinitionEntity } from '../../entity/agent-definition.entity';

export interface GuardrailValidationResult {
  valid: boolean;
  errors: string[];
}

@Provide()
export class Guardrail {
  @Inject()
  agentRepository: AgentRepository;

  validateInput(
    agent: AgentDefinitionEntity,
    input: Record<string, unknown>,
  ): GuardrailValidationResult {
    const errors: string[] = [];
    const inputSchema = agent.inputSchema as Record<string, unknown>;
    const required = (inputSchema.required as string[]) ?? [];
    const properties = (inputSchema.properties as Record<string, unknown>) ?? {};

    for (const field of required) {
      if (!(field in input)) {
        errors.push(`Missing required input field: ${field}`);
      }
    }

    for (const [field, value] of Object.entries(input)) {
      const schema = properties[field] as Record<string, unknown>;
      if (schema && 'type' in schema) {
        const expectedType = schema.type as string;
        const actualType = typeof value;

        if (expectedType === 'string' && actualType !== 'string') {
          errors.push(`Input field '${field}' expected string, got ${actualType}`);
        } else if (expectedType === 'number' && actualType !== 'number') {
          errors.push(`Input field '${field}' expected number, got ${actualType}`);
        } else if (expectedType === 'boolean' && actualType !== 'boolean') {
          errors.push(`Input field '${field}' expected boolean, got ${actualType}`);
        } else if (expectedType === 'array' && !Array.isArray(value)) {
          errors.push(`Input field '${field}' expected array, got ${actualType}`);
        } else if (expectedType === 'object' && (actualType !== 'object' || Array.isArray(value))) {
          errors.push(`Input field '${field}' expected object, got ${actualType}`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  validateOutput(
    agent: AgentDefinitionEntity | null,
    output: Record<string, unknown>,
  ): GuardrailValidationResult {
    if (!agent || !agent.outputSchema) {
      return { valid: true, errors: [] };
    }

    const errors: string[] = [];
    const outputSchema = agent.outputSchema as Record<string, unknown>;
    const required = (outputSchema.required as string[]) ?? [];
    const properties = (outputSchema.properties as Record<string, unknown>) ?? {};

    for (const field of required) {
      if (!(field in output)) {
        errors.push(`Missing required output field: ${field}`);
      }
    }

    for (const [field, value] of Object.entries(output)) {
      const schema = properties[field] as Record<string, unknown>;
      if (schema && 'type' in schema) {
        const expectedType = schema.type as string;
        const actualType = typeof value;

        if (expectedType === 'string' && actualType !== 'string') {
          errors.push(`Output field '${field}' expected string, got ${actualType}`);
        } else if (expectedType === 'number' && actualType !== 'number') {
          errors.push(`Output field '${field}' expected number, got ${actualType}`);
        } else if (expectedType === 'boolean' && actualType !== 'boolean') {
          errors.push(`Output field '${field}' expected boolean, got ${actualType}`);
        } else if (expectedType === 'array' && !Array.isArray(value)) {
          errors.push(`Output field '${field}' expected array, got ${actualType}`);
        } else if (expectedType === 'object' && (actualType !== 'object' || Array.isArray(value))) {
          errors.push(`Output field '${field}' expected object, got ${actualType}`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  checkToolPolicy(agent: AgentDefinitionEntity, toolName: string): boolean {
    if (!agent.toolPolicy) {
      return false;
    }

    const toolPolicy = agent.toolPolicy as { tools?: string[] };
    if (!toolPolicy.tools || toolPolicy.tools.length === 0) {
      return false;
    }

    return toolPolicy.tools.includes(toolName);
  }
}
