import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Pause, Play, RotateCcw, Save, Trash2 } from 'lucide-react';
import { useConfig } from '@/config/useConfig';
import { markTaskDone, useDayLog } from '@/features/today';
import { db } from '@/shared/db/db';
import { alertUser, unlockAudio } from '@/shared/lib/alerts';
import { fmt, formatDuration, shortDate } from '@/shared/lib/dates';
import { describeStage, humanSeconds, runPlanFor } from '@/shared/lib/dayPlan';
import { buildIntervals } from '@/shared/lib/rotation';
import { useToday } from '@/shared/lib/useToday';
import { useWakeLock } from '@/shared/lib/useWakeLock';
import { Button, Card, CardTitle, Field, NumberInput, PageHeader, ProgressBar, TimerDisplay, cn } from '@/shared/ui';
import { useIntervalTimer } from './useIntervalTimer';

/** Tela "Trote": etapa atual do programa + timer de intervalos */
export function RunPage() {
  const { config } = useConfig();
  const today = useToday();
  const { minimum } = useDayLog(today);
  const plan = runPlanFor(config, today);
  const totalMinutes = minimum ? config.minimumVersion.runMinutes : plan.totalMinutes;

  const segments = useMemo(() => buildIntervals(plan.stage, totalMinutes), [plan.stage, totalMinutes]);
  const timer = useIntervalTimer(segments, {
    onSwitch: () => alertUser('switch'),
    onFinish: () => alertUser('end'),
  });
  useWakeLock(timer.running);

  const runs = useLiveQuery(() => db.runs.orderBy('date').reverse().limit(10).toArray(), []);
  const [manualMinutes, setManualMinutes] = useState<number | undefined>();

  const save = async (seconds: number) => {
    if (seconds <= 0) return;
    await db.runs.add({ date: today, durationSeconds: Math.round(seconds), stageIndex: plan.stageIndex });
    await markTaskDone(today, 'run', true);
    timer.reset();
    setManualMinutes(undefined);
  };

  const isRun = timer.current?.kind === 'run';

  return (
    <>
      <PageHeader title="Trote" subtitle={fmt(today, "EEEE, d 'de' MMMM")} />

      <Card className="mb-4">
        <CardTitle>
          Etapa {plan.stageIndex + 1} de {config.run.stages.length}
        </CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {plan.started
            ? `Semana ${plan.week} do programa`
            : `O programa começa em ${fmt(config.run.startDate, "d 'de' MMMM")}`}
        </p>
        <p className="mt-1 font-medium">{describeStage(plan)}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Total: {totalMinutes} min
          {minimum && ' (versão mínima)'}
          {!minimum && plan.variantLabel && ` (${plan.variantLabel})`}
        </p>
      </Card>

      {/* Timer de intervalos */}
      <Card
        className={cn(
          'mb-4 text-center transition-colors',
          timer.started && !timer.finished && (isRun ? '!bg-orange-50 dark:!bg-orange-950' : '!bg-sky-50 dark:!bg-sky-950'),
        )}
      >
        <p
          className={cn(
            'text-xl font-bold uppercase tracking-wide',
            isRun ? 'text-orange-600 dark:text-orange-400' : 'text-sky-600 dark:text-sky-400',
          )}
        >
          {timer.finished ? 'Concluído! 🎉' : isRun ? 'Trotar' : 'Caminhar'}
        </p>
        <TimerDisplay seconds={timer.finished ? 0 : timer.segmentRemaining} className="my-2" />
        {timer.next && !timer.finished && (
          <p className="text-sm text-slate-500">
            Depois: {timer.next.kind === 'run' ? 'trotar' : 'caminhar'} {humanSeconds(timer.next.seconds)}
          </p>
        )}
        <ProgressBar value={timer.elapsedSeconds / timer.totalSeconds} className="my-3" />
        <p className="text-sm text-slate-500">
          {formatDuration(timer.elapsedSeconds)} / {formatDuration(timer.totalSeconds)} · bloco {timer.index + 1} de{' '}
          {segments.length}
        </p>

        <div className="mt-4 flex gap-2">
          {!timer.finished && (
            <Button
              size="lg"
              className="flex-1"
              onClick={() => {
                unlockAudio(); // necessário para tocar som no iPhone
                if (timer.running) timer.pause();
                else timer.start();
              }}
            >
              {timer.running ? <Pause size={20} /> : <Play size={20} />}
              {timer.running ? 'Pausar' : timer.started ? 'Continuar' : 'Começar'}
            </Button>
          )}
          {timer.started && (
            <>
              <Button size="lg" variant="secondary" className="px-3" aria-label="Recomeçar" onClick={timer.reset}>
                <RotateCcw size={20} />
              </Button>
              <Button
                size="lg"
                variant={timer.finished ? 'primary' : 'secondary'}
                className={cn('px-3', timer.finished && 'flex-1')}
                onClick={() => save(timer.elapsedSeconds)}
              >
                <Save size={20} /> Salvar
              </Button>
            </>
          )}
        </div>
      </Card>

      <Card className="mb-4">
        <CardTitle>Registrar manualmente</CardTitle>
        <div className="flex items-end gap-2">
          <Field label="Minutos">
            <NumberInput value={manualMinutes} onChange={setManualMinutes} placeholder={String(totalMinutes)} />
          </Field>
          <Button onClick={() => save((manualMinutes ?? 0) * 60)} disabled={!manualMinutes}>
            Salvar
          </Button>
        </div>
      </Card>

      <Card>
        <CardTitle>Últimos trotes</CardTitle>
        {!runs?.length && <p className="text-sm text-slate-500">Nenhum registro ainda.</p>}
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {runs?.map((r) => (
            <li key={r.id} className="flex items-center justify-between py-2 text-sm">
              <span>
                {shortDate(r.date)} · etapa {r.stageIndex + 1}
              </span>
              <span className="flex items-center gap-2">
                <span className="font-mono">{formatDuration(r.durationSeconds)}</span>
                <button aria-label="Apagar registro" className="p-1 text-slate-400" onClick={() => db.runs.delete(r.id!)}>
                  <Trash2 size={16} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
