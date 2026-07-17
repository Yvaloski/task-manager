import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
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
  ],
  webServer: [
    {
      command: 'mvn spring-boot:run',
      cwd: '../backend',
      url: 'http://localhost:8080/api/categories',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    // The frontend folder is not yet created, so frontend WebServer block is disabled for now.
    // {
    //   command: 'npm start',
    //   cwd: '../frontend',
    //   url: 'http://localhost:4200',
    //   reuseExistingServer: !process.env.CI,
    //   timeout: 120000,
    // }
  ],
});
