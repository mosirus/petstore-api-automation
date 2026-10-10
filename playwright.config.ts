import { defineConfig } from '@playwright/test';
import { config } from './src/config';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  // The public Petstore sandbox is shared and occasionally unstable.
  retries: isCI ? 2 : 0,
  workers: isCI ? 4 : undefined,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ...(isCI ? [['github'] as const] : []),
  ],
  use: {
    baseURL: config.baseUrl,
    extraHTTPHeaders: {
      Accept: 'application/json',
    },
    // API traces include every request/response, which makes CI failures debuggable.
    trace: 'retain-on-failure',
  },
});
