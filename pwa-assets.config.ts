import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// Gera os ícones PNG (Android/iPhone) a partir do favicon.svg: `npm run icons`
export default defineConfig({
  preset: minimal2023Preset,
  images: ['public/favicon.svg'],
});
