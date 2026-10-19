import { useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useConfig } from '@/config/useConfig';
import { exerciseHistory, useAllSessions } from '@/features/workout';
import { shortDate } from '@/shared/lib/dates';
import { Card, CardTitle, Select } from '@/shared/ui';
import { axisProps, CHART_COLORS, tooltipStyle } from './chartTheme';

/** Evolução de um exercício: maior peso e melhor série ao longo do tempo */
export function ExerciseChart() {
  const { config } = useConfig();
  const sessions = useAllSessions() ?? [];

  // Lista única de exercícios de todos os treinos da config
  const exercises = Object.values(config.workouts)
    .flat()
    .filter((e, i, arr) => arr.findIndex((x) => x.id === e.id) === i);
  const [exerciseId, setExerciseId] = useState(exercises[0]?.id ?? '');
  const exercise = exercises.find((e) => e.id === exerciseId);
  const data = exerciseHistory(sessions, exerciseId).map((d) => ({ ...d, label: shortDate(d.date) }));
  const repsLabel = exercise?.reps ? 'Melhor série (reps)' : 'Melhor série (s)';

  return (
    <Card>
      <CardTitle>Evolução por exercício</CardTitle>
      <Select value={exerciseId} onChange={(e) => setExerciseId(e.target.value)} className="mb-3">
        {exercises.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name}
          </option>
        ))}
      </Select>

      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">Sem registros deste exercício ainda.</p>
      ) : (
        <div className="h-64 text-slate-500">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis yAxisId="w" {...axisProps} />
              <YAxis yAxisId="r" orientation="right" {...axisProps} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line yAxisId="w" type="monotone" dataKey="maxWeight" name="Peso máx. (kg)" stroke={CHART_COLORS.primary} strokeWidth={2} dot />
              <Line yAxisId="r" type="monotone" dataKey="bestReps" name={repsLabel} stroke={CHART_COLORS.secondary} strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
