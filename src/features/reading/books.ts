import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Book, type ReadingLog } from '@/shared/db/db';
import type { ISODate } from '@/shared/lib/dates';

/** Acesso a livros e registros de leitura */

export function useBooks() {
  return useLiveQuery(() => db.books.toArray(), []) ?? [];
}

export function useReadingLogs() {
  return useLiveQuery(() => db.readingLogs.orderBy('date').toArray(), []) ?? [];
}

/** Livro atual = o mais recente ainda não terminado */
export function currentBook(books: Book[]): Book | undefined {
  return books.filter((b) => !b.finishedAt).sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
}

export function pagesForBook(logs: ReadingLog[], bookId: number | undefined) {
  return logs.filter((l) => l.bookId === bookId).reduce((a, l) => a + l.pages, 0);
}

export function pagesOnDate(logs: ReadingLog[], date: ISODate) {
  return logs.filter((l) => l.date === date).reduce((a, l) => a + l.pages, 0);
}

export function addBook(book: Omit<Book, 'id'>) {
  return db.books.add(book);
}

export function finishBook(id: number, date: ISODate) {
  return db.books.update(id, { finishedAt: date });
}

export function addReadingLog(log: Omit<ReadingLog, 'id'>) {
  return db.readingLogs.add(log);
}
