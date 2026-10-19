import { z } from 'zod';
import { db, TABLE_NAMES, type Photo } from '@/shared/db/db';
import { blobToDataURL, dataURLToBlob } from '@/shared/lib/files';

/**
 * Backup completo: config editada + todos os registros, num único JSON.
 * Fotos (Blob) viram texto base64 (data URL) para caber no JSON.
 */

const BACKUP_APP = 'organizer';
const BACKUP_VERSION = 1;

const backupSchema = z.object({
  app: z.literal(BACKUP_APP),
  version: z.number(),
  exportedAt: z.string(),
  tables: z.record(z.string(), z.array(z.record(z.string(), z.unknown()))),
});

export async function exportBackup(): Promise<string> {
  const tables: Record<string, unknown[]> = {};
  for (const name of TABLE_NAMES) {
    const rows = await db.table(name).toArray();
    tables[name] =
      name === 'photos'
        ? await Promise.all((rows as Photo[]).map(async (p) => ({ ...p, blob: await blobToDataURL(p.blob) })))
        : rows;
  }
  return JSON.stringify({ app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: new Date().toISOString(), tables });
}

/** Substitui TODOS os dados locais pelos do backup */
export async function importBackup(text: string) {
  const parsed = backupSchema.safeParse(JSON.parse(text));
  if (!parsed.success) throw new Error('Arquivo não parece um backup deste app.');
  const { tables } = parsed.data;

  // Converte as fotos antes da transação (operações async fora do Dexie quebram a transação)
  const photos = await Promise.all(
    (tables.photos ?? []).map(async (p) => ({ ...p, blob: await dataURLToBlob(p.blob as string) })),
  );

  await db.transaction('rw', TABLE_NAMES.map((n) => db.table(n)), async () => {
    for (const name of TABLE_NAMES) {
      await db.table(name).clear();
      const rows = name === 'photos' ? photos : (tables[name] ?? []);
      if (rows.length) await db.table(name).bulkAdd(rows);
    }
  });
}
