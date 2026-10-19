import { Check, Sparkles } from 'lucide-react';
import type { Exercise } from '@/config/schema';
import { useConfig } from '@/config/useConfig';
import type { SetEntry } from '@/shared/db/db';
import { shortDate } from '@/shared/lib/dates';
import { Card, NumberInput, cn } from '@/shared/ui';
import { reachedThreshold, targetLabel } from './progression';

interface Props {
  exercise: Exercise;
  setCount: number;
  sets: SetEntry[] | undefined;
  last: { date: string; sets: SetEntry[] } | null;
  onChange: (setIndex: number, patch: Partial<SetEntry>) => void;
  onSetDone: () => void; // dispara o timer de descanso
}

/** Um exercício: alvo, "última vez", linhas de séries e aviso de progressão */
export function ExerciseCard({ exercise, setCount, sets, last, onChange, onSetDone }: Props) {
  const { config } = useConfig();
  const isDuration = !exercise.reps;
  const unit = isDuration ? 's' : 'reps';
  const levelUp = reachedThreshold(exercise, sets, config.progressionRule.repsThreshold, setCount);

  const formatSet = (s: SetEntry) =>
    `${s.weight !== undefined ? `${s.weight}kg×` : ''}${s.reps ?? '–'}${isDuration ? 's' : ''}`;

  return (
    <Card className="mb-3">
      <div className="mb-2">
        <h3 className="font-semibold">{exercise.name}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {targetLabel(exercise, setCount)}
          {exercise.equipment && ` · ${exercise.equipment}`}
        </p>
        {last && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Última vez ({shortDate(last.date)}): {last.sets.map(formatSet).join(', ')}
          </p>
        )}
      </div>

      <div className="space-y-2">
        {Array.from({ length: setCount }, (_, i) => {
          const s = sets?.[i] ?? {};
          const prev = last?.sets[i];
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 text-sm text-slate-500">{i + 1}</span>
              <NumberInput
                aria-label={`Peso série ${i + 1}`}
                placeholder={prev?.weight !== undefined ? String(prev.weight) : 'kg'}
                value={s.weight}
                onChange={(v) => onChange(i, { weight: v })}
              />
              <span className="text-xs text-slate-400">kg</span>
              <NumberInput
                aria-label={`${unit} série ${i + 1}`}
                placeholder={prev?.reps !== undefined ? String(prev.reps) : unit}
                value={s.reps}
                onChange={(v) => onChange(i, { reps: v })}
              />
              <span className="w-8 text-xs text-slate-400">{unit}</span>
              <button
                type="button"
                aria-label={`Concluir série ${i + 1}`}
                onClick={() => {
                  // Se deixou em branco, usa os valores da última vez
                  const patch: Partial<SetEntry> = { done: !s.done };
                  if (!s.done) {
                    if (s.weight === undefined && prev?.weight !== undefined) patch.weight = prev.weight;
                    if (s.reps === undefined && prev?.reps !== undefined) patch.reps = prev.reps;
                  }
                  onChange(i, patch);
                  if (!s.done) onSetDone();
                }}
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2',
                  s.done
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-300 text-slate-400 dark:border-slate-600',
                )}
              >
                <Check size={20} strokeWidth={3} />
              </button>
            </div>
          );
        })}
      </div>

      {levelUp && (
        <div className="mt-3 rounded-xl bg-amber-100 p-3 text-sm text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
          <p className="flex items-center gap-1 font-semibold">
            <Sparkles size={16} /> Hora de deixar mais difícil!
          </p>
          <p className="mt-1">Você fez {config.progressionRule.repsThreshold}+ reps em todas as séries. Ideias:</p>
          <ul className="mt-1 list-inside list-disc">
            {config.progressionRule.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
