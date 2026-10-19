import { useState } from 'react';
import { useConfig } from '@/config/useConfig';
import { Card, PageHeader, Tabs } from '@/shared/ui';
import { BackupSection } from './BackupSection';
import { ConfigForm } from './ConfigForm';
import { JsonEditor } from './JsonEditor';

type Tab = 'form' | 'json' | 'backup';

/** Tela "Ajustes": editar a rotina (formulário ou JSON) e backup */
export function SettingsPage() {
  const { isCustom, overrideError } = useConfig();
  const [tab, setTab] = useState<Tab>('form');

  return (
    <>
      <PageHeader
        title="Ajustes"
        subtitle={isCustom ? 'Usando sua config editada' : 'Usando a config padrão (routine.config.json)'}
      />

      {overrideError && (
        <Card className="mb-4 border-rose-300 bg-rose-50 text-sm dark:border-rose-900 dark:bg-rose-950/40">
          <p className="font-semibold">Sua config salva ficou inválida e foi ignorada:</p>
          <ul className="mt-1 list-inside list-disc">
            {overrideError.slice(0, 5).map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <p className="mt-1">Corrija na aba JSON ou restaure o padrão.</p>
        </Card>
      )}

      <Tabs
        value={tab}
        onChange={setTab}
        options={[
          { value: 'form', label: 'Rotina' },
          { value: 'json', label: 'JSON' },
          { value: 'backup', label: 'Backup' },
        ]}
      />
      {tab === 'form' && <ConfigForm />}
      {tab === 'json' && <JsonEditor />}
      {tab === 'backup' && <BackupSection />}
    </>
  );
}
