import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from './cn';

interface CheckboxProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  right?: ReactNode; // conteúdo extra à direita (ex.: link)
}

/** Linha de checklist grande, fácil de tocar no celular */
export function Checkbox({ checked, onChange, label, description, disabled, right }: CheckboxProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled || !onChange}
        onClick={() => onChange?.(!checked)}
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition-colors',
          checked
            ? 'border-emerald-600 bg-emerald-600 text-white'
            : 'border-slate-300 dark:border-slate-600',
          !onChange && 'opacity-60',
        )}
      >
        {checked && <Check size={18} strokeWidth={3} />}
      </button>
      <div className="min-w-0 flex-1">
        <div className={cn('font-medium', checked && 'text-slate-400 line-through')}>{label}</div>
        {description && <div className="text-sm text-slate-500 dark:text-slate-400">{description}</div>}
      </div>
      {right}
    </div>
  );
}
