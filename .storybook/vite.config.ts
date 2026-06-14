import { defineConfig } from 'vite';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '..'),
      'next/navigation': path.resolve(__dirname, './mock-next-navigation.ts'),
      'next/link': path.resolve(__dirname, './mock-next-link.tsx'),
    },
  },
  plugins: [tsconfigPaths()],
});
