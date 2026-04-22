import { defineConfig, devices } from "@playwright/test";

const webPort = Number(process.env.PLAYWRIGHT_WEB_PORT ?? 4173);
const apiPort = Number(process.env.PLAYWRIGHT_API_PORT ?? 5109);
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${webPort}`;
const apiURL = process.env.PLAYWRIGHT_API_URL ?? `http://localhost:${apiPort}`;
const webServer = process.env.PLAYWRIGHT_DISABLE_WEBSERVER
  ? undefined
  : [
      {
        command:
          "dotnet run --project ../api/src/DevInn.WebApi/DevInn.WebApi.csproj --launch-profile http",
        url: `${apiURL}/health`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          ASPNETCORE_ENVIRONMENT: "Development",
          ALLOWED_ORIGINS: baseURL,
          Observability__Enabled: "false",
        },
      },
      {
        command: `pnpm dev --host localhost --port ${webPort}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          VITE_API_URL: apiURL,
        },
      },
    ];

export default defineConfig({
  testDir: "./e2e/specs",
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
  ],
  outputDir: "test-results",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    headless: true,
    testIdAttribute: "data-testid",
    viewport: { width: 1440, height: 900 },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  webServer,
});
