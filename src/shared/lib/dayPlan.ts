import type { Period, PlanTask, RoutineConfig } from '@/config/schema';
import { dayKeyOf, type ISODate } from './dates';

/**
 * Leitura do "plano do dia" a partir da config. Usado por várias features
 * (Hoje, Leitura), por isso fica em shared.
 */

export const PERIOD_LABELS: Record<Period, string> = {
  morning: 'Manhã',
  afternoon: 'Tarde',
  night: 'Noite',
};

/** Tarefas do weeklyPlan para a data */
export function planForDate(config: RoutineConfig, date: ISODate): PlanTask[] {
  return config.weeklyPlan[dayKeyOf(date)] ?? [];
}

/** Meta de páginas do dia: pagesGoal da tarefa ou a meta diária padrão */
export function readingGoalFor(config: RoutineConfig, date: ISODate): number {
  const task = planForDate(config, date).find((t) => t.type === 'reading');
  return task?.pagesGoal ?? config.reading.dailyPagesGoal;
}

export interface RunPlan {
  totalMinutes: number;
  variantLabel?: string;
}

/** Corrida planejada para a data, já somando minutos da variante (ex.: mais longa) */
export function runPlanFor(config: RoutineConfig, date: ISODate): RunPlan {
  const task = planForDate(config, date).find((t) => t.type === 'run');
  const variant = task?.variant ? config.run.variants[task.variant] : undefined;
  return {
    totalMinutes: config.run.defaultMinutes + (variant?.extraMinutes ?? 0),
    variantLabel: variant?.label,
  };
}
