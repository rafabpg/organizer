import { useCallback, useEffect, useRef, useState } from 'react';
import type { IntervalSegment } from '@/shared/lib/rotation';

/**
 * Timer de intervalos (trotar/caminhar).
 * O tempo decorrido é calculado a partir de timestamps, então não "atrasa"
 * se o celular segurar a aba. A partir do tempo decorrido descobrimos
 * em qual bloco estamos.
 */
export function useIntervalTimer(
  segments: IntervalSegment[],
  callbacks: { onSwitch: (next: IntervalSegment) => void; onFinish: () => void },
) {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [accumulatedMs, setAccumulatedMs] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const cbRef = useRef(callbacks);
  cbRef.current = callbacks;

  const running = startedAt !== null;
  const totalSeconds = segments.reduce((a, s) => a + s.seconds, 0);
  const elapsedSeconds = Math.min(totalSeconds, (accumulatedMs + (running ? now - startedAt : 0)) / 1000);

  // Descobre o bloco atual
  let index = 0;
  let segmentStart = 0;
  while (index < segments.length - 1 && elapsedSeconds >= segmentStart + segments[index].seconds) {
    segmentStart += segments[index].seconds;
    index++;
  }
  const current = segments[index];
  const segmentRemaining = Math.max(0, segmentStart + (current?.seconds ?? 0) - elapsedSeconds);
  const finished = elapsedSeconds >= totalSeconds && totalSeconds > 0;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [running]);

  // Avisa quando muda de bloco
  const lastIndex = useRef(index);
  useEffect(() => {
    if (running && index !== lastIndex.current && index > lastIndex.current) {
      cbRef.current.onSwitch(segments[index]);
    }
    lastIndex.current = index;
  }, [index, running, segments]);

  // Para sozinho ao terminar
  useEffect(() => {
    if (running && finished) {
      setAccumulatedMs(totalSeconds * 1000);
      setStartedAt(null);
      cbRef.current.onFinish();
    }
  }, [running, finished, totalSeconds]);

  const start = useCallback(() => {
    setNow(Date.now());
    setStartedAt(Date.now());
  }, []);

  const pause = useCallback(() => {
    if (startedAt === null) return;
    setAccumulatedMs((ms) => ms + Date.now() - startedAt);
    setStartedAt(null);
  }, [startedAt]);

  const reset = useCallback(() => {
    setStartedAt(null);
    setAccumulatedMs(0);
    lastIndex.current = 0;
  }, []);

  return {
    running,
    started: running || accumulatedMs > 0,
    finished,
    elapsedSeconds,
    totalSeconds,
    index,
    current,
    next: segments[index + 1],
    segmentRemaining,
    start,
    pause,
    reset,
  };
}
