import { describe, it, expect } from 'vitest';
import { generateSQL, generateMongo, generateGraphQL } from '../engine';
import { QueryState, Schema } from '../types';

const testSchema: Schema = {
  name: { name: 'name', label: 'Name', type: 'string' },
  age: { name: 'age', label: 'Age', type: 'number' },
  status: { name: 'status', label: 'Status', type: 'enum', options: ['active', 'inactive'] },
  createdAt: { name: 'createdAt', label: 'Created At', type: 'date' },
  isVerified: { name: 'isVerified', label: 'Verified', type: 'boolean' },
};

describe('Query Compiler Engine', () => {
  describe('SQL Generator', () => {
    it('should generate simple query with one rule', () => {
      const state: QueryState = {
        rootGroupId: 'root',
        groups: {
          root: { id: 'root', type: 'AND', children: ['rule1'], parentId: null },
        },
        rules: {
          rule1: { id: 'rule1', field: 'name', operator: 'equals', value: 'John' },
        },
      };

      const sql = generateSQL(state, testSchema);
      expect(sql).toBe("SELECT *\nFROM data\nWHERE name = 'John'");
    });

    it('should escape single quotes in SQL strings', () => {
      const state: QueryState = {
        rootGroupId: 'root',
        groups: {
          root: { id: 'root', type: 'AND', children: ['rule1'], parentId: null },
        },
        rules: {
          rule1: { id: 'rule1', field: 'name', operator: 'equals', value: "O'Connor" },
        },
      };

      const sql = generateSQL(state, testSchema);
      expect(sql).toContain("name = 'O''Connor'");
    });

    it('should handle nested logical groups (AND / OR)', () => {
      const state: QueryState = {
        rootGroupId: 'root',
        groups: {
          root: { id: 'root', type: 'AND', children: ['rule1', 'group1'], parentId: null },
          group1: { id: 'group1', type: 'OR', children: ['rule2', 'rule3'], parentId: 'root' },
        },
        rules: {
          rule1: { id: 'rule1', field: 'age', operator: 'greaterThan', value: 21 },
          rule2: { id: 'rule2', field: 'status', operator: 'equals', value: 'active' },
          rule3: { id: 'rule3', field: 'isVerified', operator: 'equals', value: true },
        },
      };

      const sql = generateSQL(state, testSchema);
      expect(sql).toBe("SELECT *\nFROM data\nWHERE age > 21 AND (status = 'active' OR isVerified = true)");
    });

    it('should generate between and inList operators correctly', () => {
      const state: QueryState = {
        rootGroupId: 'root',
        groups: {
          root: { id: 'root', type: 'AND', children: ['rule1', 'rule2'], parentId: null },
        },
        rules: {
          rule1: { id: 'rule1', field: 'age', operator: 'between', value: 18, value2: 30 },
          rule2: { id: 'rule2', field: 'status', operator: 'inList', value: 'active, inactive' },
        },
      };

      const sql = generateSQL(state, testSchema);
      expect(sql).toBe("SELECT *\nFROM data\nWHERE age BETWEEN 18 AND 30 AND status IN ('active', 'inactive')");
    });
  });

  describe('MongoDB Filter Generator', () => {
    it('should generate simple equals filter', () => {
      const state: QueryState = {
        rootGroupId: 'root',
        groups: {
          root: { id: 'root', type: 'AND', children: ['rule1'], parentId: null },
        },
        rules: {
          rule1: { id: 'rule1', field: 'name', operator: 'equals', value: 'John' },
        },
      };

      const mongo = JSON.parse(generateMongo(state, testSchema));
      expect(mongo).toEqual({ name: 'John' });
    });

    it('should handle numeric and boolean type coercion', () => {
      const state: QueryState = {
        rootGroupId: 'root',
        groups: {
          root: { id: 'root', type: 'AND', children: ['rule1', 'rule2'], parentId: null },
        },
        rules: {
          rule1: { id: 'rule1', field: 'age', operator: 'equals', value: '25' },
          rule2: { id: 'rule2', field: 'isVerified', operator: 'equals', value: 'true' },
        },
      };

      const mongo = JSON.parse(generateMongo(state, testSchema));
      expect(mongo).toEqual({
        $and: [
          { age: 25 },
          { isVerified: true }
        ]
      });
    });

    it('should generate regex for contains and startsWith', () => {
      const state: QueryState = {
        rootGroupId: 'root',
        groups: {
          root: { id: 'root', type: 'AND', children: ['rule1', 'rule2'], parentId: null },
        },
        rules: {
          rule1: { id: 'rule1', field: 'name', operator: 'contains', value: 'jo' },
          rule2: { id: 'rule2', field: 'name', operator: 'startsWith', value: 'A' },
        },
      };

      const mongo = JSON.parse(generateMongo(state, testSchema));
      expect(mongo.$and[0].name).toEqual({ $regex: 'jo', $options: 'i' });
      expect(mongo.$and[1].name).toEqual({ $regex: '^A', $options: 'i' });
    });

    it('should generate between and inList filters', () => {
      const state: QueryState = {
        rootGroupId: 'root',
        groups: {
          root: { id: 'root', type: 'AND', children: ['rule1', 'rule2'], parentId: null },
        },
        rules: {
          rule1: { id: 'rule1', field: 'age', operator: 'between', value: '18', value2: '30' },
          rule2: { id: 'rule2', field: 'age', operator: 'inList', value: '20, 21, 22' },
        },
      };

      const mongo = JSON.parse(generateMongo(state, testSchema));
      expect(mongo.$and[0].age).toEqual({ $gte: 18, $lte: 30 });
      expect(mongo.$and[1].age).toEqual({ $in: [20, 21, 22] });
    });
  });

  describe('GraphQL Generator', () => {
    it('should generate basic GraphQL where clause', () => {
      const state: QueryState = {
        rootGroupId: 'root',
        groups: {
          root: { id: 'root', type: 'AND', children: ['rule1'], parentId: null },
        },
        rules: {
          rule1: { id: 'rule1', field: 'name', operator: 'equals', value: 'John' },
        },
      };

      const gql = generateGraphQL(state, testSchema, 'users');
      expect(gql).toContain('query {');
      expect(gql).toContain('users (where: {');
      expect(gql).toContain('_and: [');
      expect(gql).toContain('name: { _eq: "John" }');
    });

    it('should handle complex nested groups', () => {
      const state: QueryState = {
        rootGroupId: 'root',
        groups: {
          root: { id: 'root', type: 'AND', children: ['rule1', 'group1'], parentId: null },
          group1: { id: 'group1', type: 'OR', children: ['rule2', 'rule3'], parentId: 'root' },
        },
        rules: {
          rule1: { id: 'rule1', field: 'age', operator: 'greaterThan', value: 21 },
          rule2: { id: 'rule2', field: 'status', operator: 'equals', value: 'active' },
          rule3: { id: 'rule3', field: 'isVerified', operator: 'equals', value: true },
        },
      };

      const gql = generateGraphQL(state, testSchema, 'users');
      expect(gql).toContain('_and: [');
      expect(gql).toContain('age: { _gt: 21 }');
      expect(gql).toContain('_or: [');
      expect(gql).toContain('status: { _eq: "active" }');
      expect(gql).toContain('isVerified: { _eq: true }');
    });
  });
});
