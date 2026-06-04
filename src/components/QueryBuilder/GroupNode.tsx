import React, { useState, useCallback, memo } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useQueryStore } from '@/lib/store';
import { GroupId } from '@/lib/types';
import { RuleNode } from './RuleNode';
import { GripVertical, Plus, Trash2, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface GroupNodeProps {
  id: GroupId;
  depth: number;
}

export const GroupNode = memo(function GroupNode({ id, depth }: GroupNodeProps) {
  const group = useQueryStore((s) => s.groups[id]);
  const updateGroupType = useQueryStore((s) => s.updateGroupType);
  const addRule = useQueryStore((s) => s.addRule);
  const addGroup = useQueryStore((s) => s.addGroup);
  const removeNode = useQueryStore((s) => s.removeNode);
  const rootGroupId = useQueryStore((s) => s.rootGroupId);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, data: { type: 'group' } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  /* ─── Flashlight hover effect ─── */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    target.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  }, []);

  if (!group) return null;

  const isRoot = id === rootGroupId;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative flex flex-col gap-3 p-4 rounded-2xl transition-all duration-300 flashlight-card",
        "bg-white/60 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]",
        depth === 0
          ? "shadow-[0_1px_3px_hsl(0_0%_63%/0.06),0_4px_6px_hsl(0_0%_63%/0.04)] dark:shadow-[0_1px_3px_hsl(0_0%_5%/0.3)]"
          : "ml-4 shadow-sm",
        isDragging && "opacity-50 z-50 border-blue-400 dark:border-blue-500 shadow-md scale-[1.01]"
      )}
      onMouseMove={handleMouseMove}
    >
      {/* Vertical guide line for nested groups */}
      {depth > 0 && (
        <div className="absolute -left-4 top-0 bottom-0 w-px bg-zinc-200 dark:bg-white/10">
          <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-blue-400/0 via-blue-400/50 to-blue-400/0 animate-beam" />
        </div>
      )}

      {/* Group header */}
      <div className="flex flex-col sm:flex-row sm:items-center items-start justify-between gap-3 relative z-10">
        <div className="flex flex-wrap items-center gap-2">
          {!isRoot && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors hover:scale-110 active:scale-95"
            >
              <GripVertical size={18} />
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/20 rounded-md transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <motion.div
              animate={{ rotate: isCollapsed ? -90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={18} />
            </motion.div>
          </button>

          {/* AND / OR toggle */}
          <div className="flex bg-zinc-100 dark:bg-black/50 p-0.5 rounded-lg border border-zinc-200/50 dark:border-white/10">
            <button
              onClick={() => updateGroupType(id, 'AND')}
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200",
                group.type === 'AND'
                  ? "bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              )}
            >
              AND
            </button>
            <button
              onClick={() => updateGroupType(id, 'OR')}
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200",
                group.type === 'OR'
                  ? "bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              )}
            >
              OR
            </button>
          </div>

          {/* Children count badge */}
          {group.children.length > 0 && (
            <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
              {group.children.length}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-0">
          <button
            onClick={() => addRule(id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-zinc-200 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-lg hover:bg-zinc-50 dark:hover:bg-white/10 hover:border-zinc-300 dark:hover:border-white/20 transition-all shadow-sm hover:shadow hover:scale-[1.02] active:scale-[0.98] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
          >
            <Plus size={16} /> Rule
          </button>
          <button
            onClick={() => addGroup(id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-zinc-200 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-lg hover:bg-zinc-50 dark:hover:bg-white/10 hover:border-zinc-300 dark:hover:border-white/20 transition-all shadow-sm hover:shadow hover:scale-[1.02] active:scale-[0.98] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
          >
            <Layers size={16} /> Group
          </button>
          {!isRoot && (
            <button
              onClick={() => {
                if (group.children.length > 0) {
                  setShowDeleteConfirm(true);
                } else {
                  removeNode(id);
                }
              }}
              className="p-1.5 text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all ml-2 hover:scale-105 active:scale-95"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Children */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-3 overflow-hidden"
          >
            <SortableContext items={group.children} strategy={verticalListSortingStrategy}>
              {group.children.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-zinc-200 dark:border-white/10 rounded-xl flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 gap-2">
                  <p className="text-sm font-medium">No conditions yet</p>
                  <p className="text-xs">Add a rule or group to start building your query</p>
                </div>
              ) : (
                group.children.map((childId) =>
                  childId.startsWith('rule_') ? (
                    <RuleNode key={childId} id={childId} depth={depth + 1} />
                  ) : (
                    <GroupNode key={childId} id={childId} depth={depth + 1} />
                  )
                )
              )}
            </SortableContext>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Group"
        message={`Are you sure you want to delete this group? All ${group.children.length} nested rules and groups will be lost.`}
        confirmLabel="Delete Group"
        onConfirm={() => {
          removeNode(id);
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
});
