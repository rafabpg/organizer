import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Camera, Trash2 } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useConfig } from '@/config/useConfig';
import { db, type Measurement } from '@/shared/db/db';
import { addDays, daysBetween, fmt, shortDate } from '@/shared/lib/dates';
import { resizeImage } from '@/shared/lib/files';
import { useToday } from '@/shared/lib/useToday';
import { Button, Card, CardTitle, Field, NumberInput, Select } from '@/shared/ui';
import { axisProps, CHART_COLORS, tooltipStyle } from './chartTheme';

/** Medidas corporais e fotos, com lembrete a cada N semanas (config.measurements) */
export function MeasurementsSection() {
  const { config } = useConfig();
  const today = useToday();
  const measurements = useLiveQuery(() => db.measurements.orderBy('date').toArray(), []) ?? [];
  const last = measurements.at(-1);
  const nextDue = last ? addDays(last.date, config.measurements.everyWeeks * 7) : today;
  const daysLeft = daysBetween(today, nextDue);

  return (
    <div className="space-y-4">
      <Card
        className={
          daysLeft <= 0 ? 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40' : undefined
        }
      >
        <p className="font-medium">
          {!last
            ? 'Faça sua primeira medição!'
            : daysLeft <= 0
              ? 'Hora de medir e tirar fotos 📸'
              : `Próxima medição em ${daysLeft} dias (${shortDate(nextDue)})`}
        </p>
        <p className="text-sm text-slate-500">A cada {config.measurements.everyWeeks} semanas.</p>
      </Card>

      <NewMeasurementForm today={today} />
      {measurements.length > 1 && <MeasurementChart measurements={measurements} />}

      <Card>
        <CardTitle>Histórico</CardTitle>
        {measurements.length === 0 && <p className="text-sm text-slate-500">Nenhuma medição ainda.</p>}
        <ul className="space-y-4">
          {[...measurements].reverse().map((m) => (
            <MeasurementItem key={m.id} measurement={m} />
          ))}
        </ul>
      </Card>
    </div>
  );
}

function NewMeasurementForm({ today }: { today: string }) {
  const { config } = useConfig();
  const [values, setValues] = useState<Record<string, number | undefined>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const clean = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== undefined)) as Record<
        string,
        number
      >;
      const measurementId = await db.measurements.add({ date: today, values: clean });
      for (const file of files) {
        await db.photos.add({ measurementId, date: today, blob: await resizeImage(file) });
      }
      setValues({});
      setFiles([]);
    } finally {
      setSaving(false);
    }
  };

  const empty = Object.values(values).every((v) => v === undefined) && files.length === 0;

  return (
    <Card>
      <CardTitle>Nova medição</CardTitle>
      <div className="space-y-3">
        {config.measurements.fields.map((field) => (
          <Field key={field} label={field}>
            <NumberInput value={values[field]} onChange={(v) => setValues({ ...values, [field]: v })} />
          </Field>
        ))}
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 p-3 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
          <Camera size={20} />
          {files.length ? `${files.length} foto(s) selecionada(s)` : 'Adicionar fotos'}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          />
        </label>
        <Button className="w-full" onClick={save} disabled={empty || saving}>
          {saving ? 'Salvando…' : 'Salvar medição'}
        </Button>
      </div>
    </Card>
  );
}

function MeasurementChart({ measurements }: { measurements: Measurement[] }) {
  const { config } = useConfig();
  const [field, setField] = useState(config.measurements.fields[0] ?? '');
  const data = measurements
    .filter((m) => m.values[field] !== undefined)
    .map((m) => ({ label: shortDate(m.date), value: m.values[field] }));

  return (
    <Card>
      <CardTitle>Evolução</CardTitle>
      <Select value={field} onChange={(e) => setField(e.target.value)} className="mb-3">
        {config.measurements.fields.map((f) => (
          <option key={f}>{f}</option>
        ))}
      </Select>
      <div className="h-48 text-slate-500">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} domain={['auto', 'auto']} />
            <Tooltip {...tooltipStyle} />
            <Line type="monotone" dataKey="value" name={field} stroke={CHART_COLORS.primary} strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function MeasurementItem({ measurement }: { measurement: Measurement }) {
  const photos = useLiveQuery(() => db.photos.where('measurementId').equals(measurement.id!).toArray(), [measurement.id]);

  const remove = async () => {
    if (!confirm('Apagar esta medição e as fotos?')) return;
    await db.transaction('rw', db.measurements, db.photos, async () => {
      await db.photos.where('measurementId').equals(measurement.id!).delete();
      await db.measurements.delete(measurement.id!);
    });
  };

  return (
    <li>
      <div className="flex items-center justify-between">
        <span className="font-medium">{fmt(measurement.date, "d 'de' MMM yyyy")}</span>
        <button aria-label="Apagar medição" className="p-1 text-slate-400" onClick={remove}>
          <Trash2 size={16} />
        </button>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        {Object.entries(measurement.values)
          .map(([k, v]) => `${k}: ${v}`)
          .join(' · ')}
      </p>
      {!!photos?.length && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {photos.map((p) => (
            <PhotoThumb key={p.id} blob={p.blob} />
          ))}
        </div>
      )}
    </li>
  );
}

/** Mostra um Blob como imagem, liberando a memória ao sair da tela */
function PhotoThumb({ blob }: { blob: Blob }) {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noreferrer">
      <img src={url} alt="Foto de progresso" className="aspect-[3/4] w-full rounded-lg object-cover" />
    </a>
  );
}
