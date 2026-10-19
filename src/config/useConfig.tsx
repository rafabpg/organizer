import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/shared/db/db';
import defaultJson from './routine.config.json';
import { validateConfig, type RoutineConfig } from './schema';

/**
 * Carrega a configuração da rotina:
 * 1. Começa com o routine.config.json (padrão, versionado no código).
 * 2. Se existir uma config salva no IndexedDB (editada no app), ela substitui o padrão.
 * Se a config salva estiver inválida (ex.: schema mudou), cai no padrão e avisa.
 */

const OVERRIDE_KEY = 'configOverride';

const defaultResult = validateConfig(defaultJson);
if (!defaultResult.ok) {
  // Erro de desenvolvimento: o JSON padrão precisa sempre ser válido
  throw new Error('routine.config.json inválido:\n' + defaultResult.errors.join('\n'));
}
export const DEFAULT_CONFIG: RoutineConfig = defaultResult.config;

interface ConfigContextValue {
  config: RoutineConfig;
  isCustom: boolean; // true se está usando a config editada no app
  overrideError?: string[];
  saveConfig: (config: RoutineConfig) => Promise<void>;
  resetConfig: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  // undefined = ainda carregando; null = sem override
  const override = useLiveQuery(
    async () => (await db.settings.get(OVERRIDE_KEY))?.value ?? null,
    [],
  );

  const value = useMemo<ConfigContextValue>(() => {
    let config = DEFAULT_CONFIG;
    let isCustom = false;
    let overrideError: string[] | undefined;
    if (override) {
      const parsed = validateConfig(override);
      if (parsed.ok) {
        config = parsed.config;
        isCustom = true;
      } else {
        overrideError = parsed.errors;
      }
    }
    return {
      config,
      isCustom,
      overrideError,
      saveConfig: async (c) => {
        await db.settings.put({ key: OVERRIDE_KEY, value: c });
      },
      resetConfig: async () => {
        await db.settings.delete(OVERRIDE_KEY);
      },
    };
  }, [override]);

  // Evita "piscar" a config padrão antes de ler a salva
  if (override === undefined) return null;

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

/** Hook para qualquer componente acessar a config atual. */
export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig precisa estar dentro de <ConfigProvider>');
  return ctx;
}
