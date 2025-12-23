import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc'; // Use o SWC que está no seu package.json
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // Ajuste para o nome do seu repositório no GitHub
  base: '/controle-financeiro/', 
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt', // ESSENCIAL para o aviso de "Nova Versão" funcionar
      manifest: {
        name: 'Controle Financeiro',
        short_name: 'Finanças',
        theme_color: '#0f172a',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
  }
});