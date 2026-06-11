import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    // Em desenvolvimento, encaminha /api/* para o Express local (porta 3001).
    // Assim o front consome a API como "mesma origem" — igual à Vercel em produção.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
