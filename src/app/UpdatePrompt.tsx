import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Registra o service worker (offline) e mostra um aviso discreto
 * quando o app já pode funcionar sem internet.
 * Com registerType "autoUpdate", versões novas são aplicadas sozinhas.
 */
export function UpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
  } = useRegisterSW();

  if (!offlineReady) return null;
  return (
    <div className="fixed inset-x-4 bottom-24 z-30 mx-auto flex max-w-md items-center justify-between gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg dark:bg-slate-100 dark:text-slate-900">
      App pronto para funcionar offline.
      <button className="font-semibold" onClick={() => setOfflineReady(false)}>
        OK
      </button>
    </div>
  );
}
