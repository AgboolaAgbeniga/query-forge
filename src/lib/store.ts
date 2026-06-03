import { create } from 'zustand';
import { QueryState, Rule, Group, GroupId, RuleId } from './types';

interface QueryActions {
  addRule: (groupId: GroupId, field?: string) => void;
  addGroup: (groupId: GroupId) => void;
  removeNode: (id: RuleId | GroupId) => void;
  updateRule: (id: RuleId, updates: Partial<Rule>) => void;
  updateGroupType: (id: GroupId, type: 'AND' | 'OR') => void;
  moveNode: (id: RuleId | GroupId, targetGroupId: GroupId, insertIndex: number) => void;
  setStoreState: (state: QueryState) => void;
}

export type QueryStore = QueryState & QueryActions;

const createId = () => Math.random().toString(36).substring(2, 9);

const initialRootId = createId();

const initialState: QueryState = {
  rootGroupId: initialRootId,
  groups: {
    [initialRootId]: {
      id: initialRootId,
      type: 'AND',
      children: [],
      parentId: null,
    },
  },
  rules: {},
};

export const useQueryStore = create<QueryStore>((set, get) => ({
  ...initialState,

  addRule: (groupId, field = 'id') => set((state) => {
    const newRuleId = `rule_${createId()}`;
    const newRule: Rule = {
      id: newRuleId,
      field,
      operator: 'equals',
      value: '',
    };

    const group = state.groups[groupId];
    if (!group) return state;

    return {
      ...state,
      rules: { ...state.rules, [newRuleId]: newRule },
      groups: {
        ...state.groups,
        [groupId]: {
          ...group,
          children: [...group.children, newRuleId],
        },
      },
    };
  }),

  addGroup: (groupId) => set((state) => {
    const newGroupId = `group_${createId()}`;
    const newGroup: Group = {
      id: newGroupId,
      type: 'AND',
      children: [],
      parentId: groupId,
    };

    const parentGroup = state.groups[groupId];
    if (!parentGroup) return state;

    return {
      ...state,
      groups: {
        ...state.groups,
        [newGroupId]: newGroup,
        [groupId]: {
          ...parentGroup,
          children: [...parentGroup.children, newGroupId],
        },
      },
    };
  }),

  removeNode: (id) => set((state) => {
    if (id === state.rootGroupId) {
      // Cannot remove root group, maybe reset it?
      return {
        ...state,
        groups: {
          ...state.groups,
          [state.rootGroupId]: {
            ...state.groups[state.rootGroupId],
            children: [],
          }
        },
        // We probably should clean up orphaned rules/groups here, but keeping it simple for now.
        // A full cleanup would recursively delete from `rules` and `groups`.
      };
    }

    const newState = { ...state };
    const newGroups = { ...state.groups };
    const newRules = { ...state.rules };

    // Find parent group
    let parentId: GroupId | null = null;
    
    // Check if it's a rule
    if (newRules[id as RuleId]) {
      // Find parent group iterating through groups
      for (const group of Object.values(newGroups)) {
        if (group.children.includes(id)) {
          parentId = group.id;
          break;
        }
      }
      delete newRules[id as RuleId];
    } else if (newGroups[id as GroupId]) {
      parentId = newGroups[id as GroupId].parentId;
      
      // Recursive delete helper could be added here
      const deleteRecursive = (nodeId: string) => {
        if (newRules[nodeId]) {
          delete newRules[nodeId];
        } else if (newGroups[nodeId]) {
          const group = newGroups[nodeId];
          group.children.forEach(deleteRecursive);
          delete newGroups[nodeId];
        }
      };
      
      const groupToDelete = newGroups[id as GroupId];
      groupToDelete.children.forEach(deleteRecursive);
      delete newGroups[id as GroupId];
    }

    if (parentId && newGroups[parentId]) {
      newGroups[parentId] = {
        ...newGroups[parentId],
        children: newGroups[parentId].children.filter(childId => childId !== id),
      };
    }

    return {
      ...state,
      groups: newGroups,
      rules: newRules,
    };
  }),

  updateRule: (id, updates) => set((state) => {
    const rule = state.rules[id];
    if (!rule) return state;

    return {
      ...state,
      rules: {
        ...state.rules,
        [id]: { ...rule, ...updates },
      },
    };
  }),

  updateGroupType: (id, type) => set((state) => {
    const group = state.groups[id];
    if (!group) return state;

    return {
      ...state,
      groups: {
        ...state.groups,
        [id]: { ...group, type },
      },
    };
  }),

  moveNode: (id, targetGroupId, insertIndex) => set((state) => {
    const newGroups = { ...state.groups };
    let sourceGroupId: GroupId | null = null;

    // Find source group
    for (const group of Object.values(newGroups)) {
      if (group.children.includes(id)) {
        sourceGroupId = group.id;
        break;
      }
    }

    if (!sourceGroupId || !newGroups[targetGroupId]) return state;

    // Cannot move a group inside itself or its children (cycle prevention)
    if (newGroups[id as GroupId]) {
      let currentParent = targetGroupId;
      while (currentParent) {
        if (currentParent === id) return state; // Cycle detected
        currentParent = newGroups[currentParent].parentId as GroupId;
      }
    }

    // Remove from source
    newGroups[sourceGroupId] = {
      ...newGroups[sourceGroupId],
      children: newGroups[sourceGroupId].children.filter(childId => childId !== id),
    };

    // Add to target
    const targetChildren = [...newGroups[targetGroupId].children];
    targetChildren.splice(insertIndex, 0, id);

    newGroups[targetGroupId] = {
      ...newGroups[targetGroupId],
      children: targetChildren,
    };
    
    // Update parentId if it's a group
    if (newGroups[id as GroupId]) {
       newGroups[id as GroupId] = {
         ...newGroups[id as GroupId],
         parentId: targetGroupId
       };
    }

    return {
      ...state,
      groups: newGroups,
    };
  }),

  setStoreState: (newState) => set(newState),
}));
