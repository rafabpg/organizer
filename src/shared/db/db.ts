import Dexie, { type Table } from 'dexie';

/**
 * Banco local (IndexedDB) via Dexie.
 * Tudo fica salvo só no aparelho. Use o backup em Configurações
 * para levar os dados para outro lugar.
 *
 * Datas são sempre strings "AAAA-MM-DD" no fuso da config.
 */

/** Chave/valor genérico (ex.: config editada pelo usuário) */
export interface SettingRow {
  key: string;
  value: unknown;
}

/** Checklist de um dia. `done` usa como chave o id da tarefa (ver features/today/tasks.ts). */
export interface DayLog {
  date: string;
  done: Record<string, boolean>;
  minimum: boolean; // "versão mínima" marcada
  recovery?: boolean; // "dia de recuperação" (dor muscular: dispensa treino/corrida)
}

export interface SetEntry {
  weight?: number; // kg
  reps?: number; // repetições OU segundos (para exercícios de duração)
  done?: boolean;
}

/** Uma sessão de treino. id = "AAAA-MM-DD:A" */
export interface WorkoutSession {
  id: string;
  date: string;
  workout: string; // "A", "B"...
  exercises: Record<string, SetEntry[]>; // exerciseId -> séries
  finished: boolean;
}

export interface RunLog {
  id?: number;
  date: string;
  durationSeconds: number;
  stageIndex: number;
  note?: string;
}

export interface Book {
  id?: number;
  title: string;
  author?: string;
  totalPages?: number;
  startedAt: string;
  finishedAt?: string;
}

export interface ReadingLog {
  id?: number;
  date: string;
  bookId?: number;
  pages: number;
}

export interface Measurement {
  id?: number;
  date: string;
  values: Record<string, number>; // nome do campo (da config) -> valor
}

export interface Photo {
  id?: number;
  measurementId: number;
  date: string;
  blob: Blob;
}

export interface FreeMeal {
  id?: number;
  date: string;
  note?: string;
}

class OrganizerDB extends Dexie {
  settings!: Table<SettingRow, string>;
  dayLogs!: Table<DayLog, string>;
  workoutSessions!: Table<WorkoutSession, string>;
  runs!: Table<RunLog, number>;
  books!: Table<Book, number>;
  readingLogs!: Table<ReadingLog, number>;
  measurements!: Table<Measurement, number>;
  photos!: Table<Photo, number>;
  freeMeals!: Table<FreeMeal, number>;

  constructor() {
    super('organizer');
    // Só os campos indexados aparecem aqui. Se mudar, crie uma version(2).
    this.version(1).stores({
      settings: 'key',
      dayLogs: 'date',
      workoutSessions: 'id, date',
      runs: '++id, date',
      books: '++id, finishedAt',
      readingLogs: '++id, date, bookId',
      measurements: '++id, date',
      photos: '++id, measurementId',
      freeMeals: '++id, date',
    });
  }
}

export const db = new OrganizerDB();

/** Nomes das tabelas — usados no backup */
export const TABLE_NAMES = [
  'settings',
  'dayLogs',
  'workoutSessions',
  'runs',
  'books',
  'readingLogs',
  'measurements',
  'photos',
  'freeMeals',
] as const;
export type TableName = (typeof TABLE_NAMES)[number];

/** Pede ao navegador para não apagar os dados (importante no iPhone). */
export async function requestPersistentStorage() {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) {
      await navigator.storage.persist();
    }
  } catch {
    /* sem suporte: tudo bem */
  }
}
