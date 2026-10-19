import type { Period, PlanTask, RoutineConfig } from '@/config/schema';
import { dayKeyOf, type ISODate } from './dates';
import { runStageForDate, type RunStageInfo } from './rotation';

/**
 * Leitura do "plano do dia" a partir da config. Usado por várias features
 * (Hoje, Trote, Leitura), por isso fica em shared.
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

export interface RunPlan extends RunStageInfo {
  totalMinutes: number;
  variantLabel?: string;
}

/** Trote planejado para a data, já somando minutos da variante (ex.: longão) */
export function runPlanFor(config: RoutineConfig, date: ISODate): RunPlan {
  const info = runStageForDate(config, date);
  const task = planForDate(config, date).find((t) => t.type === 'run');
  const variant = task?.variant ? config.run.variants[task.variant] : undefined;
  return {
    ...info,
    totalMinutes: info.stage.totalMinutes + (variant?.extraMinutes ?? 0),
    variantLabel: variant?.label,
  };
}

/** 60 -> "1 min", 90 -> "1min30s", 45 -> "45s" */
export function humanSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m} min`;
  return `${m}min${String(s).padStart(2, '0')}s`;
}

/** Descrição curta da etapa, ex.: "1 min trotando / 2 min caminhando" */
export function describeStage(info: RunStageInfo): string {
  const { runSeconds, walkSeconds } = info.stage;
  if (walkSeconds === 0) return 'Trote contínuo';
  return `${humanSeconds(runSeconds)} trotando / ${humanSeconds(walkSeconds)} caminhando`;
}
