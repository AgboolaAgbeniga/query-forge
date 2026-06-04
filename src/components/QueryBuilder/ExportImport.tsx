'use client';

import React, { useRef, useState } from 'react';
import { useQueryStore } from '@/lib/store';
import { QueryState } from '@/lib/types';
import { Upload, Download, Check, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Validates imported JSON as a valid QueryState.
 * Prevents malformed recursive structures.
 */
export function validateQueryJSON(data: unknown): { valid: boolean; error?: string; state?: QueryState } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid JSON: expected an object.' };
  }

  const obj = data as Record<string, unknown>;

  if (!obj.rootGroupId || typeof obj.rootGroupId !== 'string') {
    return { valid: false, error: 'Missing or invalid "rootGroupId".' };
  }

  if (!obj.groups || typeof obj.groups !== 'object') {
    return { valid: false, error: 'Missing or invalid "groups".' };
  }

  if (!obj.rules || typeof obj.rules !== 'object') {
    return { valid: false, error: 'Missing or invalid "rules".' };
  }

  const groups = obj.groups as Record<string, Record<string, unknown>>;
  const rules = obj.rules as Record<string, Record<string, unknown>>;
  const rootGroupId = obj.rootGroupId as string;

  // Verify root group exists
  if (!groups[rootGroupId]) {
    return { valid: false, error: 'Root group not found in groups map.' };
  }

  // Validate each group
  for (const [id, group] of Object.entries(groups)) {
    if (!group.id || group.id !== id) {
      return { valid: false, error: `Group "${id}" has mismatched id.` };
    }
    if (!group.type || !['AND', 'OR'].includes(group.type as string)) {
      return { valid: false, error: `Group "${id}" has invalid type.` };
    }
    if (!Array.isArray(group.children)) {
      return { valid: false, error: `Group "${id}" has invalid children.` };
    }

    // Verify all children reference valid rules or groups
    for (const childId of group.children as string[]) {
      if (!groups[childId] && !rules[childId]) {
        return { valid: false, error: `Group "${id}" references unknown child "${childId}".` };
      }
    }
  }

  // Validate each rule
  for (const [id, rule] of Object.entries(rules)) {
    if (!rule.id || rule.id !== id) {
      return { valid: false, error: `Rule "${id}" has mismatched id.` };
    }
    if (!rule.field || typeof rule.field !== 'string') {
      return { valid: false, error: `Rule "${id}" has invalid field.` };
    }
    if (!rule.operator || typeof rule.operator !== 'string') {
      return { valid: false, error: `Rule "${id}" has invalid operator.` };
    }
  }

  // Check for cycles in group hierarchy
  const visited = new Set<string>();
  function hasCycle(groupId: string, path: Set<string>): boolean {
    if (path.has(groupId)) return true;
    if (visited.has(groupId)) return false;
    visited.add(groupId);
    path.add(groupId);

    const group = groups[groupId];
    if (group) {
      for (const childId of group.children as string[]) {
        if (groups[childId] && hasCycle(childId, new Set(path))) {
          return true;
        }
      }
    }
    return false;
  }

  if (hasCycle(rootGroupId, new Set())) {
    return { valid: false, error: 'Circular reference detected in group hierarchy.' };
  }

  return { valid: true, state: data as QueryState };
}

export function ExportImport() {
  const store = useQueryStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleExport = () => {
    const state: QueryState = {
      rootGroupId: store.rootGroupId,
      groups: store.groups,
      rules: store.rules,
    };

    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `prism-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(false);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const data = JSON.parse(text);
        const result = validateQueryJSON(data);

        if (!result.valid) {
          setImportError(result.error || 'Invalid query file.');
          return;
        }

        store.setStoreState(result.state!);
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
      } catch {
        setImportError('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);

    // Reset input so same file can be re-imported
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="heading text-[16px] text-slate-700 dark:text-zinc-200 flex items-center gap-2">
        <Download size={16} />
        Export / Import
      </h3>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-zinc-200 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-600 transition-all shadow-sm hover:shadow hover:scale-[1.02] active:scale-[0.98]"
        >
          <Download size={14} />
          Export JSON
        </button>

        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-zinc-200 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-600 transition-all shadow-sm hover:shadow hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
          <Upload size={14} />
          Import JSON
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </div>

      {importError && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs">
          <AlertTriangle size={14} />
          {importError}
        </div>
      )}

      {importSuccess && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs">
          <Check size={14} />
          Query imported successfully!
        </div>
      )}
    </div>
  );
}
