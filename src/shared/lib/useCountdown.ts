import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Timer regressivo baseado em horário de término (Date.now()),
 * e não em "contar ticks". Assim ele continua certo mesmo se o
 * celular travar a aba por alguns segundos em segundo plano.
 */
export function useCountdown(onFinish?: () => void) {
  const [endAt, setEndAt] = useState<number | null>(null);
  const [pausedLeft, setPausedLeft] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const running = endAt !== null;
  const remainingMs = running ? Math.max(0, endAt - now) : (pausedLeft ?? 0);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (running && endAt !== null && now >= endAt) {
      setEndAt(null);
      setPausedLeft(null);
      onFinishRef.current?.();
    }
  }, [running, endAt, now]);

  const start = useCallback((seconds: number) => {
    setNow(Date.now());
    setPausedLeft(null);
    setEndAt(Date.now() + seconds * 1000);
  }, []);

  const pause = useCallback(() => {
    if (endAt === null) return;
    setPausedLeft(Math.max(0, endAt - Date.now()));
    setEndAt(null);
  }, [endAt]);

  const resume = useCallback(() => {
    if (pausedLeft === null) return;
    setNow(Date.now());
    setEndAt(Date.now() + pausedLeft);
    setPausedLeft(null);
  }, [pausedLeft]);

  const stop = useCallback(() => {
    setEndAt(null);
    setPausedLeft(null);
  }, []);

  return {
    remainingSeconds: Math.ceil(remainingMs / 1000),
    running,
    paused: pausedLeft !== null,
    start,
    pause,
    resume,
    stop,
  };
}
