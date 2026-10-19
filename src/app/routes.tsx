import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './Layout';
import { TodayPage } from '@/features/today/TodayPage';
import { WorkoutPage } from '@/features/workout/WorkoutPage';
import { RunPage } from '@/features/run/RunPage';
import { ReadingPage } from '@/features/reading/ReadingPage';
import { SettingsPage } from '@/features/settings/SettingsPage';

// Progresso usa a biblioteca de gráficos (pesada): só carrega quando abrir a tela
const ProgressPage = lazy(() =>
  import('@/features/progress/ProgressPage').then((m) => ({ default: m.ProgressPage })),
);

/** Todas as telas do app. Cada uma vive na sua pasta em src/features. */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<TodayPage />} />
        <Route path="treino" element={<WorkoutPage />} />
        <Route path="trote" element={<RunPage />} />
        <Route path="leitura" element={<ReadingPage />} />
        <Route
          path="progresso"
          element={
            <Suspense fallback={<p className="text-slate-500">Carregando…</p>}>
              <ProgressPage />
            </Suspense>
          }
        />
        <Route path="ajustes" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
