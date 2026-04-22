import { expect, test } from "../fixtures/test";

test.describe("frontend authentication", () => {
  test("redirects protected routes to login @smoke", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(
      page.getByText("Use seu email e senha para acessar o DevInn."),
    ).toBeVisible();
  });

  test("logs in and preserves the session after reload @smoke", async ({
    page,
    loginAsInnAdmin,
  }) => {
    await loginAsInnAdmin();

    await page.reload();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: "Reservas" })).toBeVisible();
  });

  test("redirects authenticated users away from guest routes @smoke", async ({
    page,
    loginAsInnAdmin,
  }) => {
    await loginAsInnAdmin();

    await page.goto("/login");

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: "Reservas" })).toBeVisible();
  });
});
