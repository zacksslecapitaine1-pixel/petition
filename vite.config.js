import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base relative : fonctionne sur GitHub Pages quel que soit le nom du dépôt
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { target: 'es2020', chunkSizeWarningLimit: 900 },
});
