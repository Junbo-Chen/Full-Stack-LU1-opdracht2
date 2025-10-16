// 📝 playwright.config.ts

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test',
  testMatch: '**/*.e2e-spec.ts',
  
  // Parallelize tests
  fullyParallel: true,
  
  // Fail on console errors
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: 'html',

  // Shared settings
  use: {
    // Base URL
    baseURL: 'http://localhost:4200',
    
    // Screenshots on failure
    screenshot: 'only-on-failure',
    
    // Videos on failure
    video: 'retain-on-failure',
    
    // Trace on failure
    trace: 'on-first-retry',
  },

  // Webserver
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  // Test config
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },

  // Browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
});