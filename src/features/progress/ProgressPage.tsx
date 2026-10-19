import { useState } from 'react';
import { PageHeader, Tabs } from '@/shared/ui';
import { CalendarCard } from './CalendarCard';
import { ExerciseChart } from './ExerciseChart';
import { FreeMealsCard } from './FreeMealsCard';
import { MeasurementsSection } from './MeasurementsSection';
import { RunChart } from './RunChart';
import { StreakCard } from './StreakCard';

type Tab = 'geral' | 'graficos' | 'medidas';

/** Tela "Progresso", dividida em abas para não ficar gigante */
export function ProgressPage() {
  const [tab, setTab] = useState<Tab>('geral');
  return (
    <>
      <PageHeader title="Progresso" />
      <Tabs
        value={tab}
        onChange={setTab}
        options={[
          { value: 'geral', label: 'Geral' },
          { value: 'graficos', label: 'Gráficos' },
          { value: 'medidas', label: 'Medidas' },
        ]}
      />
      {tab === 'geral' && (
        <div className="space-y-4">
          <StreakCard />
          <CalendarCard />
          <FreeMealsCard />
        </div>
      )}
      {tab === 'graficos' && (
        <div className="space-y-4">
          <ExerciseChart />
          <RunChart />
        </div>
      )}
      {tab === 'medidas' && <MeasurementsSection />}
    </>
  );
}
