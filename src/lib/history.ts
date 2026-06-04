/**
 * Query history manager.
 * Stores the last 20 query snapshots in localStorage.
 */

import { QueryState } from './types';

const HISTORY_KEY = 'prism_history';
const MAX_HISTORY = 20;

export interface HistoryEntry {
  id: string;
  timestamp: number;
  label: string;
  state: QueryState;
  ruleCount: number;
  groupCount: number;
}

function generateId(): string {
  return `hist_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function countItems(state: QueryState): { ruleCount: number; groupCount: number } {
  return {
    ruleCount: Object.keys(state.rules).length,
    groupCount: Object.keys(state.groups).length - 1, // Exclude root
  };
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToHistory(state: QueryState, label?: string): HistoryEntry {
  const { ruleCount, groupCount } = countItems(state);
  const entry: HistoryEntry = {
    id: generateId(),
    timestamp: Date.now(),
    label: label || `Query (${ruleCount} rules, ${groupCount} groups)`,
    state: structuredClone(state),
    ruleCount,
    groupCount,
  };

  const history = getHistory();
  history.unshift(entry);

  // Keep only last MAX_HISTORY entries
  const trimmed = history.slice(0, MAX_HISTORY);

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage full, remove oldest
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed.slice(0, 10)));
  }

  return entry;
}

export function removeFromHistory(id: string): void {
  const history = getHistory().filter((h) => h.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}
