import React, { useRef, useEffect, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useQueryStore } from '@/lib/store';
import { mockSchema } from '@/lib/schema';
import { RuleId, RuleOperator, SchemaField } from '@/lib/types';
import { GripVertical, Trash2 } from 'lucide-react';
import { validateRule } from '@/lib/engine';
import { cn } from '@/lib/utils';

interface RuleNodeProps {
  id: RuleId;
  depth: number;
}

const operatorsByFieldType: Record<string, { label: string; value: RuleOperator }[]> = {
  string: [
    { label: 'Equals', value: 'equals' },
    { label: 'Not Equals', value: 'notEquals' },
    { label: 'Contains', value: 'contains' },
    { label: 'Starts With', value: 'startsWith' },
    { label: 'Is Null', value: 'isNull' },
    { label: 'Is Not Null', value: 'isNotNull' },
  ],
  number: [
    { label: 'Equals', value: 'equals' },
    { label: 'Not Equals', value: 'notEquals' },
    { label: 'Greater Than', value: 'greaterThan' },
    { label: 'Less Than', value: 'lessThan' },
    { label: 'Between', value: 'between' },
    { label: 'Is Null', value: 'isNull' },
    { label: 'Is Not Null', value: 'isNotNull' },
  ],
  enum: [
    { label: 'Equals', value: 'equals' },
    { label: 'Not Equals', value: 'notEquals' },
    { label: 'In List', value: 'inList' },
    { label: 'Is Null', value: 'isNull' },
    { label: 'Is Not Null', value: 'isNotNull' },
  ],
  date: [
    { label: 'Equals', value: 'equals' },
    { label: 'Greater Than', value: 'greaterThan' },
    { label: 'Less Than', value: 'lessThan' },
    { label: 'Between', value: 'between' },
    { label: 'Is Null', value: 'isNull' },
    { label: 'Is Not Null', value: 'isNotNull' },
  ],
  boolean: [
    { label: 'Equals', value: 'equals' },
  ]
};

export function RuleNode({ id, depth }: RuleNodeProps) {
  const { rules, updateRule, removeNode } = useQueryStore();
  const rule = rules[id];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, data: { type: 'rule' } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  if (!rule) return null;

  const fieldSchema = mockSchema[rule.field];
  const validOperators = operatorsByFieldType[fieldSchema?.type || 'string'] || operatorsByFieldType['string'];
  
  const error = validateRule(rule, mockSchema);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative flex items-center gap-3 p-3 bg-white border rounded-xl shadow-sm group transition-all duration-200",
        isDragging ? "opacity-50 z-50 border-blue-400 shadow-md scale-[1.02]" : "border-zinc-200 hover:border-zinc-300 hover:shadow-md",
        error ? "border-red-300" : ""
      )}
      onMouseMove={handleMouseMove}
    >
      {/* Dynamic Hover Illumination */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
        style={{
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(244, 244, 245, 0.5), transparent 40%)`
        }}
      />

      <div 
        {...attributes} 
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-zinc-400 hover:text-zinc-600 transition-colors z-10"
      >
        <GripVertical size={18} />
      </div>

      <div className="flex-1 flex flex-wrap gap-2 z-10 relative">
        <select
          value={rule.field}
          onChange={(e) => {
            const newField = e.target.value;
            const newFieldSchema = mockSchema[newField];
            const newOps = operatorsByFieldType[newFieldSchema.type] || operatorsByFieldType['string'];
            // Reset operator and value if field changes
            updateRule(id, { 
              field: newField, 
              operator: newOps[0].value,
              value: '' 
            });
          }}
          className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:bg-zinc-100"
        >
          {Object.values(mockSchema).map((f) => (
            <option key={f.name} value={f.name}>{f.label}</option>
          ))}
        </select>

        <select
          value={rule.operator}
          onChange={(e) => updateRule(id, { operator: e.target.value as RuleOperator })}
          className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:bg-zinc-100 min-w-[120px]"
        >
          {validOperators.map((op) => (
            <option key={op.value} value={op.value}>{op.label}</option>
          ))}
        </select>

        {rule.operator !== 'isNull' && rule.operator !== 'isNotNull' && (
          <div className="flex gap-2 flex-1">
            {fieldSchema.type === 'enum' && fieldSchema.options ? (
              <select
                value={rule.value}
                onChange={(e) => updateRule(id, { value: e.target.value })}
                className="flex-1 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">Select an option</option>
                {fieldSchema.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : fieldSchema.type === 'boolean' ? (
               <select
                 value={rule.value}
                 onChange={(e) => updateRule(id, { value: e.target.value === 'true' })}
                 className="flex-1 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
               >
                 <option value="true">True</option>
                 <option value="false">False</option>
               </select>
            ) : (
              <input
                type={fieldSchema.type === 'number' ? 'number' : fieldSchema.type === 'date' ? 'date' : 'text'}
                value={rule.value}
                onChange={(e) => updateRule(id, { value: e.target.value })}
                placeholder="Enter value..."
                className="flex-1 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-zinc-400"
              />
            )}
            
            {rule.operator === 'between' && (
              <input
                type={fieldSchema.type === 'number' ? 'number' : fieldSchema.type === 'date' ? 'date' : 'text'}
                value={rule.value2 || ''}
                onChange={(e) => updateRule(id, { value2: e.target.value })}
                placeholder="And..."
                className="flex-1 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-zinc-400"
              />
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => removeNode(id)}
        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors z-10"
        title="Remove condition"
      >
        <Trash2 size={16} />
      </button>

      {error && (
        <div className="absolute -bottom-5 left-10 text-xs text-red-500 whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
}
