import { Provide } from '@midwayjs/core';

export interface ModelCallResult {
  output: Record<string, unknown> | string;
  toolCalls?: Array<{ name: string; input: Record<string, unknown> }>;
  tokensIn: number;
  tokensOut: number;
  costAmount: number;
}

@Provide()
export class ModelGateway {
  async call(
    config: Record<string, unknown>,
    prompt: string,
    input: Record<string, unknown>,
  ): Promise<ModelCallResult> {
    const provider = config.provider as string;
    const model = config.model as string;
    const temperature = (config.temperature as number) ?? 0.7;
    const maxTokens = (config.maxTokens as number) ?? 2048;

    console.log(
      `[ModelGateway] Calling ${provider}/${model} with temperature=${temperature}, maxTokens=${maxTokens}`,
    );

    return {
      output: {
        message: '[MVP Stub] Model gateway response. Configure actual LLM provider integration.',
        provider,
        model,
      },
      toolCalls: [],
      tokensIn: 0,
      tokensOut: 0,
      costAmount: 0,
    };
  }
}
