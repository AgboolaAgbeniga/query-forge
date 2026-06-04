import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Menu } from 'lucide-react';
import { SchemaSelector } from './SchemaSelector';
import { PresetsPanel } from './PresetsPanel';
import { ExportImport } from './ExportImport';
import { useQueryStore } from '@/lib/store';
import { getSchemaById } from '@/lib/schema';
import { cn } from '@/lib/utils';

export function MobileSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const store = useQueryStore();
  const activeSchemaId = store.activeSchemaId;
  const activeSchema = getSchemaById(activeSchemaId);
  const schemaFieldsList = Object.values(activeSchema);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[90] lg:hidden backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-zinc-900 z-[100] lg:hidden flex flex-col border-r border-zinc-200 dark:border-zinc-800 shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="font-semibold text-slate-800 dark:text-zinc-100">Query Settings</h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-zinc-500 hover:text-slate-800 dark:hover:text-white rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-8">
              {/* Schema Selection */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 px-1">
                  Active Dataset
                </div>
                <SchemaSelector
                  activeSchemaId={activeSchemaId}
                  onSelect={(src) => store.setActiveSchemaId(src.id)}
                />
              </div>

              {/* Schema fields Section */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 px-1">
                  Schema Fields
                </div>
                <div className="flex flex-col gap-1.5">
                  {schemaFieldsList.map((field) => (
                    <div
                      key={field.name}
                      className="flex items-center gap-2.5 p-2 rounded-xl border border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-all cursor-default"
                    >
                      <span
                        className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded-md min-w-[50px] text-center tracking-wide uppercase",
                          field.type === 'string' && "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400",
                          field.type === 'number' && "bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400",
                          field.type === 'date' && "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400",
                          field.type === 'enum' && "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400",
                          field.type === 'boolean' && "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400"
                        )}
                      >
                        {field.type}
                      </span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 truncate">
                        {field.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <PresetsPanel />
              
              <div className="border-t border-zinc-200 dark:border-zinc-800/50 pt-6">
                <ExportImport />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
