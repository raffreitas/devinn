import { expect, type Page } from "@playwright/test";

const credentials = {
  email: "innadmin@pousada.local",
  password: "ChangeIt123!",
};

export async function loginAsInnAdmin(page: Page) {
  await page.goto("/login");

  await page.locator('input[type="email"]').fill(credentials.email);
  await page
    .locator('input[autocomplete="current-password"]')
    .fill(credentials.password);

  await Promise.all([
    page.waitForURL((url) => url.pathname === "/"),
    page.locator("form").getByRole("button", { name: "Entrar" }).click(),
  ]);

  await expect(page.getByRole("heading", { name: "Reservas" })).toBeVisible();
}
