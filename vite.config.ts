// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      // Enables Fast Refresh for the Framer Motion + Context-heavy component
      // tree without full page reloads during dev.
      babel: {
        plugins: [],
      },
    }),
  ],

  resolve: {
    alias: {
      // Must mirror the `paths` map in tsconfig.json exactly — Vite resolves
      // at build time, TS resolves at type-check time; drift between the two
      // causes "works in dev, fails to type-check" bugs.
      '@': path.resolve(__dirname, './src'),
      '@/app': path.resolve(__dirname, './src/app'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@/styles': path.resolve(__dirname, './src/styles'),
    },
  },

  server: {
    port: 5173,
    strictPort: false,
    open: false,
    // Avoids the classic "works on my machine" issue when developing inside
    // WSL/containers where file-watching needs polling.
    watch: {
      usePolling: process.env.VITE_USE_POLLING === 'true',
    },
  },

  build: {
    target: 'es2020',
    sourcemap: true,
    // Manual chunking keeps the charting/table libraries (Recharts,
    // TanStack Table + Virtual) out of the initial bundle since they're
    // only needed on the analytics/transactions routes, not the login/shell.
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-table': ['@tanstack/react-table', '@tanstack/react-virtual'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-motion': ['framer-motion'],
          'vendor-forms': ['react-hook-form', 'zod', '@hookform/resolvers'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },

  optimizeDeps: {
    // Pre-bundle the heaviest deps so cold dev-server starts don't stall
    // on first import of the transactions/analytics routes.
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@tanstack/react-table',
      'recharts',
      'framer-motion',
    ],
  },

  css: {
    devSourcemap: true,
  },
});