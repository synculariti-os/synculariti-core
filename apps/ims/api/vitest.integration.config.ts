import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.spec.ts'],
    exclude: ['src/**', 'test/integration/**'],
    testTimeout: 30000,
    env: {
      REDIS_HOST: 'localhost',
      REDIS_PORT: '6379',
      DATABASE_URL: 'postgres://pkr:cbookair@localhost:5432/synculariti',
    },
  },
  resolve: {
    alias: {
      '@synculariti/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
      '@synculariti/validators': path.resolve(__dirname, '../../packages/validators/src/index.ts'),
    },
  },
});
