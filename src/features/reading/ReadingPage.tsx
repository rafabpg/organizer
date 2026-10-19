import { useState } from 'react';
import { BookCheck, Plus, Trash2 } from 'lucide-react';
import { useConfig } from '@/config/useConfig';
import { markTaskDone, useDayLog } from '@/features/today';
import { db } from '@/shared/db/db';
import { fmt, shortDate } from '@/shared/lib/dates';
import { readingGoalFor } from '@/shared/lib/dayPlan';
import { useToday } from '@/shared/lib/useToday';
import { Button, Card, CardTitle, Field, Input, NumberInput, PageHeader, ProgressBar } from '@/shared/ui';
import {
  addBook,
  addReadingLog,
  currentBook,
  finishBook,
  pagesForBook,
  pagesOnDate,
  useBooks,
  useReadingLogs,
} from './books';

/** Tela "Leitura": livro atual, páginas do dia e livros terminados */
export function ReadingPage() {
  const { config } = useConfig();
  const today = useToday();
  const { minimum } = useDayLog(today);
  const books = useBooks();
  const logs = useReadingLogs();
  const book = currentBook(books);

  const goal = minimum ? config.minimumVersion.pages : readingGoalFor(config, today);
  const todayPages = pagesOnDate(logs, today);
  const bookPages = pagesForBook(logs, book?.id);
  const finished = books.filter((b) => b.finishedAt).sort((a, b) => b.finishedAt!.localeCompare(a.finishedAt!));

  const [pages, setPages] = useState<number | undefined>();
  const [showNewBook, setShowNewBook] = useState(false);

  const logPages = async () => {
    if (!pages || pages <= 0) return;
    await addReadingLog({ date: today, bookId: book?.id, pages });
    // Bateu a meta do dia? Marca a leitura no checklist
    if (todayPages + pages >= goal) await markTaskDone(today, 'reading', true);
    setPages(undefined);
  };

  return (
    <>
      <PageHeader title="Leitura" subtitle={fmt(today, "EEEE, d 'de' MMMM")} />

      <Card className="mb-4">
        <CardTitle>Hoje</CardTitle>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-3xl font-bold">{todayPages}</span>
          <span className="text-sm text-slate-500">
            meta: {goal} páginas{minimum && ' (mínimo)'}
          </span>
        </div>
        <ProgressBar value={todayPages / goal} />
        <div className="mt-4 flex items-end gap-2">
          <Field label="Páginas lidas agora">
            <NumberInput value={pages} onChange={setPages} placeholder="0" inputMode="numeric" />
          </Field>
          <Button onClick={logPages} disabled={!pages}>
            <Plus size={18} /> Adicionar
          </Button>
        </div>
      </Card>

      <Card className="mb-4">
        <CardTitle
          action={
            <Button size="sm" variant="ghost" onClick={() => setShowNewBook(!showNewBook)}>
              <Plus size={16} /> Novo livro
            </Button>
          }
        >
          Livro atual
        </CardTitle>
        {showNewBook && <NewBookForm today={today} onDone={() => setShowNewBook(false)} />}
        {book ? (
          <div>
            <p className="font-semibold">{book.title}</p>
            {book.author && <p className="text-sm text-slate-500">{book.author}</p>}
            <p className="mt-2 text-sm">
              {bookPages} {book.totalPages ? `de ${book.totalPages} páginas` : 'páginas lidas'}
            </p>
            {book.totalPages && <ProgressBar value={bookPages / book.totalPages} className="mt-1" />}
            <Button variant="secondary" className="mt-3 w-full" onClick={() => finishBook(book.id!, today)}>
              <BookCheck size={18} /> Terminei este livro
            </Button>
          </div>
        ) : (
          !showNewBook && <p className="text-sm text-slate-500">Nenhum livro em andamento. Adicione um!</p>
        )}
      </Card>

      <Card className="mb-4">
        <CardTitle>Registros recentes</CardTitle>
        {logs.length === 0 && <p className="text-sm text-slate-500">Nada registrado ainda.</p>}
        <ul className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
          {logs
            .slice(-10)
            .reverse()
            .map((l) => (
              <li key={l.id} className="flex items-center justify-between py-2">
                <span>
                  {shortDate(l.date)} · {books.find((b) => b.id === l.bookId)?.title ?? 'Sem livro'}
                </span>
                <span className="flex items-center gap-2">
                  {l.pages} pág.
                  <button aria-label="Apagar registro" className="p-1 text-slate-400" onClick={() => db.readingLogs.delete(l.id!)}>
                    <Trash2 size={16} />
                  </button>
                </span>
              </li>
            ))}
        </ul>
      </Card>

      <Card>
        <CardTitle>Livros terminados ({finished.length})</CardTitle>
        {finished.length === 0 && <p className="text-sm text-slate-500">O primeiro está chegando 📚</p>}
        <ul className="space-y-2 text-sm">
          {finished.map((b) => (
            <li key={b.id}>
              <span className="font-medium">{b.title}</span>
              {b.author && <span className="text-slate-500"> · {b.author}</span>}
              <span className="block text-xs text-slate-500">
                {shortDate(b.startedAt)} → {shortDate(b.finishedAt!)}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}

function NewBookForm({ today, onDone }: { today: string; onDone: () => void }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState<number | undefined>();

  return (
    <form
      className="mb-4 space-y-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-950"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        await addBook({ title: title.trim(), author: author.trim() || undefined, totalPages, startedAt: today });
        onDone();
      }}
    >
      <Field label="Título">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </Field>
      <Field label="Autor (opcional)">
        <Input value={author} onChange={(e) => setAuthor(e.target.value)} />
      </Field>
      <Field label="Total de páginas (opcional)">
        <NumberInput value={totalPages} onChange={setTotalPages} inputMode="numeric" />
      </Field>
      <Button type="submit" className="w-full">
        Começar a ler
      </Button>
    </form>
  );
}
