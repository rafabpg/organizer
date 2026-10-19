import type { RoutineConfig } from '@/config/schema';
import { dayStatus, isDayComplete } from '@/features/today';
import type { DayLog } from '@/shared/db/db';
import { addDays, type ISODate } from '@/shared/lib/dates';

/**
 * Calcula a sequência (streak) atual e a melhor.
 * Regras:
 * - dia cumprido (ou versão mínima) soma 1;
 * - dia sem tarefas obrigatórias ("neutral") não soma nem quebra;
 * - hoje ainda em andamento não quebra a sequência;
 * - qualquer outro dia não cumprido zera.
 */
export function computeStreaks(config: RoutineConfig, logs: DayLog[], today: ISODate) {
  if (logs.length === 0) return { current: 0, best: 0 };
  const byDate = new Map(logs.map((l) => [l.date, l]));
  const first = logs.reduce((min, l) => (l.date < min ? l.date : min), logs[0].date);

  let current = 0;
  let best = 0;
  for (let d = first; d <= today; d = addDays(d, 1)) {
    const status = dayStatus(config, d, byDate.get(d));
    if (isDayComplete(status)) {
      current++;
      best = Math.max(best, current);
    } else if (status !== 'neutral' && d !== today) {
      current = 0;
    }
  }
  return { current, best };
}
