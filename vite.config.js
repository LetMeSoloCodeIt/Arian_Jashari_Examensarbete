import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage',
      'date-fns',
      'uuid',
      'react-hook-form',
      '@hookform/resolvers/zod',
      'zod',
      'lucide-react',
      'recharts',
      'react-day-picker',
      'sonner',
      'cmdk',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      'vaul',
      'input-otp',
      'next-themes',
      'embla-carousel-react',
      'react-resizable-panels'
    ],
  },
}) 