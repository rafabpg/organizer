import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronRight as Go, Shield } from 'lucide-react';
import { useConfig } from '@/config/useConfig';
import { addDays, daysBetween, fmt } from '@/shared/lib/dates';
import { PERIOD_LABELS } from '@/shared/lib/dayPlan';
import { useToday } from '@/shared/lib/useToday';
import { Button, Card, CardTitle, Checkbox, PageHeader, ProgressBar, cn } from '@/shared/ui';
import { dayStatus, markTaskDone, setMinimum, useDayLog } from './dayLog';
import { buildDayTasks, type DayTask } from './tasks';
import { WeekStrip } from './WeekStrip';

/** Tela "Hoje": checklist do dia + botão de versão mínima */
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
  const counting = plan.filter((t) => t.countsForStreak);
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
            {status === 'minimum' && 'Versão mínima: dia contou ✅'}
            {(status === 'partial' || status === 'missed') && `${doneCount} de ${counting.length} feitas`}
            {status === 'neutral' && 'Nada obrigatório hoje'}
          </span>
        </div>
        <ProgressBar value={counting.length ? doneCount / counting.length : 1} />

        <Button
          variant={log.minimum ? 'primary' : 'secondary'}
          className="mt-3 w-full"
          onClick={() => setMinimum(date, !log.minimum)}
        >
          <Shield size={18} />
          {log.minimum ? 'Versão mínima ativada' : 'Versão mínima (dia ruim)'}
        </Button>
        {log.minimum && (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Hoje vale o mínimo: {config.minimumVersion.runMinutes} min de trote,{' '}
            {config.minimumVersion.setsPerExercise} série por exercício, {config.minimumVersion.pages} páginas. O dia
            conta para a sequência.
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
        {plan.map((t) => (
          <Checkbox
            key={t.id}
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
              </span>
            }
            description={log.minimum && t.minimumDescription ? `Mínimo: ${t.minimumDescription}` : t.description}
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
        ))}
      </Card>
    </>
  );
}
