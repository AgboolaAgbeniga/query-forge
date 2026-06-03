import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getHistory, addToHistory, removeFromHistory, clearHistory, HistoryEntry } from '../history';
import { QueryState } from '../types';

describe('History Module', () => {
  const dummyState: QueryState = {
    rootGroupId: 'root',
    groups: {
      root: { id: 'root', type: 'AND', children: [], parentId: null }
    },
    rules: {}
  };

  beforeEach(() => {
    // Mock localStorage
    const storage: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage[key] || null,
      setItem: (key: string, value: string) => { storage[key] = value; },
      removeItem: (key: string) => { delete storage[key]; },
    });
    // Clear history before each test
    clearHistory();
  });

  it('should return empty array when no history exists', () => {
    expect(getHistory()).toEqual([]);
  });

  it('should add history entry and retrieve it', () => {
    const entry = addToHistory(dummyState, 'Test Query');
    expect(entry.label).toBe('Test Query');
    expect(entry.ruleCount).toBe(0);
    expect(entry.groupCount).toBe(0);
    
    const history = getHistory();
    expect(history.length).toBe(1);
    expect(history[0].id).toBe(entry.id);
  });

  it('should limit history to 20 entries', () => {
    for (let i = 0; i < 25; i++) {
      addToHistory(dummyState, `Query ${i}`);
    }
    
    const history = getHistory();
    expect(history.length).toBe(20);
    // The most recent 20 should be kept, so the last one added (Query 24) is first
    expect(history[0].label).toBe('Query 24');
    expect(history[19].label).toBe('Query 5');
  });

  it('should remove specific history entry', () => {
    const entry1 = addToHistory(dummyState, 'Query A');
    const entry2 = addToHistory(dummyState, 'Query B');
    
    let history = getHistory();
    expect(history.length).toBe(2);
    
    removeFromHistory(entry2.id); // Remove Query B
    history = getHistory();
    expect(history.length).toBe(1);
    expect(history[0].id).toBe(entry1.id);
  });

  it('should clear all history', () => {
    addToHistory(dummyState, 'Query A');
    addToHistory(dummyState, 'Query B');
    
    expect(getHistory().length).toBe(2);
    clearHistory();
    expect(getHistory().length).toBe(0);
  });
});
