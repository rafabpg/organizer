import type { RoutineConfig, RunStage } from '@/config/schema';
import { daysBetween, dayKeyOf, weekStart, type ISODate } from './dates';

/**
 * Cálculos de "qual treino/etapa cai em tal dia", todos derivados da config.
 */

/** Módulo que funciona com negativos (datas antes do startDate) */
const mod = (n: number, m: number) => ((n % m) + m) % m;

/**
 * Índice da semana em relação ao startDate da rotação (0 = semana do início).
 * Contado por semanas de calendário (segunda a domingo).
 */
export function rotationWeekIndex(config: RoutineConfig, date: ISODate): number {
  const start = weekStart(config.workoutRotation.startDate);
  return Math.floor(daysBetween(start, weekStart(date)) / 7);
}

/**
 * Qual treino (ex.: "A" ou "B") cai na data, ou null se não é dia de treino.
 * Ex.: pattern [["A","B","A"],["B","A","B"]] e workoutDays [mon,wed,fri]:
 * semana 0 → seg A, qua B, sex A; semana 1 → seg B, qua A, sex B; repete.
 */
export function workoutForDate(config: RoutineConfig, date: ISODate): string | null {
  const { workoutDays, pattern } = config.workoutRotation;
  const idx = workoutDays.indexOf(dayKeyOf(date));
  if (idx === -1) return null;
  const row = pattern[mod(rotationWeekIndex(config, date), pattern.length)];
  return row[idx % row.length] ?? null;
}

export interface RunStageInfo {
  week: number; // semana do programa (1, 2, 3...). <1 = ainda não começou
  stageIndex: number;
  stage: RunStage;
  started: boolean;
}

/** Etapa do trote para a data, a partir do run.startDate */
export function runStageForDate(config: RoutineConfig, date: ISODate): RunStageInfo {
  const diff = daysBetween(config.run.startDate, date);
  const week = Math.floor(diff / 7) + 1;
  const stages = config.run.stages;
  // Antes de começar, mostra a primeira etapa; depois da última, mantém a última
  let stageIndex = stages.findIndex((s) => week >= s.weeks[0] && week <= s.weeks[1]);
  if (stageIndex === -1) stageIndex = week < 1 ? 0 : stages.length - 1;
  return { week, stageIndex, stage: stages[stageIndex], started: diff >= 0 };
}

export interface IntervalSegment {
  kind: 'run' | 'walk';
  seconds: number;
}

/**
 * Monta a sequência de blocos trotar/caminhar até completar o tempo total.
 * O último bloco é cortado se passar do total.
 */
export function buildIntervals(stage: RunStage, totalMinutes: number): IntervalSegment[] {
  const total = Math.round(totalMinutes * 60);
  const segments: IntervalSegment[] = [];
  let elapsed = 0;
  if (stage.walkSeconds === 0) return [{ kind: 'run', seconds: total }];
  while (elapsed < total) {
    for (const seg of [
      { kind: 'run' as const, seconds: stage.runSeconds },
      { kind: 'walk' as const, seconds: stage.walkSeconds },
    ]) {
      if (elapsed >= total) break;
      const seconds = Math.min(seg.seconds, total - elapsed);
      segments.push({ kind: seg.kind, seconds });
      elapsed += seconds;
    }
  }
  return segments;
}
