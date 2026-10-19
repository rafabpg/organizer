import { useLiveQuery } from 'dexie-react-hooks';
import { Flame, Trophy } from 'lucide-react';
import { useConfig } from '@/config/useConfig';
import { db } from '@/shared/db/db';
import { useToday } from '@/shared/lib/useToday';
import { Card } from '@/shared/ui';
import { computeStreaks } from './streak';

export function StreakCard() {
  const { config } = useConfig();
  const today = useToday();
  const logs = useLiveQuery(() => db.dayLogs.toArray(), []) ?? [];
  const { current, best } = computeStreaks(config, logs, today);

  return (
    <Card className="grid grid-cols-2 divide-x divide-slate-200 text-center dark:divide-slate-800">
      <div>
        <Flame className="mx-auto text-orange-500" size={28} />
        <p className="text-3xl font-bold">{current}</p>
        <p className="text-sm text-slate-500">dias seguidos</p>
      </div>
      <div>
        <Trophy className="mx-auto text-amber-500" size={28} />
        <p className="text-3xl font-bold">{best}</p>
        <p className="text-sm text-slate-500">melhor sequência</p>
      </div>
    </Card>
  );
}
