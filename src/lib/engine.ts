import { QueryState, Rule, Group, Schema, RuleOperator } from './types';

export interface ValidationError {
  nodeId: string;
  nodeType: 'rule' | 'group';
  field?: string;
  message: string;
}

export const validateRule = (rule: Rule, schema: Schema): string | null => {
  const fieldSchema = schema[rule.field];
  if (!fieldSchema) return `Field "${rule.field}" not found in schema.`;

  if (rule.value === undefined || rule.value === '') {
    if (rule.operator !== 'isNull' && rule.operator !== 'isNotNull') {
      return 'Value is required.';
    }
  }

  if (rule.operator === 'between' && (rule.value2 === undefined || rule.value2 === '')) {
    return 'Second value is required for "between" operator.';
  }

  // Date range validation: value2 must be >= value1
  if (rule.operator === 'between' && fieldSchema.type === 'date' && rule.value && rule.value2) {
    if (new Date(String(rule.value2)) < new Date(String(rule.value))) {
      return 'End date must be after start date.';
    }
  }

  // Number range validation for between
  if (rule.operator === 'between' && fieldSchema.type === 'number' && rule.value && rule.value2) {
    if (Number(rule.value2) < Number(rule.value)) {
      return 'End value must be greater than or equal to start value.';
    }
  }

  if (fieldSchema.type === 'number') {
    if (['contains', 'startsWith'].includes(rule.operator)) {
      return `Operator "${rule.operator}" is not valid for number fields.`;
    }
    if (isNaN(Number(rule.value)) && rule.operator !== 'isNull' && rule.operator !== 'isNotNull' && rule.operator !== 'inList') {
      return 'Value must be a number.';
    }
  }

  // Boolean fields only support equals
  if (fieldSchema.type === 'boolean') {
    if (!['equals', 'isNull', 'isNotNull'].includes(rule.operator)) {
      return `Operator "${rule.operator}" is not valid for boolean fields.`;
    }
  }

  return null; // Valid
};

/**
 * Validates the entire query tree, collecting all errors.
 * Used by ValidationSummary component.
 */
export function validateQueryTree(state: QueryState, schema: Schema): ValidationError[] {
  const errors: ValidationError[] = [];

  function validateGroup(groupId: string) {
    const group = state.groups[groupId];
    if (!group) return;

    // Check for empty nested groups (root can be empty)
    if (group.parentId !== null && group.children.length === 0) {
      errors.push({
        nodeId: groupId,
        nodeType: 'group',
        message: 'Empty group — add conditions or remove this group.',
      });
    }

    for (const childId of group.children) {
      if (state.groups[childId]) {
        validateGroup(childId);
      } else if (state.rules[childId]) {
        const rule = state.rules[childId];
        const error = validateRule(rule, schema);
        if (error) {
          const fieldSchema = schema[rule.field];
          errors.push({
            nodeId: childId,
            nodeType: 'rule',
            field: fieldSchema?.label || rule.field,
            message: error,
          });
        }
      }
    }
  }

  validateGroup(state.rootGroupId);
  return errors;
}

export const generateSQL = (state: QueryState, schema: Schema): string => {
  const processGroup = (groupId: string): string => {
    const group = state.groups[groupId];
    if (!group || group.children.length === 0) return '';

    const conditions: string[] = group.children.map(childId => {
      if (state.groups[childId]) {
        const nested = processGroup(childId);
        return nested ? `(${nested})` : '';
      }
      
      const rule = state.rules[childId];
      if (!rule) return '';

      const isValid = validateRule(rule, schema) === null;
      if (!isValid) return '';

      const field = rule.field;
      let value = rule.value;
      
      // Escape and quote strings
      if (schema[field]?.type === 'string' || schema[field]?.type === 'enum' || schema[field]?.type === 'date') {
        value = `'${String(value).replace(/'/g, "''")}'`;
      }

      switch (rule.operator) {
        case 'equals': return `${field} = ${value}`;
        case 'notEquals': return `${field} != ${value}`;
        case 'contains': return `${field} LIKE '%${rule.value}%'`;
        case 'startsWith': return `${field} LIKE '${rule.value}%'`;
        case 'greaterThan': return `${field} > ${value}`;
        case 'lessThan': return `${field} < ${value}`;
        case 'between': 
          let v2 = rule.value2;
          if (schema[field]?.type === 'string' || schema[field]?.type === 'enum' || schema[field]?.type === 'date') {
            v2 = `'${String(v2).replace(/'/g, "''")}'`;
          }
          return `${field} BETWEEN ${value} AND ${v2}`;
        case 'inList': 
          const list = String(rule.value).split(',').map(v => v.trim());
          const formattedList = list.map(v => 
            (schema[field]?.type === 'string' || schema[field]?.type === 'enum' || schema[field]?.type === 'date') 
              ? `'${v.replace(/'/g, "''")}'` 
              : v
          ).join(', ');
          return `${field} IN (${formattedList})`;
        case 'isNull': return `${field} IS NULL`;
        case 'isNotNull': return `${field} IS NOT NULL`;
        default: return '';
      }
    }).filter(c => c !== '');

    if (conditions.length === 0) return '';
    return conditions.join(` ${group.type} `);
  };

  const sql = processGroup(state.rootGroupId);
  return sql ? `SELECT *\nFROM data\nWHERE ${sql}` : 'SELECT *\nFROM data';
};

export const generateMongo = (state: QueryState, schema: Schema): string => {
  const processGroup = (groupId: string): any => {
    const group = state.groups[groupId];
    if (!group || group.children.length === 0) return {};

    const conditions = group.children.map(childId => {
      if (state.groups[childId]) {
        const nested = processGroup(childId);
        return Object.keys(nested).length > 0 ? nested : null;
      }
      
      const rule = state.rules[childId];
      if (!rule) return null;

      const isValid = validateRule(rule, schema) === null;
      if (!isValid) return null;

      const field = rule.field;
      let value = rule.value;
      if (schema[field]?.type === 'number') value = Number(value);
      if (schema[field]?.type === 'boolean') value = Boolean(value);

      switch (rule.operator) {
        case 'equals': return { [field]: value };
        case 'notEquals': return { [field]: { $ne: value } };
        case 'contains': return { [field]: { $regex: value, $options: 'i' } };
        case 'startsWith': return { [field]: { $regex: `^${value}`, $options: 'i' } };
        case 'greaterThan': return { [field]: { $gt: value } };
        case 'lessThan': return { [field]: { $lt: value } };
        case 'between': 
          let v2 = rule.value2;
          if (schema[field]?.type === 'number') v2 = Number(v2);
          return { [field]: { $gte: value, $lte: v2 } };
        case 'inList': 
          const list = String(rule.value).split(',').map(v => v.trim());
          const formattedList = list.map(v => schema[field]?.type === 'number' ? Number(v) : v);
          return { [field]: { $in: formattedList } };
        case 'isNull': return { [field]: null };
        case 'isNotNull': return { [field]: { $ne: null } };
        default: return null;
      }
    }).filter(Boolean);

    if (conditions.length === 0) return {};
    if (conditions.length === 1) return conditions[0];

    const operator = group.type === 'AND' ? '$and' : '$or';
    return { [operator]: conditions };
  };

  const mongoQuery = processGroup(state.rootGroupId);
  return JSON.stringify(mongoQuery, null, 2);
};
