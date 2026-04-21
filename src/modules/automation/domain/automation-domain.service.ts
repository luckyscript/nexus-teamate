import { Provide } from '@midwayjs/core';
import {
  ConditionClauseDto,
  ConditionGroupDto,
  ActionDto,
  ConditionOperator,
  ValidConditionFields,
  ActionType,
} from '../dto/automation.dto';

const REQUIRED_ACTION_PARAMS: Record<string, string[]> = {
  bind_agent: ['agentId'],
  transition_status: ['toStatusCode'],
  notify: ['userId', 'message'],
  assign: ['userId'],
  create_subtask: ['title'],
  write_asset: ['assetType', 'content'],
};

@Provide()
export class AutomationDomainService {
  validateDsl(
    conditionDsl: ConditionGroupDto,
    actionDsl: ActionDto[]
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    this.validateConditionGroup(conditionDsl, errors);

    if (!actionDsl || actionDsl.length === 0) {
      errors.push('actionDsl must contain at least one action');
    } else {
      for (let i = 0; i < actionDsl.length; i++) {
        this.validateAction(actionDsl[i], i, errors);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  evaluateConditions(
    conditionDsl: ConditionGroupDto,
    taskContext: Record<string, unknown>
  ): boolean {
    if (!conditionDsl) {
      return false;
    }

    if (conditionDsl.all && conditionDsl.all.length > 0) {
      return conditionDsl.all.every((clause) =>
        this.evaluateClause(clause, taskContext)
      );
    }

    if (conditionDsl.any && conditionDsl.any.length > 0) {
      return conditionDsl.any.some((clause) =>
        this.evaluateClause(clause, taskContext)
      );
    }

    return false;
  }

  resolveActions(
    actionDsl: ActionDto[],
    context: Record<string, unknown>
  ): ActionDto[] {
    return actionDsl.map((action) => {
      if (!action.params) {
        return action;
      }

      const resolvedParams = this.substituteContext(action.params, context);
      return { ...action, params: resolvedParams };
    });
  }

  checkMutualExclusion(
    rules: Array<{ mutualExclusionKey: string | null; id: number }>,
    taskContext: Record<string, unknown>
  ): { conflicting: boolean; conflictKey: string | null } {
    const activeKeys = new Map<string, number[]>();

    for (const rule of rules) {
      if (!rule.mutualExclusionKey) {
        continue;
      }

      if (!activeKeys.has(rule.mutualExclusionKey)) {
        activeKeys.set(rule.mutualExclusionKey, []);
      }
      activeKeys.get(rule.mutualExclusionKey)!.push(rule.id);
    }

    for (const [key, ruleIds] of activeKeys) {
      if (ruleIds.length > 1) {
        return { conflicting: true, conflictKey: key };
      }
    }

    return { conflicting: false, conflictKey: null };
  }

  private validateConditionGroup(
    group: ConditionGroupDto,
    errors: string[],
    path = ''
  ): void {
    const hasAll = group.all && group.all.length > 0;
    const hasAny = group.any && group.any.length > 0;

    if (!hasAll && !hasAny) {
      errors.push(`${path || 'conditionDsl'}: must have 'all' or 'any' group`);
      return;
    }

    if (hasAll && hasAny) {
      errors.push(
        `${path || 'conditionDsl'}: cannot have both 'all' and 'any' at the same level`
      );
      return;
    }

    const items = hasAll ? group.all! : group.any!;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemPath = path ? `${path}.${hasAll ? 'all' : 'any'}[${i}]` : `${hasAll ? 'all' : 'any'}[${i}]`;

      if (this.isConditionGroup(item)) {
        this.validateConditionGroup(item, errors, itemPath);
      } else {
        this.validateConditionClause(item as ConditionClauseDto, errors, itemPath);
      }
    }
  }

  private isConditionGroup(
    item: ConditionClauseDto | ConditionGroupDto
  ): item is ConditionGroupDto {
    return 'all' in item || 'any' in item;
  }

  private validateConditionClause(
    clause: ConditionClauseDto,
    errors: string[],
    path: string
  ): void {
    if (!clause.field) {
      errors.push(`${path}: 'field' is required`);
      return;
    }

    if (!clause.op) {
      errors.push(`${path}: 'op' is required`);
      return;
    }

    const rootField = clause.field.split('.')[0];
    if (!ValidConditionFields.includes(rootField as typeof ValidConditionFields[number])) {
      errors.push(
        `${path}: invalid field '${clause.field}'. Valid fields: ${ValidConditionFields.join(', ')}`
      );
    }

    if (!ConditionOperator.includes(clause.op)) {
      errors.push(
        `${path}: invalid operator '${clause.op}'. Valid operators: ${ConditionOperator.join(', ')}`
      );
    }

    if (clause.op === 'exists') {
      return;
    }

    if (clause.value === undefined || clause.value === null) {
      errors.push(`${path}: 'value' is required for operator '${clause.op}'`);
      return;
    }

    if (clause.op === 'in' || clause.op === 'not_in') {
      if (!Array.isArray(clause.value)) {
        errors.push(`${path}: 'value' must be an array for operator '${clause.op}'`);
      }
    }

    if (
      (clause.op === 'gt' || clause.op === 'lt') &&
      typeof clause.value !== 'number'
    ) {
      errors.push(
        `${path}: 'value' must be a number for operator '${clause.op}'`
      );
    }

    if (
      clause.op === 'contains' &&
      typeof clause.value !== 'string'
    ) {
      errors.push(
        `${path}: 'value' must be a string for operator '${clause.op}'`
      );
    }
  }

  private validateAction(action: ActionDto, index: number, errors: string[]): void {
    if (!ActionType.includes(action.type)) {
      errors.push(
        `actionDsl[${index}]: invalid type '${action.type}'. Valid types: ${ActionType.join(', ')}`
      );
      return;
    }

    const required = REQUIRED_ACTION_PARAMS[action.type] || [];
    for (const param of required) {
      if (!action.params || action.params[param] === undefined || action.params[param] === null) {
        errors.push(
          `actionDsl[${index}]: action '${action.type}' requires param '${param}'`
        );
      }
    }
  }

  private evaluateClause(
    clause: ConditionClauseDto | ConditionGroupDto,
    taskContext: Record<string, unknown>
  ): boolean {
    if (this.isConditionGroup(clause)) {
      if (clause.all) {
        return clause.all.every((c) => this.evaluateClause(c, taskContext));
      }
      if (clause.any) {
        return clause.any.some((c) => this.evaluateClause(c, taskContext));
      }
      return false;
    }

    const fieldPath = (clause as ConditionClauseDto).field;
    const op = (clause as ConditionClauseDto).op;
    const expected = (clause as ConditionClauseDto).value;

    const actual = this.resolveField(fieldPath, taskContext);

    switch (op) {
      case 'eq':
        return this.compareEq(actual, expected);
      case 'neq':
        return this.compareNeq(actual, expected);
      case 'in':
        return this.compareIn(actual, expected as unknown[]);
      case 'not_in':
        return this.compareNotIn(actual, expected as unknown[]);
      case 'gt':
        return this.compareGt(actual, expected as number);
      case 'lt':
        return this.compareLt(actual, expected as number);
      case 'contains':
        return this.compareContains(actual, expected as string);
      case 'exists':
        return this.compareExists(actual);
      default:
        return false;
    }
  }

  private resolveField(
    path: string,
    context: Record<string, unknown>
  ): unknown {
    const parts = path.split('.');
    let current: unknown = context;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      if (typeof current !== 'object') {
        return undefined;
      }
      current = (current as Record<string, unknown>)[part];
    }

    return current;
  }

  private compareEq(actual: unknown, expected: unknown): boolean {
    if (actual === undefined || actual === null) {
      return expected === null || expected === undefined;
    }
    if (Array.isArray(actual) && Array.isArray(expected)) {
      return actual.length === expected.length && actual.every((v, i) => v === expected[i]);
    }
    return actual === expected;
  }

  private compareNeq(actual: unknown, expected: unknown): boolean {
    return !this.compareEq(actual, expected);
  }

  private compareIn(actual: unknown, expected: unknown[]): boolean {
    if (actual === undefined || actual === null) {
      return false;
    }
    return expected.some((v) => this.compareEq(actual, v));
  }

  private compareNotIn(actual: unknown, expected: unknown[]): boolean {
    return !this.compareIn(actual, expected);
  }

  private compareGt(actual: unknown, expected: number): boolean {
    if (actual === undefined || actual === null || typeof actual !== 'number') {
      return false;
    }
    return actual > expected;
  }

  private compareLt(actual: unknown, expected: number): boolean {
    if (actual === undefined || actual === null || typeof actual !== 'number') {
      return false;
    }
    return actual < expected;
  }

  private compareContains(actual: unknown, expected: string): boolean {
    if (actual === undefined || actual === null) {
      return false;
    }
    if (typeof actual === 'string') {
      return actual.includes(expected);
    }
    if (Array.isArray(actual)) {
      return actual.some((item) => String(item) === expected);
    }
    return false;
  }

  private compareExists(actual: unknown): boolean {
    return actual !== undefined && actual !== null;
  }

  private substituteContext(
    params: Record<string, unknown>,
    context: Record<string, unknown>
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') {
        result[key] = this.interpolateString(value, context);
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = this.substituteContext(
          value as Record<string, unknown>,
          context
        );
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  private interpolateString(
    template: string,
    context: Record<string, unknown>
  ): string {
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_match, path) => {
      const value = this.resolveField(path, context);
      if (value === undefined || value === null) {
        return '';
      }
      return String(value);
    });
  }
}
