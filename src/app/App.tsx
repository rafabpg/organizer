import { HashRouter } from 'react-router-dom';
import { ConfigProvider } from '@/config/useConfig';
import { AppRoutes } from './routes';
import { UpdatePrompt } from './UpdatePrompt';

/**
 * Raiz do app.
 * Usamos HashRouter (URLs com #/treino) porque o GitHub Pages não sabe
 * redirecionar rotas de SPA — assim recarregar qualquer tela funciona.
 */
export function App() {
  return (
    <ConfigProvider>
      <HashRouter>
        <AppRoutes />
        <UpdatePrompt />
      </HashRouter>
    </ConfigProvider>
  );
}
