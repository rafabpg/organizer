import { useEffect, useState } from 'react';
import { useConfig } from '@/config/useConfig';
import { todayISO } from './dates';

/**
 * Data de hoje ("AAAA-MM-DD") no fuso da config.
 * Reavalia a cada minuto e quando o app volta ao primeiro plano,
 * para virar o dia sozinho se o app ficar aberto à meia-noite.
 */
export function useToday(): string {
  const { config } = useConfig();
  const [today, setToday] = useState(() => todayISO(config.timezone));

  useEffect(() => {
    const update = () => setToday(todayISO(config.timezone));
    update();
    const id = window.setInterval(update, 60_000);
    document.addEventListener('visibilitychange', update);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', update);
    };
  }, [config.timezone]);

  return today;
}
