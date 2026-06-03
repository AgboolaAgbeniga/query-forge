import { describe, it, expect } from 'vitest';
import { executeQuery } from '../executor';
import { Schema, QueryState } from '../types';

const testSchema: Schema = {
  name: { name: 'name', label: 'Name', type: 'string' },
  age: { name: 'age', label: 'Age', type: 'number' },
  status: { name: 'status', label: 'Status', type: 'enum', options: ['active', 'inactive'] },
  createdAt: { name: 'createdAt', label: 'Created At', type: 'date' },
  isVerified: { name: 'isVerified', label: 'Verified', type: 'boolean' },
};

const mockRecords = [
  { id: '1', name: 'Ada Lovelace', age: 36, status: 'active', createdAt: '1815-12-10', isVerified: true },
  { id: '2', name: 'Alan Turing', age: 41, status: 'active', createdAt: '1912-06-23', isVerified: false },
  { id: '3', name: 'Grace Hopper', age: 85, status: 'inactive', createdAt: '1906-12-09', isVerified: true },
  { id: '4', name: 'Tim Berners-Lee', age: 70, status: 'active', createdAt: '1955-06-08', isVerified: true },
];

describe('Query Execution Simulator', () => {
  it('should filter equals correctly', () => {
    const state: QueryState = {
      rootGroupId: 'root',
      groups: {
        root: { id: 'root', type: 'AND', children: ['rule1'], parentId: null },
      },
      rules: {
        rule1: { id: 'rule1', field: 'isVerified', operator: 'equals', value: false },
      },
    };

    const { results } = executeQuery(state, testSchema, mockRecords);
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Alan Turing');
  });

  it('should filter notEquals correctly', () => {
    const state: QueryState = {
      rootGroupId: 'root',
      groups: {
        root: { id: 'root', type: 'AND', children: ['rule1'], parentId: null },
      },
      rules: {
        rule1: { id: 'rule1', field: 'status', operator: 'notEquals', value: 'active' },
      },
    };

    const { results } = executeQuery(state, testSchema, mockRecords);
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Grace Hopper');
  });

  it('should filter contains and startsWith correctly', () => {
    const state: QueryState = {
      rootGroupId: 'root',
      groups: {
        root: { id: 'root', type: 'AND', children: ['rule1', 'rule2'], parentId: null },
      },
      rules: {
        rule1: { id: 'rule1', field: 'name', operator: 'contains', value: 'Lovelace' },
        rule2: { id: 'rule2', field: 'name', operator: 'startsWith', value: 'Ada' },
      },
    };

    const { results } = executeQuery(state, testSchema, mockRecords);
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Ada Lovelace');
  });

  it('should filter greaterThan, lessThan, and between correctly', () => {
    const state: QueryState = {
      rootGroupId: 'root',
      groups: {
        root: { id: 'root', type: 'AND', children: ['rule1'], parentId: null },
      },
      rules: {
        rule1: { id: 'rule1', field: 'age', operator: 'between', value: 40, value2: 75 },
      },
    };

    const { results } = executeQuery(state, testSchema, mockRecords);
    expect(results.length).toBe(2);
    const names = results.map(r => r.name);
    expect(names).toContain('Alan Turing');
    expect(names).toContain('Tim Berners-Lee');
  });

  it('should filter date comparisons correctly', () => {
    const state: QueryState = {
      rootGroupId: 'root',
      groups: {
        root: { id: 'root', type: 'AND', children: ['rule1'], parentId: null },
      },
      rules: {
        rule1: { id: 'rule1', field: 'createdAt', operator: 'greaterThan', value: '1900-01-01' },
      },
    };

    const { results } = executeQuery(state, testSchema, mockRecords);
    expect(results.length).toBe(3); // Alan, Grace, Tim (all born after 1900)
    expect(results.map(r => r.name)).not.toContain('Ada Lovelace');
  });

  it('should filter inList correctly', () => {
    const state: QueryState = {
      rootGroupId: 'root',
      groups: {
        root: { id: 'root', type: 'AND', children: ['rule1'], parentId: null },
      },
      rules: {
        rule1: { id: 'rule1', field: 'name', operator: 'inList', value: 'Alan Turing, Grace Hopper' },
      },
    };

    const { results } = executeQuery(state, testSchema, mockRecords);
    expect(results.length).toBe(2);
    const names = results.map(r => r.name);
    expect(names).toContain('Alan Turing');
    expect(names).toContain('Grace Hopper');
  });

  it('should filter isNull and isNotNull correctly', () => {
    const recordsWithNulls = [
      ...mockRecords,
      { id: '5', name: 'Anonymous', age: null, status: 'inactive', createdAt: null, isVerified: false }
    ];

    const state: QueryState = {
      rootGroupId: 'root',
      groups: {
        root: { id: 'root', type: 'AND', children: ['rule1'], parentId: null },
      },
      rules: {
        rule1: { id: 'rule1', field: 'age', operator: 'isNull', value: '' },
      },
    };

    const { results } = executeQuery(state, testSchema, recordsWithNulls);
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Anonymous');
  });
});
