import { AutomationDomainService } from '../../../src/modules/automation/domain/automation-domain.service';
import { ConditionGroupDto, ActionDto } from '../../../src/modules/automation/dto/automation.dto';

describe('AutomationDomainService', () => {
  let service: AutomationDomainService;

  beforeEach(() => {
    service = new AutomationDomainService();
  });

  describe('validateDsl', () => {
    it('should pass with valid condition and action', () => {
      const conditionDsl: ConditionGroupDto = {
        all: [
          { field: 'priority', op: 'in', value: ['P0', 'P1'] },
        ],
      };
      const actionDsl: ActionDto[] = [
        { type: 'transition_status', params: { toStatusCode: 'in_progress' } },
      ];
      const result = service.validateDsl(conditionDsl, actionDsl);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail with empty actionDsl', () => {
      const conditionDsl: ConditionGroupDto = {
        all: [{ field: 'priority', op: 'eq', value: 'P1' }],
      };
      const result = service.validateDsl(conditionDsl, []);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail with invalid action type', () => {
      const conditionDsl: ConditionGroupDto = {
        all: [{ field: 'priority', op: 'eq', value: 'P1' }],
      };
      const actionDsl: ActionDto[] = [
        { type: 'invalid_action' as any, params: {} },
      ];
      const result = service.validateDsl(conditionDsl, actionDsl);
      expect(result.valid).toBe(false);
    });

    it('should fail with missing required action params', () => {
      const conditionDsl: ConditionGroupDto = {
        all: [{ field: 'priority', op: 'eq', value: 'P1' }],
      };
      const actionDsl: ActionDto[] = [
        { type: 'bind_agent', params: {} },
      ];
      const result = service.validateDsl(conditionDsl, actionDsl);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('agentId'))).toBe(true);
    });
  });

  describe('evaluateConditions', () => {
    it('should evaluate all conditions (AND)', () => {
      const conditionDsl: ConditionGroupDto = {
        all: [
          { field: 'priority', op: 'in', value: ['P0', 'P1'] },
          { field: 'statusCode', op: 'eq', value: 'todo' },
        ],
      };
      const ctx = { priority: 'P1', statusCode: 'todo' };
      expect(service.evaluateConditions(conditionDsl, ctx)).toBe(true);
    });

    it('should fail all conditions when one fails (AND)', () => {
      const conditionDsl: ConditionGroupDto = {
        all: [
          { field: 'priority', op: 'in', value: ['P0', 'P1'] },
          { field: 'statusCode', op: 'eq', value: 'done' },
        ],
      };
      const ctx = { priority: 'P1', statusCode: 'todo' };
      expect(service.evaluateConditions(conditionDsl, ctx)).toBe(false);
    });

    it('should evaluate any conditions (OR)', () => {
      const conditionDsl: ConditionGroupDto = {
        any: [
          { field: 'priority', op: 'eq', value: 'P0' },
          { field: 'priority', op: 'eq', value: 'P1' },
        ],
      };
      const ctx = { priority: 'P1' };
      expect(service.evaluateConditions(conditionDsl, ctx)).toBe(true);
    });

    it('should handle nested field access', () => {
      const conditionDsl: ConditionGroupDto = {
        all: [
          { field: 'customFields.specReady', op: 'eq', value: true },
        ],
      };
      const ctx = { customFields: { specReady: true } };
      expect(service.evaluateConditions(conditionDsl, ctx)).toBe(true);
    });

    it('should handle gt and lt operators', () => {
      const conditionDsl: ConditionGroupDto = {
        all: [
          { field: 'count', op: 'gt', value: 10 },
          { field: 'count', op: 'lt', value: 100 },
        ],
      };
      const ctx = { count: 50 };
      expect(service.evaluateConditions(conditionDsl, ctx)).toBe(true);
    });

    it('should handle contains operator', () => {
      const conditionDsl: ConditionGroupDto = {
        all: [
          { field: 'title', op: 'contains', value: 'bug' },
        ],
      };
      const ctx = { title: 'Fix critical bug in auth' };
      expect(service.evaluateConditions(conditionDsl, ctx)).toBe(true);
    });

    it('should handle exists operator', () => {
      const conditionDsl: ConditionGroupDto = {
        all: [
          { field: 'assigneeId', op: 'exists', value: true },
        ],
      };
      expect(service.evaluateConditions(conditionDsl, { assigneeId: 1 })).toBe(true);
      expect(service.evaluateConditions(conditionDsl, { assigneeId: null })).toBe(false);
      expect(service.evaluateConditions(conditionDsl, {})).toBe(false);
    });

    it('should return false for empty/null DSL', () => {
      expect(service.evaluateConditions(null as any, {})).toBe(false);
      expect(service.evaluateConditions(undefined as any, {})).toBe(false);
    });

    it('should handle not_in operator', () => {
      const conditionDsl: ConditionGroupDto = {
        all: [
          { field: 'status', op: 'not_in', value: ['discarded', 'done'] },
        ],
      };
      expect(service.evaluateConditions(conditionDsl, { status: 'todo' })).toBe(true);
      expect(service.evaluateConditions(conditionDsl, { status: 'done' })).toBe(false);
    });

    it('should handle neq operator', () => {
      const conditionDsl: ConditionGroupDto = {
        all: [
          { field: 'status', op: 'neq', value: 'discarded' },
        ],
      };
      expect(service.evaluateConditions(conditionDsl, { status: 'todo' })).toBe(true);
      expect(service.evaluateConditions(conditionDsl, { status: 'discarded' })).toBe(false);
    });
  });

  describe('resolveActions', () => {
    it('should substitute context values in action params', () => {
      const actionDsl: ActionDto[] = [
        { type: 'transition_status', params: { toStatusCode: '{{statusCode}}' } },
      ];
      const ctx = { statusCode: 'in_progress' };
      const resolved = service.resolveActions(actionDsl, ctx);
      expect(resolved[0].params.toStatusCode).toBe('in_progress');
    });

    it('should pass through non-template values', () => {
      const actionDsl: ActionDto[] = [
        { type: 'notify', params: { message: 'Hello' } },
      ];
      const resolved = service.resolveActions(actionDsl, {});
      expect(resolved[0].params.message).toBe('Hello');
    });
  });

  describe('checkMutualExclusion', () => {
    it('should return empty when no mutual exclusion keys', () => {
      const rules = [
        { mutualExclusionKey: null, id: 1 },
        { mutualExclusionKey: null, id: 2 },
      ];
      const conflicts = service.checkMutualExclusion(rules, {});
      expect(conflicts.conflicting).toBe(false);
      expect(conflicts.conflictKey).toBeNull();
    });

    it('should detect duplicate mutual exclusion keys', () => {
      const rules = [
        { mutualExclusionKey: 'exclusive_group_a', id: 1 },
        { mutualExclusionKey: 'exclusive_group_a', id: 2 },
      ];
      const conflicts = service.checkMutualExclusion(rules, {});
      expect(conflicts.conflicting).toBe(true);
      expect(conflicts.conflictKey).toBe('exclusive_group_a');
    });
  });
});
