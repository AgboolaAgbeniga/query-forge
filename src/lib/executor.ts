/**
 * In-memory query executor.
 * Takes a query tree and filters a dataset, supporting all operators.
 */

import { QueryState, Rule, Group, Schema, RuleOperator } from './types';
import { MockRecord } from './mock-data';

type RecordValue = string | number | boolean | null | undefined;

/**
 * Execute a query tree against a dataset.
 * Returns matching records.
 */
export function executeQuery(
  state: QueryState,
  schema: Schema,
  data: MockRecord[]
): { results: MockRecord[]; executionTimeMs: number } {
  const start = performance.now();

  const results = data.filter((record) =>
    evaluateGroup(state, schema, state.rootGroupId, record)
  );

  const executionTimeMs = performance.now() - start;
  return { results, executionTimeMs: Math.round(executionTimeMs * 100) / 100 };
}

function evaluateGroup(
  state: QueryState,
  schema: Schema,
  groupId: string,
  record: MockRecord
): boolean {
  const group = state.groups[groupId];
  if (!group || group.children.length === 0) return true; // Empty groups match all

  const evaluations = group.children.map((childId) => {
    if (state.groups[childId]) {
      return evaluateGroup(state, schema, childId, record);
    }
    const rule = state.rules[childId];
    if (!rule) return true;
    return evaluateRule(rule, schema, record);
  });

  if (group.type === 'AND') {
    return evaluations.every(Boolean);
  } else {
    return evaluations.some(Boolean);
  }
}

function evaluateRule(
  rule: Rule,
  schema: Schema,
  record: MockRecord
): boolean {
  const fieldSchema = schema[rule.field];
  if (!fieldSchema) return true;

  const recordValue = (record as Record<string, RecordValue>)[rule.field];

  // Null checks
  if (rule.operator === 'isNull') {
    return recordValue === null || recordValue === undefined || recordValue === '';
  }
  if (rule.operator === 'isNotNull') {
    return recordValue !== null && recordValue !== undefined && recordValue !== '';
  }

  // Skip evaluation if value is empty (incomplete rule)
  if (rule.value === undefined || rule.value === '') return true;

  const ruleValue = coerceValue(rule.value, fieldSchema.type);
  const coercedRecordValue = coerceRecordValue(recordValue, fieldSchema.type);

  switch (rule.operator) {
    case 'equals':
      return coercedRecordValue === ruleValue;

    case 'notEquals':
      return coercedRecordValue !== ruleValue;

    case 'contains':
      return String(coercedRecordValue ?? '')
        .toLowerCase()
        .includes(String(ruleValue).toLowerCase());

    case 'startsWith':
      return String(coercedRecordValue ?? '')
        .toLowerCase()
        .startsWith(String(ruleValue).toLowerCase());

    case 'greaterThan':
      if (fieldSchema.type === 'date') {
        return new Date(String(coercedRecordValue)) > new Date(String(ruleValue));
      }
      return Number(coercedRecordValue) > Number(ruleValue);

    case 'lessThan':
      if (fieldSchema.type === 'date') {
        return new Date(String(coercedRecordValue)) < new Date(String(ruleValue));
      }
      return Number(coercedRecordValue) < Number(ruleValue);

    case 'between': {
      const ruleValue2 = coerceValue(rule.value2, fieldSchema.type);
      if (ruleValue2 === undefined || ruleValue2 === '') return true;

      if (fieldSchema.type === 'date') {
        const d = new Date(String(coercedRecordValue));
        return d >= new Date(String(ruleValue)) && d <= new Date(String(ruleValue2));
      }
      const n = Number(coercedRecordValue);
      return n >= Number(ruleValue) && n <= Number(ruleValue2);
    }

    case 'inList': {
      const list = String(ruleValue)
        .split(',')
        .map((v) => v.trim().toLowerCase());
      return list.includes(String(coercedRecordValue ?? '').toLowerCase());
    }

    default:
      return true;
  }
}

function coerceValue(value: unknown, type: string): RecordValue {
  if (value === undefined || value === null || value === '') return '';
  switch (type) {
    case 'number':
      return Number(value);
    case 'boolean':
      return value === true || value === 'true';
    default:
      return String(value);
  }
}

function coerceRecordValue(value: RecordValue, type: string): RecordValue {
  if (value === undefined || value === null) return value;
  switch (type) {
    case 'number':
      return Number(value);
    case 'boolean':
      return Boolean(value);
    default:
      return String(value);
  }
}
