'use client';

import React, { useMemo } from 'react';
import { useQueryStore } from '@/lib/store';
import { validateQueryTree, ValidationError } from '@/lib/engine';
import { Schema } from '@/lib/types';
import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

interface ValidationSummaryProps {
  errors: ValidationError[];
  rulesCount: number;
}

export function ValidationSummary({ errors, rulesCount }: ValidationSummaryProps) {
  if (rulesCount === 0) return null;

  return (
    <AnimatePresence>
      {errors.length === 0 ? (
        <motion.div
          key="valid"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-sm"
        >
          <CheckCircle2 size={16} />
          <span className="font-medium">Query is valid</span>
          <span className="text-emerald-500 dark:text-emerald-500 text-xs">
            — {rulesCount} rule{rulesCount !== 1 ? 's' : ''} configured
          </span>
        </motion.div>
      ) : (
        <motion.div
          key="errors"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="flex flex-col gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30"
        >
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm font-medium">
            <AlertTriangle size={16} />
            {errors.length} validation issue{errors.length !== 1 ? 's' : ''}
          </div>
          <div className="flex flex-col gap-1 max-h-[120px] overflow-y-auto custom-scrollbar">
            {errors.map((err, idx) => (
              <div
                key={`${err.nodeId}-${idx}`}
                className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400/80 pl-1"
              >
                <AlertCircle size={12} className="mt-0.5 shrink-0" />
                <span>
                  {err.nodeType === 'rule' && err.field && (
                    <span className="font-medium">{err.field}: </span>
                  )}
                  {err.message}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
