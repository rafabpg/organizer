import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronRight as Go, HeartPulse, Shield } from 'lucide-react';
import { useConfig } from '@/config/useConfig';
import { addDays, daysBetween, fmt } from '@/shared/lib/dates';
import { PERIOD_LABELS } from '@/shared/lib/dayPlan';
import { useToday } from '@/shared/lib/useToday';
import { Button, Card, CardTitle, Checkbox, PageHeader, ProgressBar, cn } from '@/shared/ui';
import { dayStatus, isPhysicalTask, markTaskDone, setMinimum, setRecovery, useDayLog } from './dayLog';
import { buildDayTasks, type DayTask } from './tasks';
import { WeekStrip } from './WeekStrip';

/** Tela "Hoje": checklist do dia + botão de versão mínima e dia de recuperação */
export function TodayPage() {
  const { config } = useConfig();
  const today = useToday();
  // Permite navegar para dias anteriores (ex.: marcar algo que esqueceu ontem)
  const [offset, setOffset] = useState(0);
  const date = addDays(today, offset);

  const log = useDayLog(date);
  const tasks = buildDayTasks(config, date);
  const schedule = tasks.filter((t) => t.kind === 'schedule');
  const plan = tasks.filter((t) => t.kind === 'plan');
  const allCounting = plan.filter((t) => t.countsForStreak);
  const counting = log.recovery ? allCounting.filter((t) => !isPhysicalTask(t)) : allCounting;
  const doneCount = counting.filter((t) => log.done[t.id]).length;
  const status = dayStatus(config, date, log);

  const toggle = (t: DayTask) => markTaskDone(date, t.id, !log.done[t.id]);

  return (
    <>
      <PageHeader
        title={offset === 0 ? 'Hoje' : offset === -1 ? 'Ontem' : fmt(date, 'dd/MM')}
        subtitle={fmt(date, "EEEE, d 'de' MMMM")}
        action={
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" aria-label="Dia anterior" onClick={() => setOffset(offset - 1)}>
              <ChevronLeft size={20} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Próximo dia"
              disabled={offset >= 0}
              onClick={() => setOffset(offset + 1)}
            >
              <ChevronRight size={20} />
            </Button>
          </div>
        }
      />

      <WeekStrip date={date} today={today} onSelect={(d) => setOffset(Math.min(0, daysBetween(today, d)))} />

      {/* Resumo do progresso do dia */}
      <Card className="mb-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">
            {status === 'done' && 'Dia cumprido! 🎉'}
            {status === 'recovery' && 'Dia de recuperação cumprido! 💙'}
            {status === 'minimum' && 'Versão mínima: dia contou ✅'}
            {(status === 'partial' || status === 'missed') &&
              `${doneCount} de ${counting.length} feitas${log.recovery ? ' (treino/corrida dispensados)' : ''}`}
            {status === 'neutral' && 'Nada obrigatório hoje'}
          </span>
        </div>
        <ProgressBar value={counting.length ? doneCount / counting.length : 1} />

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button
            variant={log.minimum ? 'primary' : 'secondary'}
            className="w-full text-xs sm:text-sm"
            onClick={() => setMinimum(date, !log.minimum)}
          >
            <Shield size={17} />
            {log.minimum ? 'Mínimo ativo' : 'Versão mínima'}
          </Button>
          <Button
            variant={log.recovery ? 'primary' : 'secondary'}
            className={cn(
              'w-full text-xs sm:text-sm',
              log.recovery && 'bg-sky-600 hover:bg-sky-700 active:bg-sky-800',
            )}
            onClick={() => setRecovery(date, !log.recovery)}
          >
            <HeartPulse size={17} />
            {log.recovery ? 'Em recuperação' : 'Recuperação (dor)'}
          </Button>
        </div>

        {log.minimum && (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Hoje vale o mínimo: {config.minimumVersion.runMinutes} min de corrida,{' '}
            {config.minimumVersion.setsPerExercise} série por exercício, {config.minimumVersion.pages} páginas. O dia
            conta para a sequência.
          </p>
        )}
        {log.recovery && (
          <p className="mt-2 text-sm text-sky-700 dark:text-sky-300">
            Dia de recuperação ativo: treino e corrida estão dispensados hoje por conta da dor muscular, sem quebrar sua
            sequência.
          </p>
        )}
      </Card>

      {schedule.length > 0 && (
        <Card className="mb-4">
          <CardTitle>Agenda</CardTitle>
          {schedule.map((t) => (
            <Checkbox
              key={t.id}
              checked={!!log.done[t.id]}
              onChange={() => toggle(t)}
              label={t.title}
              description={t.time}
            />
          ))}
        </Card>
      )}

      <Card>
        <CardTitle>Plano do dia</CardTitle>
        {plan.length === 0 && <p className="text-sm text-slate-500">Nada planejado.</p>}
        {plan.map((t) => {
          const exempted = !!log.recovery && isPhysicalTask(t);
          return (
            <div key={t.id} className={cn(exempted && 'opacity-60')}>
              <Checkbox
                checked={!!log.done[t.id]}
                onChange={t.countsForStreak ? () => toggle(t) : undefined}
                label={
                  <span>
                    {t.title}
                    {t.period && (
                      <span className="ml-2 rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-normal text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {PERIOD_LABELS[t.period]}
                      </span>
                    )}
                    {exempted && (
                      <span className="ml-2 rounded-md bg-sky-100 px-1.5 py-0.5 text-xs font-normal text-sky-800 dark:bg-sky-900/60 dark:text-sky-200">
                        Dispensado
                      </span>
                    )}
                  </span>
                }
                description={
                  exempted
                    ? 'Dispensado hoje (recuperação muscular)'
                    : log.minimum && t.minimumDescription
                      ? `Mínimo: ${t.minimumDescription}`
                      : t.description
                }
                right={
                  t.link && (
                    <Link
                      to={t.link}
                      className={cn('rounded-lg p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800')}
                      aria-label={`Abrir ${t.title}`}
                    >
                      <Go size={20} />
                    </Link>
                  )
                }
              />
            </div>
          );
        })}
      </Card>
    </>
  );
}
