import React, { useState } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useQueryStore } from '@/lib/store';
import { GroupId } from '@/lib/types';
import { RuleNode } from './RuleNode';
import { GripVertical, Plus, Trash2, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

interface GroupNodeProps {
  id: GroupId;
  depth: number;
}

export function GroupNode({ id, depth }: GroupNodeProps) {
  const { groups, updateGroupType, addRule, addGroup, removeNode, rootGroupId } = useQueryStore();
  const group = groups[id];
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  if (!group) return null;

  const isRoot = id === rootGroupId;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative flex flex-col gap-3 p-4 bg-white/50 border rounded-2xl transition-all duration-300",
        depth === 0 ? "border-zinc-200 shadow-sm" : "border-zinc-200/60 ml-4",
        isDragging ? "opacity-50 z-50 border-blue-400 shadow-md scale-[1.01]" : ""
      )}
    >
      {/* Container guide line for nested groups */}
      {depth > 0 && (
        <div className="absolute -left-4 top-0 bottom-0 w-px bg-zinc-200">
           <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-blue-400/0 via-blue-400/50 to-blue-400/0 animate-beam" />
        </div>
      )}

      <div className="flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2">
          {!isRoot && (
            <div 
              {...attributes} 
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <GripVertical size={18} />
            </div>
          )}
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-zinc-500 hover:bg-zinc-100 rounded-md transition-colors"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
          </button>

          <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/50">
            <button
              onClick={() => updateGroupType(id, 'AND')}
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                group.type === 'AND' ? "bg-white text-blue-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              AND
            </button>
            <button
              onClick={() => updateGroupType(id, 'OR')}
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                group.type === 'OR' ? "bg-white text-blue-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              OR
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => addRule(id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm"
          >
            <Plus size={16} /> Rule
          </button>
          <button
            onClick={() => addGroup(id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm"
          >
            <Layers size={16} /> Group
          </button>
          {!isRoot && (
            <button
              onClick={() => removeNode(id)}
              className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3 overflow-hidden"
          >
            <SortableContext items={group.children} strategy={verticalListSortingStrategy}>
              {group.children.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-zinc-200 rounded-xl flex flex-col items-center justify-center text-zinc-400 gap-2">
                   <p className="text-sm font-medium">No conditions yet</p>
                   <p className="text-xs">Add a rule or group to start building your query</p>
                </div>
              ) : (
                group.children.map(childId => (
                  childId.startsWith('rule_') ? 
                    <RuleNode key={childId} id={childId} depth={depth + 1} /> : 
                    <GroupNode key={childId} id={childId} depth={depth + 1} />
                ))
              )}
            </SortableContext>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
