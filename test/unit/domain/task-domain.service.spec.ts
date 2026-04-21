import { TaskDomainService, TransitionCommand } from '../../../src/modules/task/domain/task-domain.service';

describe('TaskDomainService', () => {
  let service: TaskDomainService;

  beforeEach(() => {
    service = new TaskDomainService();
  });

  describe('canTransition', () => {
    const transitions = [
      { from: 'todo', to: 'in_progress' },
      { from: 'in_progress', to: 'reviewing' },
      { from: 'reviewing', to: 'done' },
      { from: 'reviewing', to: 'discarded' },
      { from: 'done', to: 'in_progress' },
    ];

    it('should allow valid transitions', () => {
      expect(service.canTransition('todo', 'in_progress', transitions)).toBe(true);
      expect(service.canTransition('in_progress', 'reviewing', transitions)).toBe(true);
      expect(service.canTransition('reviewing', 'done', transitions)).toBe(true);
    });

    it('should reject invalid transitions', () => {
      expect(service.canTransition('todo', 'done', transitions)).toBe(false);
      expect(service.canTransition('in_progress', 'done', transitions)).toBe(false);
      expect(service.canTransition('discarded', 'reviewing', transitions)).toBe(false);
    });
  });

  describe('validateTransition', () => {
    const transitions = [
      { from: 'todo', to: 'in_progress' },
      { from: 'in_progress', to: 'reviewing' },
      { from: 'reviewing', to: 'done' },
    ];

    it('should pass when version matches and transition is allowed', () => {
      const command: TransitionCommand = {
        taskId: 1,
        fromStatusCode: 'todo',
        toStatusCode: 'in_progress',
        version: 3,
        currentVersion: 3,
        transitions,
      };
      const result = service.validateTransition(command);
      expect(result.valid).toBe(true);
    });

    it('should fail when version mismatches', () => {
      const command: TransitionCommand = {
        taskId: 1,
        fromStatusCode: 'todo',
        toStatusCode: 'in_progress',
        version: 3,
        currentVersion: 5,
        transitions,
      };
      const result = service.validateTransition(command);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Version mismatch');
    });

    it('should fail when transition is not allowed', () => {
      const command: TransitionCommand = {
        taskId: 1,
        fromStatusCode: 'todo',
        toStatusCode: 'done',
        version: 1,
        currentVersion: 1,
        transitions,
      };
      const result = service.validateTransition(command);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    it('should fail when transitioning to same status', () => {
      const command: TransitionCommand = {
        taskId: 1,
        fromStatusCode: 'todo',
        toStatusCode: 'todo',
        version: 1,
        currentVersion: 1,
        transitions,
      };
      const result = service.validateTransition(command);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('same status');
    });
  });

  describe('validateCreate', () => {
    it('should pass with valid input', () => {
      const result = service.validateCreate({
        title: 'Test task',
        priority: 'P1',
        sourceType: 'manual',
      });
      expect(result.valid).toBe(true);
    });

    it('should fail when title is empty', () => {
      const result = service.validateCreate({
        title: '',
        priority: 'P1',
        sourceType: 'manual',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('title is required');
    });

    it('should fail with invalid priority', () => {
      const result = service.validateCreate({
        title: 'Test task',
        priority: 'P5',
        sourceType: 'manual',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('priority must be one of P0, P1, P2, P3');
    });

    it('should fail with invalid sourceType', () => {
      const result = service.validateCreate({
        title: 'Test task',
        priority: 'P1',
        sourceType: 'invalid',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('sourceType must be one of manual, webhook, api, connector');
    });

    it('should fail with invalid dueAt', () => {
      const result = service.validateCreate({
        title: 'Test task',
        priority: 'P1',
        sourceType: 'manual',
        dueAt: 'not-a-date',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('dueAt must be a valid ISO date string');
    });
  });

  describe('resolveAvailableActions', () => {
    const transitions = [
      { from: 'todo', to: 'in_progress' },
      { from: 'in_progress', to: 'reviewing' },
    ];

    it('should return transition actions', () => {
      const task = { statusCode: 'todo' } as any;
      const actions = service.resolveAvailableActions(task, transitions, 'none', 'none');
      expect(actions.some(a => a.action === 'transition:in_progress')).toBe(true);
    });

    it('should return ai:start when aiState is none', () => {
      const task = { statusCode: 'todo' } as any;
      const actions = service.resolveAvailableActions(task, transitions, 'none', 'none');
      expect(actions.some(a => a.action === 'ai:start')).toBe(true);
    });

    it('should return takeover when takeoverState is none', () => {
      const task = { statusCode: 'todo' } as any;
      const actions = service.resolveAvailableActions(task, transitions, 'none', 'none');
      expect(actions.some(a => a.action === 'takeover')).toBe(true);
    });

    it('should return release and terminate when takeoverState is active', () => {
      const task = { statusCode: 'todo' } as any;
      const actions = service.resolveAvailableActions(task, transitions, 'none', 'active');
      expect(actions.some(a => a.action === 'release')).toBe(true);
      expect(actions.some(a => a.action === 'terminate')).toBe(true);
    });
  });
});
