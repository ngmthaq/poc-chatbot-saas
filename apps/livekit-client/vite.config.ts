import tanstackRouter from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    tanstackRouter({
      routesDirectory: './src/routes',
      generatedRouteTree: './src/generated/routeTree.gen.ts',
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'ES2022',
    sourcemap: process.env['NODE_ENV'] !== 'production',
    outDir: 'dist',
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
