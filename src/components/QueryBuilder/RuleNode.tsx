import React, { useCallback, memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useQueryStore } from '@/lib/store';
import { getSchemaById } from '@/lib/schema';
import { RuleId, RuleOperator } from '@/lib/types';
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
    { label: 'Ends With', value: 'endsWith' },
    { label: 'Regex', value: 'regex' },
    { label: 'In List', value: 'inList' },
    { label: 'Is Null', value: 'isNull' },
    { label: 'Is Not Null', value: 'isNotNull' },
  ],
  number: [
    { label: 'Equals', value: 'equals' },
    { label: 'Not Equals', value: 'notEquals' },
    { label: 'Greater Than', value: 'greaterThan' },
    { label: 'Greater Than or Equal (>=)', value: 'greaterThanOrEquals' },
    { label: 'Less Than', value: 'lessThan' },
    { label: 'Less Than or Equal (<=)', value: 'lessThanOrEquals' },
    { label: 'Between', value: 'between' },
    { label: 'In List', value: 'inList' },
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
    { label: 'Greater Than or Equal (>=)', value: 'greaterThanOrEquals' },
    { label: 'Less Than', value: 'lessThan' },
    { label: 'Less Than or Equal (<=)', value: 'lessThanOrEquals' },
    { label: 'Between', value: 'between' },
    { label: 'In List', value: 'inList' },
    { label: 'Is Null', value: 'isNull' },
    { label: 'Is Not Null', value: 'isNotNull' },
  ],
  boolean: [
    { label: 'Equals', value: 'equals' },
  ],
};

const inputBaseClass =
  "px-3 py-1.5 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-lg text-sm text-slate-700 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all hover:bg-zinc-100 dark:hover:bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]";

export const RuleNode = memo(function RuleNode({ id, depth }: RuleNodeProps) {
  const rule = useQueryStore((s) => s.rules[id]);
  const updateRule = useQueryStore((s) => s.updateRule);
  const removeNode = useQueryStore((s) => s.removeNode);
  const activeSchemaId = useQueryStore((s) => s.activeSchemaId);
  const schema = getSchemaById(activeSchemaId);

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

  /* ─── Flashlight hover effect ─── */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    target.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  }, []);

  if (!rule) return null;

  const fieldSchema = schema[rule.field];
  const validOperators = operatorsByFieldType[fieldSchema?.type || 'string'] || operatorsByFieldType['string'];

  const error = validateRule(rule, schema);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 rounded-xl shadow-sm group transition-all duration-200 flashlight-card",
        "bg-white dark:bg-[#0a0a0a] border shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
        isDragging
          ? "opacity-50 z-50 border-blue-400 dark:border-blue-500 shadow-md scale-[1.02]"
          : "border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-md",
        error && "border-red-300 dark:border-red-500/50"
      )}
      onMouseMove={handleMouseMove}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-all z-10 hover:scale-110 active:scale-95"
      >
        <GripVertical size={18} />
      </div>

      {/* Rule inputs */}
      <div className="flex-1 flex flex-wrap gap-2 z-10 relative">
        {/* Field selector */}
        <select
          value={rule.field}
          onChange={(e) => {
            const newField = e.target.value;
            const newFieldSchema = schema[newField];
            const newOps = operatorsByFieldType[newFieldSchema.type] || operatorsByFieldType['string'];
            // Reset operator and value if field changes
            updateRule(id, {
              field: newField,
              operator: newOps[0].value,
              value: '',
            });
          }}
          className={cn(inputBaseClass, "font-medium min-w-[130px]")}
        >
          {Object.values(schema).map((f) => (
            <option key={f.name} value={f.name}>
              {f.label}
            </option>
          ))}
        </select>

        {/* Operator selector */}
        <select
          value={rule.operator}
          onChange={(e) => updateRule(id, { operator: e.target.value as RuleOperator })}
          className={cn(inputBaseClass, "min-w-[130px]")}
        >
          {validOperators.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>

        {/* Value inputs — context-aware rendering */}
        {rule.operator !== 'isNull' && rule.operator !== 'isNotNull' && (
          <div className="flex gap-2 flex-1 min-w-[140px]">
            {fieldSchema.type === 'enum' && fieldSchema.options ? (
              <select
                value={rule.value === null ? '' : String(rule.value)}
                onChange={(e) => updateRule(id, { value: e.target.value })}
                className={cn(inputBaseClass, "flex-1")}
              >
                <option value="">Select an option</option>
                {fieldSchema.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : fieldSchema.type === 'boolean' ? (
              <select
                value={String(rule.value)}
                onChange={(e) => updateRule(id, { value: e.target.value === 'true' })}
                className={cn(inputBaseClass, "flex-1")}
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            ) : (
              <input
                type={
                  fieldSchema.type === 'number'
                    ? 'number'
                    : fieldSchema.type === 'date'
                    ? 'date'
                    : 'text'
                }
                value={rule.value === null ? '' : String(rule.value)}
                onChange={(e) => updateRule(id, { value: e.target.value })}
                placeholder="Enter value..."
                className={cn(inputBaseClass, "flex-1 placeholder:text-zinc-400 dark:placeholder:text-zinc-500")}
              />
            )}

            {rule.operator === 'between' && (
              <>
                <span className="flex items-center text-xs text-zinc-400 font-medium">
                  AND
                </span>
                <input
                  type={
                    fieldSchema.type === 'number'
                      ? 'number'
                      : fieldSchema.type === 'date'
                      ? 'date'
                      : 'text'
                  }
                  value={rule.value2 === null || rule.value2 === undefined ? '' : String(rule.value2)}
                  onChange={(e) => updateRule(id, { value2: e.target.value })}
                  placeholder="And..."
                  className={cn(inputBaseClass, "flex-1 placeholder:text-zinc-400 dark:placeholder:text-zinc-500")}
                />
              </>
            )}
          </div>
        )}
      </div>

      {/* Delete button */}
      <button
        onClick={() => removeNode(id)}
        className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all z-10 hover:scale-105 active:scale-95"
        title="Remove condition"
      >
        <Trash2 size={16} />
      </button>

      {/* Validation error */}
      {error && (
        <div className="absolute -bottom-5 left-10 text-xs text-red-500 dark:text-red-400 whitespace-nowrap z-20">
          {error}
        </div>
      )}
    </div>
  );
});
