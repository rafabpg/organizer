import { useLiveQuery } from 'dexie-react-hooks';
import { db, type SetEntry, type WorkoutSession } from '@/shared/db/db';
import type { ISODate } from '@/shared/lib/dates';

/**
 * Persistência das sessões de treino.
 * Cada combinação dia + treino vira uma sessão com id "AAAA-MM-DD:A".
 * Os campos são salvos a cada alteração (não existe botão "salvar").
 */

export const sessionId = (date: ISODate, workout: string) => `${date}:${workout}`;

export function useSession(date: ISODate, workout: string): WorkoutSession | undefined {
  return useLiveQuery(() => db.workoutSessions.get(sessionId(date, workout)), [date, workout]);
}

/** Todas as sessões em ordem de data (para "última vez" e gráficos) */
export function useAllSessions(): WorkoutSession[] | undefined {
  return useLiveQuery(() => db.workoutSessions.orderBy('date').toArray(), []);
}

async function updateSession(date: ISODate, workout: string, change: (s: WorkoutSession) => void) {
  const id = sessionId(date, workout);
  await db.transaction('rw', db.workoutSessions, async () => {
    const s = (await db.workoutSessions.get(id)) ?? { id, date, workout, exercises: {}, finished: false };
    change(s);
    await db.workoutSessions.put(s);
  });
}

export function updateSet(
  date: ISODate,
  workout: string,
  exerciseId: string,
  setIndex: number,
  patch: Partial<SetEntry>,
) {
  return updateSession(date, workout, (s) => {
    const sets = (s.exercises[exerciseId] ??= []);
    // Preenche buracos caso a série 3 seja editada antes da 2
    while (sets.length <= setIndex) sets.push({});
    sets[setIndex] = { ...sets[setIndex], ...patch };
  });
}

export function setFinished(date: ISODate, workout: string, finished: boolean) {
  return updateSession(date, workout, (s) => {
    s.finished = finished;
  });
}

const hasData = (sets: SetEntry[] | undefined) =>
  !!sets?.some((x) => x.reps !== undefined || x.weight !== undefined);

/** Séries da última vez que o exercício foi feito antes de `date` */
export function lastSetsFor(
  sessions: WorkoutSession[] | undefined,
  exerciseId: string,
  date: ISODate,
): { date: ISODate; sets: SetEntry[] } | null {
  if (!sessions) return null;
  for (let i = sessions.length - 1; i >= 0; i--) {
    const s = sessions[i];
    if (s.date < date && hasData(s.exercises[exerciseId])) {
      return { date: s.date, sets: s.exercises[exerciseId] };
    }
  }
  return null;
}

/**
 * Histórico por exercício para gráficos: uma linha por dia,
 * com maior peso e soma/maior número de repetições.
 */
export function exerciseHistory(sessions: WorkoutSession[], exerciseId: string) {
  return sessions
    .filter((s) => hasData(s.exercises[exerciseId]))
    .map((s) => {
      const sets = s.exercises[exerciseId];
      const weights = sets.map((x) => x.weight ?? 0);
      const reps = sets.map((x) => x.reps ?? 0);
      return {
        date: s.date,
        maxWeight: Math.max(...weights),
        bestReps: Math.max(...reps),
        totalReps: reps.reduce((a, b) => a + b, 0),
        volume: sets.reduce((acc, x) => acc + (x.weight ?? 0) * (x.reps ?? 0), 0),
      };
    });
}
