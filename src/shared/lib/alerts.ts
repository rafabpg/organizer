/**
 * Avisos sonoros e de vibração para os timers.
 *
 * Observações:
 * - Vibração funciona no Android. O iPhone (Safari) não suporta a API de vibração.
 * - O som usa Web Audio (um "bip" gerado na hora, sem arquivo de áudio).
 *   No iPhone o áudio só toca depois de um toque do usuário — por isso
 *   chamamos unlockAudio() quando o timer é iniciado.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx ??= new AC();
  return ctx;
}

/** Chame dentro de um clique para liberar o áudio (necessário no iOS). */
export function unlockAudio() {
  const c = getCtx();
  if (c?.state === 'suspended') void c.resume();
}

/** Toca um ou mais bipes */
export function beep(times = 1, frequency = 880, durationMs = 180) {
  const c = getCtx();
  if (!c) return;
  for (let i = 0; i < times; i++) {
    const start = c.currentTime + i * (durationMs / 1000 + 0.12);
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.frequency.value = frequency;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.4, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + durationMs / 1000);
    osc.connect(gain).connect(c.destination);
    osc.start(start);
    osc.stop(start + durationMs / 1000 + 0.05);
  }
}

export function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* sem suporte */
  }
}

/** Alerta combinado: som + vibração */
export function alertUser(kind: 'end' | 'switch' = 'end') {
  if (kind === 'end') {
    beep(3, 988);
    vibrate([300, 150, 300, 150, 300]);
  } else {
    beep(2, 660);
    vibrate([400, 100, 400]);
  }
}
