import { describe, it, expect } from 'vitest';
import { validateRule, validateQueryTree } from '../engine';
import { Schema, Rule, QueryState } from '../types';

const testSchema: Schema = {
  name: { name: 'name', label: 'Name', type: 'string' },
  age: { name: 'age', label: 'Age', type: 'number' },
  status: { name: 'status', label: 'Status', type: 'enum', options: ['active', 'inactive'] },
  createdAt: { name: 'createdAt', label: 'Created At', type: 'date' },
  isVerified: { name: 'isVerified', label: 'Verified', type: 'boolean' },
};

describe('Query Validation Engine', () => {
  describe('validateRule', () => {
    it('should validate missing values when required', () => {
      const rule: Rule = { id: 'r1', field: 'name', operator: 'equals', value: '' };
      expect(validateRule(rule, testSchema)).toBe('Value is required.');

      const nullRule: Rule = { id: 'r2', field: 'name', operator: 'isNull', value: '' };
      expect(validateRule(nullRule, testSchema)).toBeNull();
    });

    it('should validate between operator require value2', () => {
      const rule: Rule = { id: 'r1', field: 'age', operator: 'between', value: 10 };
      expect(validateRule(rule, testSchema)).toBe('Second value is required for "between" operator.');
    });

    it('should validate date range logic for between', () => {
      const ruleGood: Rule = {
        id: 'r1',
        field: 'createdAt',
        operator: 'between',
        value: '2025-01-01',
        value2: '2025-01-10',
      };
      expect(validateRule(ruleGood, testSchema)).toBeNull();

      const ruleBad: Rule = {
        id: 'r2',
        field: 'createdAt',
        operator: 'between',
        value: '2025-01-10',
        value2: '2025-01-01',
      };
      expect(validateRule(ruleBad, testSchema)).toBe('End date must be after start date.');
    });

    it('should validate number range logic for between', () => {
      const ruleGood: Rule = { id: 'r1', field: 'age', operator: 'between', value: 18, value2: 30 };
      expect(validateRule(ruleGood, testSchema)).toBeNull();

      const ruleBad: Rule = { id: 'r2', field: 'age', operator: 'between', value: 30, value2: 18 };
      expect(validateRule(ruleBad, testSchema)).toBe('End value must be greater than or equal to start value.');
    });

    it('should block string operators on numeric fields', () => {
      const rule: Rule = { id: 'r1', field: 'age', operator: 'contains', value: '1' };
      expect(validateRule(rule, testSchema)).toContain('not valid for number fields');
    });

    it('should block non-equals operators on boolean fields', () => {
      const rule: Rule = { id: 'r1', field: 'isVerified', operator: 'greaterThan', value: true };
      expect(validateRule(rule, testSchema)).toContain('not valid for boolean fields');
    });
  });

  describe('validateQueryTree', () => {
    it('should detect empty nested groups', () => {
      const state: QueryState = {
        rootGroupId: 'root',
        groups: {
          root: { id: 'root', type: 'AND', children: ['g1'], parentId: null },
          g1: { id: 'g1', type: 'OR', children: [], parentId: 'root' },
        },
        rules: {},
      };

      const errors = validateQueryTree(state, testSchema);
      expect(errors.length).toBe(1);
      expect(errors[0].message).toContain('Empty group');
      expect(errors[0].nodeId).toBe('g1');
    });

    it('should collect rule-specific validation errors', () => {
      const state: QueryState = {
        rootGroupId: 'root',
        groups: {
          root: { id: 'root', type: 'AND', children: ['r1'], parentId: null },
        },
        rules: {
          r1: { id: 'r1', field: 'age', operator: 'contains', value: 12 },
        },
      };

      const errors = validateQueryTree(state, testSchema);
      expect(errors.length).toBe(1);
      expect(errors[0].nodeId).toBe('r1');
      expect(errors[0].message).toContain('not valid for number fields');
    });
  });
});
