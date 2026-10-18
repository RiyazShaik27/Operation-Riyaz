import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', timeout: 45000, workers: 1,
  reporter: [['list'], ['json', { outputFile: 'evidence/regression-results.json' }]],
  use: { baseURL:'http://127.0.0.1:4173', browserName:'chromium', channel:process.env.PLAYWRIGHT_CHANNEL || 'chrome', headless:true, launchOptions:{args:['--enable-webgl']}, screenshot:'only-on-failure', trace:'retain-on-failure' },
  webServer: {command:'npm run dev -- --port 4173',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI,timeout:60000},
});
