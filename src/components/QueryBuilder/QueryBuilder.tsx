'use client';

import React, { useState } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useQueryStore } from '@/lib/store';
import { GroupNode } from './GroupNode';
import { RuleNode } from './RuleNode';

export function QueryBuilder() {
  const { rootGroupId, groups, rules, moveNode } = useQueryStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      // Find the group of the 'over' item
      let targetGroupId: string | null = null;
      let insertIndex = 0;

      if (groups[over.id as string]) {
        // Dropped onto a group itself
        targetGroupId = over.id as string;
        insertIndex = groups[targetGroupId].children.length;
      } else {
        // Dropped onto an item (rule or group) within a group
        for (const group of Object.values(groups)) {
          const index = group.children.indexOf(over.id as string);
          if (index !== -1) {
            targetGroupId = group.id;
            // Determine if dropping above or below
            // For simplicity, we just insert at the index. 
            // A more complex implementation would look at coordinates to see if it's top/bottom half.
            insertIndex = index;
            break;
          }
        }
      }

      if (targetGroupId) {
        moveNode(active.id as string, targetGroupId, insertIndex);
      }
    }
  };

  const dropAnimationConfig = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.4',
        },
      },
    }),
  };

  return (
    <div className="w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <GroupNode id={rootGroupId} depth={0} />

        <DragOverlay dropAnimation={dropAnimationConfig}>
          {activeId ? (
            activeId.startsWith('rule_') ? 
              <div className="opacity-90 shadow-xl"><RuleNode id={activeId} depth={0} /></div> : 
              <div className="opacity-90 shadow-xl"><GroupNode id={activeId} depth={0} /></div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
