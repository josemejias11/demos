import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['automation/tests/**/*.test.ts', 'tests/**/*.test.ts'],
    environment: 'node',
    globals: false,
    isolate: true,
  },
});
