import { useLiveQuery } from 'dexie-react-hooks';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { db } from '@/shared/db/db';
import { shortDate } from '@/shared/lib/dates';
import { Card, CardTitle } from '@/shared/ui';
import { axisProps, CHART_COLORS, tooltipStyle } from './chartTheme';

/** Minutos de trote nos últimos registros */
export function RunChart() {
  const runs = useLiveQuery(() => db.runs.orderBy('date').toArray(), []) ?? [];
  const data = runs.slice(-20).map((r) => ({ label: shortDate(r.date), minutes: Math.round(r.durationSeconds / 6) / 10 }));

  return (
    <Card>
      <CardTitle>Trote (minutos)</CardTitle>
      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">Nenhum trote registrado ainda.</p>
      ) : (
        <div className="h-56 text-slate-500">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(148,163,184,0.15)' }} />
              <Bar dataKey="minutes" name="Minutos" fill={CHART_COLORS.primary} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
