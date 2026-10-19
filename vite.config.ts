import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * BASE_PATH define em qual subcaminho o app é servido.
 * - GitHub Pages: "/nome-do-repo/" (o workflow define isso automaticamente)
 * - Vercel / local: "/" (padrão)
 */
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  resolve: {
    // Permite importar com "@/shared/..." em vez de "../../../shared/..."
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  plugins: [
    react(),
    VitePWA({
      // Atualiza o service worker sozinho quando sai versão nova
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Minha Rotina',
        short_name: 'Rotina',
        description: 'Organizador pessoal de saúde, estudos e leitura',
        lang: 'pt-BR',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0f172a',
        theme_color: '#10b981',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Faz cache de todo o app para funcionar offline
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
  ],
});
