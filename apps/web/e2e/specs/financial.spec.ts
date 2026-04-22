import { expect, test } from "../fixtures/test";
import { selectOption } from "../helpers/ui";

test.describe("financial flows", () => {
  test.beforeEach(async ({ loginAsInnAdmin }) => {
    await loginAsInnAdmin();
  });

  test("creates an expense, filters it and marks it as paid", async ({
    page,
    uniqueSuffix,
  }) => {
    const expenseDescription = `Despesa E2E ${uniqueSuffix}`;
    const expenseCategory = `Categoria E2E ${uniqueSuffix}`;

    await page.goto("/financial");
    await expect(
      page.getByRole("heading", { name: "Dashboard Financeiro" }),
    ).toBeVisible();

    await page.goto("/financial/expenses");
    await page.getByRole("button", { name: "Nova Despesa" }).click();

    const dialog = page.getByRole("dialog", { name: "Nova Despesa" });
    await dialog.getByLabel("Descrição").fill(expenseDescription);
    await dialog.getByLabel("Valor").fill("12590");

    await dialog.getByRole("combobox").nth(0).click();
    await page
      .getByPlaceholder("Selecione uma categoria...")
      .fill(expenseCategory);
    await page
      .getByRole("option", {
        name: new RegExp(`Criar categoria "${expenseCategory}"`),
      })
      .click();
    await expect(page.getByText("Categoria criada com sucesso")).toBeVisible();
    await dialog.getByRole("combobox").nth(0).click();
    await page
      .getByPlaceholder("Selecione uma categoria...")
      .fill(expenseCategory);
    await page.getByRole("option", { name: expenseCategory }).click();

    await selectOption(
      page,
      dialog.getByRole("combobox", { name: "Método de Pagamento" }),
      "PIX",
    );
    await dialog.getByRole("button", { name: "Cadastrar" }).click();
    await expect(page.getByText("Despesa criada com sucesso")).toBeVisible();
    await expect(dialog).not.toBeVisible();

    const row = page.getByRole("row", { name: new RegExp(expenseDescription) });
    await expect(row).toBeVisible();

    await page.getByPlaceholder("Buscar despesas...").fill(expenseDescription);
    await expect(row).toBeVisible();

    await row.getByRole("button", { name: "Ações" }).click();
    await page.getByRole("menuitem", { name: "Marcar como Pago" }).click();
    await expect(page.getByText("Despesa atualizada com sucesso")).toBeVisible();

    await expect(row).toContainText("Pago");
  });
});
