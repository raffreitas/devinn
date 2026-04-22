import { expect, test } from "../fixtures/test";

test.describe("main navigation", () => {
  test("navigates through the primary sidebar flows @smoke", async ({
    page,
    loginAsInnAdmin,
  }) => {
    await loginAsInnAdmin();

    await page.getByRole("link", { name: "Categorias" }).click();
    await expect(page).toHaveURL(/\/inventory\/categories$/);
    await expect(
      page.getByRole("heading", { name: "Categorias" }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Quartos" }).click();
    await expect(page).toHaveURL(/\/inventory\/rooms$/);
    await expect(page.getByRole("heading", { name: "Quartos" })).toBeVisible();

    await page.getByRole("link", { name: "Reservas" }).click();
    await expect(page).toHaveURL(/\/bookings$/);
    await expect(page.getByRole("heading", { name: "Reservas" })).toBeVisible();

    await page.getByRole("link", { name: "Calendário" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: "Reservas" })).toBeVisible();
  });
});
