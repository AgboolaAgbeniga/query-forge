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

  const label = fieldSchema.label;

  // 1. Value is required check
  if (rule.value === undefined || rule.value === '') {
    if (rule.operator !== 'isNull' && rule.operator !== 'isNotNull') {
      return `A value is required for "${label}". Please enter a value to complete the query condition.`;
    }
  }

  // 2. Between bounds check
  if (rule.operator === 'between' && (rule.value2 === undefined || rule.value2 === '')) {
    return `Both boundary values are required to filter "${label}" within a range. Please enter the second value.`;
  }

  // 3. Date format validation
  if (rule.operator !== 'isNull' && rule.operator !== 'isNotNull' && fieldSchema.type === 'date') {
    if (rule.value && isNaN(Date.parse(String(rule.value)))) {
      return `The value for "${label}" must be a valid date. Please use a valid format (e.g. YYYY-MM-DD).`;
    }
    if (rule.operator === 'between' && rule.value2 && isNaN(Date.parse(String(rule.value2)))) {
      return `The upper boundary date for "${label}" must be a valid date. Please use a valid format (e.g. YYYY-MM-DD).`;
    }
  }

  // 4. Date range limit check
  if (rule.operator === 'between' && fieldSchema.type === 'date' && rule.value && rule.value2) {
    if (!isNaN(Date.parse(String(rule.value))) && !isNaN(Date.parse(String(rule.value2)))) {
      if (new Date(String(rule.value2)) < new Date(String(rule.value))) {
        return `The end date for "${label}" must be after the start date. Please select a valid date range.`;
      }
    }
  }

  // 5. Number range limit check
  if (rule.operator === 'between' && fieldSchema.type === 'number' && rule.value && rule.value2) {
    if (Number(rule.value2) < Number(rule.value)) {
      return `The end value for "${label}" must be greater than or equal to the start value. Please enter a valid range.`;
    }
  }

  // 6. Number fields check
  if (fieldSchema.type === 'number') {
    if (['contains', 'startsWith', 'endsWith'].includes(rule.operator)) {
      return `Operator "${rule.operator}" is not valid for number fields like "${label}".`;
    }
    if (rule.operator !== 'isNull' && rule.operator !== 'isNotNull') {
      if (rule.operator === 'inList') {
        const list = String(rule.value).split(',').map(v => v.trim());
        const invalidItems = list.filter(v => v === '' || isNaN(Number(v)));
        if (invalidItems.length > 0) {
          return `All items in the list for "${label}" must be valid numbers separated by commas. Invalid entries: ${invalidItems.join(', ')}.`;
        }
      } else {
        if (isNaN(Number(rule.value))) {
          return `The value for "${label}" must be a valid number. Please check your input (e.g. 42).`;
        }
      }
    }
  }

  // 7. Boolean fields check
  if (fieldSchema.type === 'boolean') {
    if (!['equals', 'isNull', 'isNotNull'].includes(rule.operator)) {
      return `The operator "${rule.operator}" is not valid for boolean fields like "${label}".`;
    }
    if (rule.operator === 'equals' && rule.value !== undefined && rule.value !== '') {
      const coerced = String(rule.value).toLowerCase().trim();
      if (coerced !== 'true' && coerced !== 'false' && typeof rule.value !== 'boolean') {
        return `The value for "${label}" must be either "true" or "false".`;
      }
    }
  }

  // 8. Enum options check
  if (fieldSchema.type === 'enum' && fieldSchema.options) {
    if (rule.operator !== 'isNull' && rule.operator !== 'isNotNull' && rule.value !== undefined && rule.value !== '') {
      if (rule.operator === 'inList') {
        const list = String(rule.value).split(',').map(v => v.trim());
        const invalidItems = list.filter(item => !fieldSchema.options!.includes(item));
        if (invalidItems.length > 0) {
          return `Invalid option(s) for "${label}" detected: "${invalidItems.join(', ')}". Allowed options are: ${fieldSchema.options.join(', ')}.`;
        }
      } else if (rule.operator === 'equals' || rule.operator === 'notEquals') {
        if (!fieldSchema.options.includes(String(rule.value))) {
          return `The value for "${label}" must be one of the allowed options: ${fieldSchema.options.join(', ')}.`;
        }
      }
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
        message: 'Empty group detected. Please add condition rules or remove this group to ensure the logic runs correctly.',
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
        case 'contains': return `${field} LIKE '%${String(rule.value).replace(/'/g, "''")}%'`;
        case 'startsWith': return `${field} LIKE '${String(rule.value).replace(/'/g, "''")}%'`;
        case 'endsWith': return `${field} LIKE '%${String(rule.value).replace(/'/g, "''")}'`;
        case 'greaterThan': return `${field} > ${value}`;
        case 'greaterThanOrEquals': return `${field} >= ${value}`;
        case 'lessThan': return `${field} < ${value}`;
        case 'lessThanOrEquals': return `${field} <= ${value}`;
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
        case 'regex': return `${field} ~ '${String(rule.value).replace(/'/g, "''")}'`;
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
  const processGroup = (groupId: string): Record<string, unknown> | null => {
    const group = state.groups[groupId];
    if (!group || group.children.length === 0) return {};

    const conditions = group.children.map(childId => {
      if (state.groups[childId]) {
        const nested = processGroup(childId);
        return nested && Object.keys(nested).length > 0 ? nested : null;
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
        case 'endsWith': return { [field]: { $regex: `${value}$`, $options: 'i' } };
        case 'greaterThan': return { [field]: { $gt: value } };
        case 'greaterThanOrEquals': return { [field]: { $gte: value } };
        case 'lessThan': return { [field]: { $lt: value } };
        case 'lessThanOrEquals': return { [field]: { $lte: value } };
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
        case 'regex': return { [field]: { $regex: value, $options: 'i' } };
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

export const generateGraphQL = (state: QueryState, schema: Schema, schemaId: string = 'users'): string => {
  const processGroup = (groupId: string): string => {
    const group = state.groups[groupId];
    if (!group || group.children.length === 0) return '';

    const conditions = group.children.map(childId => {
      if (state.groups[childId]) {
        const nested = processGroup(childId);
        return nested ? `{\n  ${nested.split('\n').join('\n  ')}\n}` : '';
      }

      const rule = state.rules[childId];
      if (!rule) return '';

      const isValid = validateRule(rule, schema) === null;
      if (!isValid) return '';

      const field = rule.field;
      const value = rule.value;
      const fieldSchema = schema[field];

      const formatVal = (v: string | number | boolean | null) => {
        const isNumOrBool = fieldSchema?.type === 'number' || fieldSchema?.type === 'boolean';
        return isNumOrBool ? v : `"${String(v).replace(/"/g, '\\"')}"`;
      };

      switch (rule.operator) {
        case 'equals':
          return `${field}: { _eq: ${formatVal(value)} }`;
        case 'notEquals':
          return `${field}: { _neq: ${formatVal(value)} }`;
        case 'contains':
          return `${field}: { _ilike: "%${value}%" }`;
        case 'startsWith':
          return `${field}: { _ilike: "${value}%" }`;
        case 'endsWith':
          return `${field}: { _ilike: "%${value}" }`;
        case 'greaterThan':
          return `${field}: { _gt: ${value} }`;
        case 'greaterThanOrEquals':
          return `${field}: { _gte: ${value} }`;
        case 'lessThan':
          return `${field}: { _lt: ${value} }`;
        case 'lessThanOrEquals':
          return `${field}: { _lte: ${value} }`;
        case 'between': {
          const val2 = rule.value2 || '';
          return `${field}: { _gte: ${formatVal(value)}, _lte: ${formatVal(val2)} }`;
        }
        case 'inList': {
          const list = String(value).split(',').map(v => formatVal(v.trim())).join(', ');
          return `${field}: { _in: [${list}] }`;
        }
        case 'isNull':
          return `${field}: { _is_null: true }`;
        case 'isNotNull':
          return `${field}: { _is_null: false }`;
        case 'regex':
          return `${field}: { _iregex: "${value}" }`;
        default:
          return `${field}: { _eq: ${formatVal(value)} }`;
      }
    }).filter(Boolean);

    if (conditions.length === 0) return '';
    const op = group.type === 'AND' ? '_and' : '_or';
    return `${op}: [\n  ${conditions.join(',\n  ').split('\n').join('\n  ')}\n]`;
  };

  const body = processGroup(state.rootGroupId);
  return `query {\n  ${schemaId}${body ? ` (where: {\n    ${body.split('\n').join('\n    ')}\n  })` : ''} {\n    id\n    name\n    # ... fields\n  }\n}`;
};
