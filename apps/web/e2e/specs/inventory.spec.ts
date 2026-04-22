import type { Page } from "@playwright/test";
import { expect, test } from "../fixtures/test";
import { selectOption } from "../helpers/ui";

async function createCategory(page: Page, name: string) {
  await page.goto("/inventory/categories");

  await page.getByRole("button", { name: "Nova Categoria" }).click();

  const dialog = page.getByRole("dialog", { name: "Nova Categoria" });
  await dialog.getByLabel("Nome").fill(name);
  await dialog.getByLabel("Capacidade (Pessoas)").fill("3");
  await dialog.getByLabel("Preço Base").fill("35000");
  await dialog.getByLabel("Preço Pessoa Extra").fill("5000");
  await dialog
    .getByLabel("Descrição (opcional)")
    .fill(`Categoria criada por E2E: ${name}`);
  await dialog.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByRole("row", { name: new RegExp(name) })).toBeVisible();
}

test.describe("inventory management", () => {
  test.beforeEach(async ({ loginAsInnAdmin }) => {
    await loginAsInnAdmin();
  });

  test("creates and updates a room category", async ({
    page,
    uniqueSuffix,
  }) => {
    const categoryName = `Categoria E2E ${uniqueSuffix}`;
    const updatedCategoryName = `${categoryName} Editada`;

    await createCategory(page, categoryName);

    const row = page.getByRole("row", { name: new RegExp(categoryName) });
    await row.getByRole("button", { name: "Editar" }).click();

    const dialog = page.getByRole("dialog", { name: "Nova Categoria" });
    await dialog.getByLabel("Nome").fill(updatedCategoryName);
    await dialog.getByRole("button", { name: "Salvar" }).click();

    await expect(
      page.getByRole("row", { name: new RegExp(updatedCategoryName) }),
    ).toBeVisible();
  });

  test("creates a room and filters it by category", async ({
    page,
    uniqueSuffix,
  }) => {
    const categoryName = `Categoria Quarto ${uniqueSuffix}`;
    const roomNumber = 200 + (Number(uniqueSuffix.split("-")[0]) % 700);

    await createCategory(page, categoryName);

    await page.goto("/inventory/rooms");
    await page.getByRole("button", { name: "Novo Quarto" }).click();

    const sheet = page.getByRole("dialog", { name: "Novo Quarto" });
    await selectOption(page, sheet.getByRole("combobox").nth(0), categoryName);
    await sheet.getByLabel("Número do Quarto").fill(String(roomNumber));
    await sheet
      .getByLabel("Descrição (opcional)")
      .fill(`Quarto E2E ${uniqueSuffix}`);
    await sheet.getByRole("button", { name: "Próximo" }).click();
    await sheet.getByRole("button", { name: "Concluir" }).click();
    await expect(page.getByText("Quarto criado com sucesso")).toBeVisible();
    await expect(sheet).not.toBeVisible();

    await selectOption(page, page.getByRole("combobox").nth(0), categoryName);
    const row = page.getByRole("row", { name: new RegExp(String(roomNumber)) });
    await expect(row).toBeVisible();
  });
});
