import { useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { useToday } from '@/shared/lib/useToday';
import { downloadText } from '@/shared/lib/files';
import { Button, Card, CardTitle } from '@/shared/ui';
import { exportBackup, importBackup } from './backup';

/** Exportar/importar backup completo (config + registros + fotos) */
export function BackupSection() {
  const today = useToday();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>Exportar</CardTitle>
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
          Gera um arquivo com sua config e todos os registros (inclusive fotos). Guarde no Drive/e-mail de vez em quando
          — os dados ficam só neste aparelho.
        </p>
        <Button
          className="w-full"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              downloadText(`rotina-backup-${today}.json`, await exportBackup());
              setStatus({ ok: true, text: 'Backup gerado ✔' });
            } finally {
              setBusy(false);
            }
          }}
        >
          <Download size={18} /> Baixar backup
        </Button>
      </Card>

      <Card>
        <CardTitle>Importar</CardTitle>
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
          Substitui <strong>todos</strong> os dados deste aparelho pelos do arquivo.
        </p>
        <Button variant="secondary" className="w-full" disabled={busy} onClick={() => fileRef.current?.click()}>
          <Upload size={18} /> Escolher arquivo de backup
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (!file || !confirm('Isso vai apagar os dados atuais e restaurar o backup. Continuar?')) return;
            setBusy(true);
            try {
              await importBackup(await file.text());
              setStatus({ ok: true, text: 'Backup restaurado ✔' });
            } catch (err) {
              setStatus({ ok: false, text: (err as Error).message });
            } finally {
              setBusy(false);
            }
          }}
        />
      </Card>

      {status && <p className={status.ok ? 'text-sm text-emerald-600' : 'text-sm text-rose-600'}>{status.text}</p>}
    </div>
  );
}
