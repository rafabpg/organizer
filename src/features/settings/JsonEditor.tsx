import { useRef, useState } from 'react';
import { Download, RotateCcw, Save, Upload } from 'lucide-react';
import { validateConfig } from '@/config/schema';
import { useConfig } from '@/config/useConfig';
import { downloadText } from '@/shared/lib/files';
import { Button, Card, Textarea } from '@/shared/ui';

/** Edição do JSON bruto da config, com validação Zod antes de salvar */
export function JsonEditor() {
  const { config, saveConfig, resetConfig, isCustom } = useConfig();
  const [text, setText] = useState(() => JSON.stringify(config, null, 2));
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const save = async (raw: string) => {
    setMessage('');
    let data: unknown;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      setErrors([`JSON inválido: ${(e as Error).message}`]);
      return;
    }
    const result = validateConfig(data);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors([]);
    await saveConfig(result.config);
    setText(JSON.stringify(result.config, null, 2));
    setMessage('Config salva ✔');
  };

  return (
    <div className="space-y-3">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        className="h-[55vh] font-mono text-xs"
      />

      {errors.length > 0 && (
        <Card className="border-rose-300 bg-rose-50 text-sm dark:border-rose-900 dark:bg-rose-950/40">
          <p className="font-semibold">Corrija antes de salvar:</p>
          <ul className="mt-1 list-inside list-disc">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </Card>
      )}
      {message && <p className="text-sm font-medium text-emerald-600">{message}</p>}

      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => save(text)}>
          <Save size={18} /> Validar e salvar
        </Button>
        <Button variant="secondary" onClick={() => fileRef.current?.click()}>
          <Upload size={18} /> Importar JSON
        </Button>
        <Button variant="secondary" onClick={() => downloadText('routine.config.json', JSON.stringify(config, null, 2))}>
          <Download size={18} /> Baixar config
        </Button>
        <Button
          variant="secondary"
          disabled={!isCustom}
          onClick={async () => {
            if (!confirm('Voltar para a config padrão do app? Seus registros não são apagados.')) return;
            await resetConfig();
            setMessage('Padrão restaurado ✔');
            setErrors([]);
          }}
        >
          <RotateCcw size={18} /> Restaurar padrão
        </Button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (!file) return;
          const raw = await file.text();
          setText(raw);
          await save(raw);
        }}
      />

      <p className="text-xs text-slate-500">
        Dica: a rotação A/B (<code>workoutRotation.pattern</code>) e as etapas do trote (<code>run.stages</code>) são
        editadas aqui.
      </p>
    </div>
  );
}
