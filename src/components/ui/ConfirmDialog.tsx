import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-sm bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl p-5 mx-4"
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "p-2 rounded-xl shrink-0 mt-0.5",
                  isDestructive 
                    ? "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"
                    : "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                )}
              >
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                  {title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  {message}
                </p>
              </div>
              <button
                onClick={onCancel}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="flex gap-2 mt-5">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 bg-zinc-50 dark:bg-white/10 hover:bg-zinc-100 dark:hover:bg-white/20 border border-zinc-200 dark:border-white/10 rounded-xl transition-all active:scale-95"
              >
                {cancelLabel}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                }}
                className={cn(
                  "flex-1 px-4 py-2 text-xs font-semibold text-white rounded-xl transition-all active:scale-95 shadow-md",
                  isDestructive 
                    ? "bg-red-600 hover:bg-red-700 shadow-red-500/20"
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                )}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
