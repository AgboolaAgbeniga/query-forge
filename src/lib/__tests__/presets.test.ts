import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getPresets, createPreset, deletePreset, clearPresets, QueryPreset } from '../presets';
import { QueryState } from '../types';

describe('Presets Module', () => {
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
    // Clear presets before each test
    clearPresets();
  });

  it('should return empty array when no presets exist', () => {
    expect(getPresets()).toEqual([]);
  });

  it('should create preset and retrieve it', () => {
    const preset = createPreset('Premium Users', 'Users with active sub', dummyState);
    expect(preset.name).toBe('Premium Users');
    expect(preset.description).toBe('Users with active sub');
    
    const presets = getPresets();
    expect(presets.length).toBe(1);
    expect(presets[0].id).toBe(preset.id);
  });

  it('should delete a preset by id', () => {
    const preset1 = createPreset('Preset 1', '', dummyState);
    const preset2 = createPreset('Preset 2', '', dummyState);
    
    let presets = getPresets();
    expect(presets.length).toBe(2);
    
    deletePreset(preset1.id);
    presets = getPresets();
    expect(presets.length).toBe(1);
    expect(presets[0].id).toBe(preset2.id);
  });

  it('should clear all presets', () => {
    createPreset('Preset 1', '', dummyState);
    createPreset('Preset 2', '', dummyState);
    
    expect(getPresets().length).toBe(2);
    clearPresets();
    expect(getPresets().length).toBe(0);
  });
});
