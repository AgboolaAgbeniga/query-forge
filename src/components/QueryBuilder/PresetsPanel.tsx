'use client';

import React, { useState, useEffect } from 'react';
import { getPresets, createPreset, deletePreset, QueryPreset } from '@/lib/presets';
import { useQueryStore } from '@/lib/store';
import { Bookmark, Trash2, Download, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function PresetsPanel() {
  const [presets, setPresets] = useState<QueryPreset[]>([]);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const store = useQueryStore();

  useEffect(() => {
    setPresets(getPresets());
  }, []);

  const handleSave = () => {
    if (!newName.trim()) return;
    createPreset(
      newName.trim(),
      newDesc.trim(),
      { groups: store.groups, rules: store.rules, rootGroupId: store.rootGroupId }
    );
    setPresets(getPresets());
    setNewName('');
    setNewDesc('');
    setShowSaveForm(false);
  };

  const handleLoad = (preset: QueryPreset) => {
    store.setStoreState(preset.state);
  };

  const handleDelete = (id: string) => {
    deletePreset(id);
    setPresets(getPresets());
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="heading text-[16px] text-slate-700 dark:text-zinc-200 flex items-center gap-2">
          <Bookmark size={16} />
          Saved Presets
        </h3>
        <button
          onClick={() => setShowSaveForm(!showSaveForm)}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center gap-1 font-medium"
        >
          {showSaveForm ? <X size={12} /> : <Plus size={12} />}
          {showSaveForm ? 'Cancel' : 'Save Current'}
        </button>
      </div>

      {/* Save form */}
      <AnimatePresence>
        {showSaveForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Preset name..."
                className="px-3 py-1.5 bg-white dark:bg-white/10 border border-zinc-200 dark:border-white/10 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                autoFocus
              />
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Description (optional)..."
                className="px-3 py-1.5 bg-white dark:bg-white/10 border border-zinc-200 dark:border-white/10 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                onClick={handleSave}
                disabled={!newName.trim()}
                className="px-3 py-1.5 bg-indigo-600 dark:bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Preset
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Presets list */}
      {presets.length === 0 && !showSaveForm ? (
        <p className="text-sm text-zinc-400 dark:text-zinc-500 py-4 text-center">
          No saved presets. Save your current query as a reusable preset.
        </p>
      ) : (
        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto custom-scrollbar">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 group hover:border-zinc-300 dark:hover:border-zinc-600 transition-all"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-zinc-200 truncate">
                  {preset.name}
                </p>
                {preset.description && (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
                    {preset.description}
                  </p>
                )}
                <p className="text-[11px] text-zinc-400 dark:text-zinc-600 mt-0.5">
                  {formatDate(preset.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleLoad(preset)}
                  className="p-1.5 text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-all"
                  title="Load this preset"
                >
                  <Download size={14} />
                </button>
                <button
                  onClick={() => handleDelete(preset.id)}
                  className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                  title="Delete preset"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
