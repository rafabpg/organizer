import {
  addDays as addDaysFns,
  differenceInCalendarDays,
  format,
  parseISO,
  startOfWeek,
} from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';
import type { DayKey } from '@/config/schema';

/**
 * Utilitários de data.
 *
 * Regra do app: datas são strings "AAAA-MM-DD" (ISO de calendário), sempre
 * calculadas no fuso da config (America/Sao_Paulo). Assim "hoje" é o mesmo
 * dia que você vê no relógio, mesmo se o celular estiver em outro fuso.
 * Contas de calendário (somar dias, diferença) são feitas sobre essas strings.
 */

export type ISODate = string;

/** "Hoje" no fuso informado, ex.: "2026-10-16" */
export function todayISO(timezone: string): ISODate {
  return formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd');
}

/** Hora atual "HH:mm" no fuso informado */
export function nowTime(timezone: string): string {
  return formatInTimeZone(new Date(), timezone, 'HH:mm');
}

export function addDays(date: ISODate, amount: number): ISODate {
  return format(addDaysFns(parseISO(date), amount), 'yyyy-MM-dd');
}

/** Diferença em dias de calendário (b - a) */
export function daysBetween(a: ISODate, b: ISODate): number {
  return differenceInCalendarDays(parseISO(b), parseISO(a));
}

/** Segunda-feira da semana da data */
export function weekStart(date: ISODate): ISODate {
  return format(startOfWeek(parseISO(date), { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

const JS_DAY_TO_KEY: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/** Chave do dia da semana ("mon", "tue"...) */
export function dayKeyOf(date: ISODate): DayKey {
  return JS_DAY_TO_KEY[parseISO(date).getDay()];
}

export const DAY_LABELS: Record<DayKey, string> = {
  mon: 'Segunda',
  tue: 'Terça',
  wed: 'Quarta',
  thu: 'Quinta',
  fri: 'Sexta',
  sat: 'Sábado',
  sun: 'Domingo',
};

export const DAY_SHORT: Record<DayKey, string> = {
  mon: 'Seg',
  tue: 'Ter',
  wed: 'Qua',
  thu: 'Qui',
  fri: 'Sex',
  sat: 'Sáb',
  sun: 'Dom',
};

/** Formata data em português, ex.: fmt("2026-10-16", "EEEE, d 'de' MMMM") */
export function fmt(date: ISODate, pattern: string): string {
  return format(parseISO(date), pattern, { locale: ptBR });
}

/** "16/10" */
export function shortDate(date: ISODate): string {
  return fmt(date, 'dd/MM');
}

/** Segundos -> "m:ss" (ou "h:mm:ss") */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}
