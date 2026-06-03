/**
 * Saved query presets.
 * CRUD operations persisted to localStorage.
 */

import { QueryState } from './types';

const PRESETS_KEY = 'queryforge_presets';

export interface QueryPreset {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  state: QueryState;
}

function generateId(): string {
  return `preset_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function getPresets(): QueryPreset[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PRESETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePresets(presets: QueryPreset[]): void {
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
  } catch {
    // localStorage full
  }
}

export function createPreset(
  name: string,
  description: string,
  state: QueryState
): QueryPreset {
  const preset: QueryPreset = {
    id: generateId(),
    name,
    description,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    state: structuredClone(state),
  };

  const presets = getPresets();
  presets.unshift(preset);
  savePresets(presets);

  return preset;
}

export function updatePreset(id: string, updates: Partial<Pick<QueryPreset, 'name' | 'description' | 'state'>>): void {
  const presets = getPresets().map((p) => {
    if (p.id !== id) return p;
    return {
      ...p,
      ...updates,
      state: updates.state ? structuredClone(updates.state) : p.state,
      updatedAt: Date.now(),
    };
  });
  savePresets(presets);
}

export function deletePreset(id: string): void {
  const presets = getPresets().filter((p) => p.id !== id);
  savePresets(presets);
}

export function getPresetById(id: string): QueryPreset | undefined {
  return getPresets().find((p) => p.id === id);
}
