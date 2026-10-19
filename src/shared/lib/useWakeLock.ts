import { useEffect } from 'react';

/**
 * Mantém a tela acesa enquanto `active` for true (ex.: timer do trote rodando).
 * Usa a Screen Wake Lock API; se não houver suporte, não faz nada.
 */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        lock = await navigator.wakeLock.request('screen');
        if (cancelled) void lock.release();
      } catch {
        /* usuário negou ou bateria fraca */
      }
    };
    void acquire();

    // O lock é perdido quando a aba fica oculta; pede de novo ao voltar
    const onVisible = () => {
      if (document.visibilityState === 'visible') void acquire();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      void lock?.release();
    };
  }, [active]);
}
