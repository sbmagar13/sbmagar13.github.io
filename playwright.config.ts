import { defineConfig, devices } from '@playwright/test';

// Smoke tests run against the static export in out/ (what GitHub Pages
// actually serves), not the dev server. Run `npm run build` first so
// out/ is fresh.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // The 3D scenes lazy-load heavy chunks; give assertions room on cold
  // CI runners.
  expect: { timeout: 15_000 },
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npx serve out -l 4173',
    port: 4173,
    reuseExistingServer: true,
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'] },
    },
  ],
});
