import { describe, it, expect, beforeEach } from 'vitest';
import { useQueryStore } from '../store';

describe('Query Zustand Store', () => {
  beforeEach(() => {
    useQueryStore.getState().resetQuery();
  });

  it('should initialize with a root group and empty rules', () => {
    const state = useQueryStore.getState();
    expect(state.rootGroupId).toBeDefined();
    expect(state.groups[state.rootGroupId]).toBeDefined();
    expect(state.groups[state.rootGroupId].children).toEqual([]);
    expect(state.rules).toEqual({});
  });

  it('should add rules to a group', () => {
    const store = useQueryStore.getState();
    const rootId = store.rootGroupId;

    store.addRule(rootId, 'age');
    
    const updatedState = useQueryStore.getState();
    const children = updatedState.groups[rootId].children;
    expect(children.length).toBe(1);
    
    const ruleId = children[0];
    expect(ruleId.startsWith('rule_')).toBe(true);
    expect(updatedState.rules[ruleId]).toBeDefined();
    expect(updatedState.rules[ruleId].field).toBe('age');
  });

  it('should add a nested group', () => {
    const store = useQueryStore.getState();
    const rootId = store.rootGroupId;

    store.addGroup(rootId);

    const updatedState = useQueryStore.getState();
    const children = updatedState.groups[rootId].children;
    expect(children.length).toBe(1);

    const subGroupId = children[0];
    expect(subGroupId.startsWith('group_')).toBe(true);
    expect(updatedState.groups[subGroupId]).toBeDefined();
    expect(updatedState.groups[subGroupId].parentId).toBe(rootId);
  });

  it('should remove rules and groups recursively', () => {
    const store = useQueryStore.getState();
    const rootId = store.rootGroupId;

    // Add a sub-group
    store.addGroup(rootId);
    let state = useQueryStore.getState();
    const subGroupId = state.groups[rootId].children[0];

    // Add a rule inside sub-group
    store.addRule(subGroupId, 'name');
    state = useQueryStore.getState();
    const ruleId = state.groups[subGroupId].children[0];

    expect(state.rules[ruleId]).toBeDefined();
    expect(state.groups[subGroupId]).toBeDefined();

    // Remove sub-group
    store.removeNode(subGroupId);
    state = useQueryStore.getState();

    // Subgroup and nested rule should be cleaned up
    expect(state.groups[subGroupId]).toBeUndefined();
    expect(state.rules[ruleId]).toBeUndefined();
    expect(state.groups[rootId].children).toEqual([]);
  });

  it('should update rule fields, operators, and values', () => {
    const store = useQueryStore.getState();
    const rootId = store.rootGroupId;

    store.addRule(rootId, 'name');
    let state = useQueryStore.getState();
    const ruleId = state.groups[rootId].children[0];

    store.updateRule(ruleId, { value: 'Alice', operator: 'contains' });
    state = useQueryStore.getState();

    expect(state.rules[ruleId].value).toBe('Alice');
    expect(state.rules[ruleId].operator).toBe('contains');
  });

  it('should prevent cyclic references when moving a group inside itself or its descendants', () => {
    const store = useQueryStore.getState();
    const rootId = store.rootGroupId;

    // Create nested structure: root -> G1 -> G2
    store.addGroup(rootId);
    let state = useQueryStore.getState();
    const g1 = state.groups[rootId].children[0];

    store.addGroup(g1);
    state = useQueryStore.getState();
    const g2 = state.groups[g1].children[0];

    // Try moving G1 inside G2 (cyclic!)
    store.moveNode(g1, g2, 0);
    state = useQueryStore.getState();

    // The move should be rejected and ignored (g1 remains child of root)
    expect(state.groups[rootId].children).toContain(g1);
    expect(state.groups[g2].children).not.toContain(g1);
    expect(state.groups[g1].parentId).toBe(rootId);
  });

  it('should switch active schema and reset the query tree', () => {
    const store = useQueryStore.getState();
    const rootId = store.rootGroupId;

    // Add some rule
    store.addRule(rootId, 'name');
    let state = useQueryStore.getState();
    expect(Object.keys(state.rules).length).toBe(1);

    // Switch schema to products
    store.setActiveSchemaId('products');
    state = useQueryStore.getState();

    expect(state.activeSchemaId).toBe('products');
    // Store should reset query state
    expect(state.rootGroupId).not.toBe(rootId);
    expect(Object.keys(state.rules).length).toBe(0);
  });
});
