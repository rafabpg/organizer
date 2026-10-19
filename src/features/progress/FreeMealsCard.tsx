import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Trash2, Utensils } from 'lucide-react';
import { useConfig } from '@/config/useConfig';
import { db } from '@/shared/db/db';
import { addDays, DAY_SHORT, dayKeyOf, weekStart } from '@/shared/lib/dates';
import { useToday } from '@/shared/lib/useToday';
import { Button, Card, CardTitle, Input, cn } from '@/shared/ui';

/** Contador semanal (segunda a domingo) de refeições livres */
export function FreeMealsCard() {
  const { config } = useConfig();
  const today = useToday();
  const start = weekStart(today);
  const end = addDays(start, 6);
  const meals = useLiveQuery(() => db.freeMeals.where('date').between(start, end, true, true).toArray(), [start]) ?? [];
  const [note, setNote] = useState('');

  const limit = config.freeMeals.weeklyLimit;
  const over = meals.length > limit;

  return (
    <Card>
      <CardTitle>Refeições livres da semana</CardTitle>
      <div className="mb-3 flex items-center gap-2">
        {Array.from({ length: Math.max(limit, meals.length) }, (_, i) => (
          <div
            key={i}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full',
              i < meals.length
                ? i < limit
                  ? 'bg-emerald-500 text-white'
                  : 'bg-rose-500 text-white'
                : 'bg-slate-200 text-slate-400 dark:bg-slate-800',
            )}
          >
            <Utensils size={18} />
          </div>
        ))}
        <span className={cn('ml-auto text-lg font-bold', over && 'text-rose-600')}>
          {meals.length}/{limit}
        </span>
      </div>
      {over && <p className="mb-2 text-sm text-rose-600">Passou do limite da semana.</p>}

      <form
        className="flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          await db.freeMeals.add({ date: today, note: note.trim() || undefined });
          setNote('');
        }}
      >
        <Input placeholder="O que foi? (opcional)" value={note} onChange={(e) => setNote(e.target.value)} />
        <Button type="submit" aria-label="Registrar refeição livre">
          <Plus size={18} />
        </Button>
      </form>

      {meals.length > 0 && (
        <ul className="mt-3 divide-y divide-slate-100 text-sm dark:divide-slate-800">
          {meals.map((m) => (
            <li key={m.id} className="flex items-center justify-between py-2">
              <span>
                {DAY_SHORT[dayKeyOf(m.date)]} {m.note && `· ${m.note}`}
              </span>
              <button aria-label="Apagar" className="p-1 text-slate-400" onClick={() => db.freeMeals.delete(m.id!)}>
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
