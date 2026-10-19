import { cn } from './cn';

/** Abas simples (segmented control) */
export function Tabs<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <div className="mb-4 flex rounded-xl bg-slate-200 p-1 dark:bg-slate-800">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
            value === o.value
              ? 'bg-white shadow dark:bg-slate-950'
              : 'text-slate-600 dark:text-slate-400',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
