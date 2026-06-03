export type RuleOperator = 
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'startsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'between'
  | 'inList'
  | 'isNull'
  | 'isNotNull';

export type FieldType = 'string' | 'number' | 'date' | 'boolean' | 'enum';

export interface SchemaField {
  name: string;
  label: string;
  type: FieldType;
  options?: string[]; // For enum type
}

export type Schema = Record<string, SchemaField>;

export type RuleId = string;
export type GroupId = string;

export interface Rule {
  id: RuleId;
  field: string;
  operator: RuleOperator;
  value: any;
  value2?: any; // For 'between' operator
}

export interface Group {
  id: GroupId;
  type: 'AND' | 'OR';
  children: (RuleId | GroupId)[];
  parentId: GroupId | null; // useful for traversal/dnd
}

export interface QueryState {
  groups: Record<GroupId, Group>;
  rules: Record<RuleId, Rule>;
  rootGroupId: GroupId;
}
