import { defineConfig } from "@playwright/test";
import { ENV } from "./env.config";

export default defineConfig({
  testDir: "../tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  reporter: [
    ["html", { outputFolder: "../playwright-report", open: "never" }],
    ["list"],
  ],
  use: {
    baseURL: ENV.API_BASE_URL,
    extraHTTPHeaders: {
      Accept: "application/json",
    },
  },
});
