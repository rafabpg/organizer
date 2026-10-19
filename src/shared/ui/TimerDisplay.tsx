import { formatDuration } from '@/shared/lib/dates';
import { cn } from './cn';

/** Número grande de timer, ex.: "1:30" */
export function TimerDisplay({ seconds, className }: { seconds: number; className?: string }) {
  return (
    <div className={cn('font-mono text-6xl font-bold tabular-nums tracking-tight', className)}>
      {formatDuration(seconds)}
    </div>
  );
}
