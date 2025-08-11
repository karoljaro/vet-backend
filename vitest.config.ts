import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/__tests__/**/*.test.ts'],
    globals: false,
    environment: 'node',
    reporters: ['default'],
    coverage: {
      enabled: false,
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
