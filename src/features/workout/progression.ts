import type { Exercise } from '@/config/schema';
import type { SetEntry } from '@/shared/db/db';

/**
 * Regra de progressão: se TODAS as séries previstas chegaram a
 * `repsThreshold` repetições, está na hora de deixar o exercício mais difícil.
 * Exercícios por tempo (prancha) não entram na regra.
 */
export function reachedThreshold(exercise: Exercise, sets: SetEntry[] | undefined, threshold: number, setCount: number) {
  if (!exercise.reps || !sets) return false;
  const relevant = sets.slice(0, setCount);
  return relevant.length === setCount && relevant.every((s) => (s.reps ?? 0) >= threshold);
}

/** Texto do alvo, ex.: "3 × 12-15 reps (cada lado)" */
export function targetLabel(exercise: Exercise, setCount: number) {
  const target = exercise.reps
    ? exercise.reps === 'max'
      ? 'máx. reps'
      : `${exercise.reps} reps`
    : `${exercise.durationSeconds}s`;
  return `${setCount} × ${target}${exercise.perSide ? ' (cada lado)' : ''}`;
}
