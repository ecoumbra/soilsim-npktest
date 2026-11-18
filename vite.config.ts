import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// base './' — коректне розгортання у підкаталозі GitHub Pages
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
