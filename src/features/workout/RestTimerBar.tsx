import { Pause, Play, Timer, X } from 'lucide-react';
import { formatDuration } from '@/shared/lib/dates';
import { Button, cn } from '@/shared/ui';
import type { useCountdown } from '@/shared/lib/useCountdown';

interface Props {
  timer: ReturnType<typeof useCountdown>;
  options: number[]; // restSeconds da config
  selected: number;
  onSelect: (seconds: number) => void;
}

/**
 * Barra fixa acima da navegação com o timer de descanso.
 * Escolha 60/90s; o timer começa sozinho ao concluir uma série.
 */
export function RestTimerBar({ timer, options, selected, onSelect }: Props) {
  const active = timer.running || timer.paused;
  return (
    <div className="fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-10 px-4">
      <div
        className={cn(
          'mx-auto flex max-w-lg items-center gap-2 rounded-2xl px-3 py-2 shadow-lg',
          active ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800',
        )}
      >
        <Timer size={20} className="shrink-0" />
        {active ? (
          <>
            <span className="flex-1 font-mono text-2xl font-bold tabular-nums">
              {formatDuration(timer.remainingSeconds)}
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-emerald-700"
              aria-label={timer.paused ? 'Continuar' : 'Pausar'}
              onClick={timer.paused ? timer.resume : timer.pause}
            >
              {timer.paused ? <Play size={18} /> : <Pause size={18} />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-emerald-700"
              aria-label="Parar descanso"
              onClick={timer.stop}
            >
              <X size={18} />
            </Button>
          </>
        ) : (
          <>
            <span className="flex-1 text-sm">Descanso</span>
            {options.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={s === selected ? 'primary' : 'secondary'}
                onClick={() => {
                  onSelect(s);
                  timer.start(s);
                }}
              >
                {s}s
              </Button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
