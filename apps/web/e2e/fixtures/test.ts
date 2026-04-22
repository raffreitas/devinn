import { test as base, expect } from "@playwright/test";
import { loginAsInnAdmin as performInnAdminLogin } from "../helpers/auth";

type DevInnFixtures = {
  loginAsInnAdmin: () => Promise<void>;
  uniqueSuffix: string;
};

export const test = base.extend<DevInnFixtures>({
  uniqueSuffix: [
    async ({ page: _page }, use, testInfo) => {
      await use(`${Date.now()}-${testInfo.workerIndex}`);
    },
    { auto: true },
  ],
  loginAsInnAdmin: async ({ page }, use) => {
    await use(async () => {
      await performInnAdminLogin(page);
    });
  },
});

export { expect };
