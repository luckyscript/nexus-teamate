import { AgentDomainService } from '../../../src/modules/agent/domain/agent-domain.service';

describe('AgentDomainService', () => {
  let service: AgentDomainService;

  beforeEach(() => {
    service = new AgentDomainService();
  });

  describe('validateDefinition', () => {
    it('should pass with valid definition', () => {
      expect(() => {
        service.validateDefinition({
          agentKey: 'team:test_agent',
          promptTemplate: 'You are a test agent',
          inputSchema: { type: 'object', properties: {} },
          modelConfig: { provider: 'openai', model: 'gpt-4' },
          timeoutSeconds: 60,
        } as any);
      }).not.toThrow();
    });

    it('should fail with invalid agentKey format', () => {
      expect(() => {
        service.validateDefinition({
          agentKey: 'invalid_key',
          promptTemplate: 'test',
          inputSchema: { type: 'object' },
          modelConfig: { provider: 'openai', model: 'gpt-4' },
          timeoutSeconds: 60,
        } as any);
      }).toThrow(/Invalid agentKey format/);
    });

    it('should fail with empty promptTemplate', () => {
      expect(() => {
        service.validateDefinition({
          agentKey: 'system:test',
          promptTemplate: '',
          inputSchema: { type: 'object' },
          modelConfig: { provider: 'openai', model: 'gpt-4' },
          timeoutSeconds: 60,
        } as any);
      }).toThrow(/promptTemplate must not be empty/);
    });

    it('should fail with missing modelConfig fields', () => {
      expect(() => {
        service.validateDefinition({
          agentKey: 'system:test',
          promptTemplate: 'test',
          inputSchema: { type: 'object' },
          modelConfig: {},
          timeoutSeconds: 60,
        } as any);
      }).toThrow(/modelConfig\.provider is required|modelConfig\.model is required/);
    });

    it('should fail with invalid timeoutSeconds', () => {
      expect(() => {
        service.validateDefinition({
          agentKey: 'system:test',
          promptTemplate: 'test',
          inputSchema: { type: 'object' },
          modelConfig: { provider: 'openai', model: 'gpt-4' },
          timeoutSeconds: 0,
        } as any);
      }).toThrow(/timeoutSeconds must be greater than 0/);
    });
  });
});
