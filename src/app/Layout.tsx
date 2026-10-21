import { NavLink, Outlet } from 'react-router-dom';
import { BookOpen, CalendarCheck, Dumbbell, Settings, TrendingUp, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/ui';

const NAV_ITEMS: Array<{ to: string; label: string; icon: LucideIcon }> = [
  { to: '/', label: 'Hoje', icon: CalendarCheck },
  { to: '/treino', label: 'Treino', icon: Dumbbell },
  { to: '/leitura', label: 'Leitura', icon: BookOpen },
  { to: '/progresso', label: 'Progresso', icon: TrendingUp },
  { to: '/ajustes', label: 'Ajustes', icon: Settings },
];

/** Layout com conteúdo rolável e barra de navegação fixa embaixo */
export function Layout() {
  return (
    <div className="mx-auto min-h-dvh max-w-lg">
      {/* pb extra para o conteúdo não ficar atrás da barra inferior */}
      <main className="px-4 pb-28 pt-[max(1rem,env(safe-area-inset-top))]">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)] dark:border-slate-800 dark:bg-slate-900/95">
        <ul className="mx-auto flex max-w-lg">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium',
                    isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400',
                  )
                }
              >
                <Icon size={22} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
