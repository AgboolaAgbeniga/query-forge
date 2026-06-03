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
      expect(validateRule(rule, testSchema)).toBe('A value is required for "Name". Please enter a value to complete the query condition.');

      const nullRule: Rule = { id: 'r2', field: 'name', operator: 'isNull', value: '' };
      expect(validateRule(nullRule, testSchema)).toBeNull();
    });

    it('should validate between operator require value2', () => {
      const rule: Rule = { id: 'r1', field: 'age', operator: 'between', value: 10 };
      expect(validateRule(rule, testSchema)).toBe('Both boundary values are required to filter "Age" within a range. Please enter the second value.');
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
      expect(validateRule(ruleBad, testSchema)).toBe('The end date for "Created At" must be after the start date. Please select a valid date range.');
    });

    it('should validate number range logic for between', () => {
      const ruleGood: Rule = { id: 'r1', field: 'age', operator: 'between', value: 18, value2: 30 };
      expect(validateRule(ruleGood, testSchema)).toBeNull();

      const ruleBad: Rule = { id: 'r2', field: 'age', operator: 'between', value: 30, value2: 18 };
      expect(validateRule(ruleBad, testSchema)).toBe('The end value for "Age" must be greater than or equal to the start value. Please enter a valid range.');
    });

    it('should block string operators on numeric fields', () => {
      const rule: Rule = { id: 'r1', field: 'age', operator: 'contains', value: '1' };
      expect(validateRule(rule, testSchema)).toContain('not valid for number fields');
    });

    it('should block non-equals operators on boolean fields', () => {
      const rule: Rule = { id: 'r1', field: 'isVerified', operator: 'greaterThan', value: true };
      expect(validateRule(rule, testSchema)).toContain('not valid for boolean fields');
    });

    it('should validate invalid date strings', () => {
      const rule: Rule = { id: 'r1', field: 'createdAt', operator: 'equals', value: 'invalid-date-string' };
      expect(validateRule(rule, testSchema)).toContain('must be a valid date');
    });

    it('should validate numeric list values for inList operator', () => {
      const ruleBad: Rule = { id: 'r1', field: 'age', operator: 'inList', value: '10, 20, non-number' };
      expect(validateRule(ruleBad, testSchema)).toContain('must be valid numbers');

      const ruleGood: Rule = { id: 'r2', field: 'age', operator: 'inList', value: '10, 20, 30' };
      expect(validateRule(ruleGood, testSchema)).toBeNull();
    });

    it('should validate enum option values', () => {
      const ruleBad: Rule = { id: 'r1', field: 'status', operator: 'equals', value: 'unknown-status' };
      expect(validateRule(ruleBad, testSchema)).toContain('must be one of the allowed options');

      const ruleBadList: Rule = { id: 'r2', field: 'status', operator: 'inList', value: 'active, unknown' };
      expect(validateRule(ruleBadList, testSchema)).toContain('Invalid option(s) for "Status" detected');
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
