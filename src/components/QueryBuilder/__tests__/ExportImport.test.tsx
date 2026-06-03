import { describe, it, expect } from 'vitest';
import { validateQueryJSON } from '../ExportImport';

describe('validateQueryJSON', () => {
  it('should invalidate non-objects', () => {
    expect(validateQueryJSON(null).valid).toBe(false);
    expect(validateQueryJSON('string').valid).toBe(false);
    expect(validateQueryJSON(123).valid).toBe(false);
  });

  it('should invalidate missing root fields', () => {
    expect(validateQueryJSON({}).valid).toBe(false);
    expect(validateQueryJSON({ rootGroupId: 'root' }).valid).toBe(false);
    expect(validateQueryJSON({ rootGroupId: 'root', groups: {} }).valid).toBe(false);
  });

  it('should invalidate mismatched IDs', () => {
    const data = {
      rootGroupId: 'root',
      groups: {
        root: { id: 'wrong_id', type: 'AND', children: [] }
      },
      rules: {}
    };
    expect(validateQueryJSON(data).valid).toBe(false);
  });

  it('should invalidate unknown child references', () => {
    const data = {
      rootGroupId: 'root',
      groups: {
        root: { id: 'root', type: 'AND', children: ['unknown_rule'] }
      },
      rules: {}
    };
    const res = validateQueryJSON(data);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('references unknown child');
  });

  it('should detect circular references', () => {
    const data = {
      rootGroupId: 'root',
      groups: {
        root: { id: 'root', type: 'AND', children: ['group1'] },
        group1: { id: 'group1', type: 'OR', children: ['root'] }
      },
      rules: {}
    };
    const res = validateQueryJSON(data);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('Circular reference');
  });

  it('should validate valid query state', () => {
    const data = {
      rootGroupId: 'root',
      groups: {
        root: { id: 'root', type: 'AND', children: ['rule1'] }
      },
      rules: {
        rule1: { id: 'rule1', field: 'name', operator: 'equals', value: 'John' }
      }
    };
    const res = validateQueryJSON(data);
    expect(res.valid).toBe(true);
    expect(res.state).toEqual(data);
  });
});
