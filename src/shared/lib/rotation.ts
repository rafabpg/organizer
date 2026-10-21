import type { RoutineConfig } from '@/config/schema';
import { daysBetween, dayKeyOf, weekStart, type ISODate } from './dates';

/**
 * Cálculos de "qual treino cai em tal dia", todos derivados da config.
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
