'use client';

import React, { useState, useEffect } from 'react';
import { getHistory, removeFromHistory, clearHistory, HistoryEntry } from '@/lib/history';
import { useQueryStore } from '@/lib/store';
import { Clock, Trash2, RotateCcw, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function HistoryPanel() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const setStoreState = useQueryStore((s) => s.setStoreState);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleRestore = (entry: HistoryEntry) => {
    setStoreState(entry.state);
    // Refresh list
    setHistory(getHistory());
  };

  const handleRemove = (id: string) => {
    removeFromHistory(id);
    setHistory(getHistory());
  };

  const handleClear = () => {
    clearHistory();
    setHistory([]);
    setShowClearConfirm(false);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="heading text-[16px] text-slate-700 dark:text-zinc-200 flex items-center gap-2">
          <Clock size={16} />
          Query History
        </h3>
        {history.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="text-xs text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1"
          >
            <Trash size={12} />
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-zinc-400 dark:text-zinc-500 py-4 text-center">
          No query history yet. Execute a query to save it here.
        </p>
      ) : (
        <AnimatePresence>
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto custom-scrollbar">
            {history.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 group hover:border-zinc-300 dark:hover:border-zinc-600 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-zinc-200 truncate">
                    {entry.label}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {formatTime(entry.timestamp)}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleRestore(entry)}
                    className="p-1.5 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
                    title="Restore this query"
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button
                    onClick={() => handleRemove(entry.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                    title="Remove from history"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear Query History"
        message="Are you sure you want to clear all query history? This action cannot be undone."
        confirmLabel="Clear History"
        onConfirm={handleClear}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}
