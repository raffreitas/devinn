import { expect, test } from "../fixtures/test";
import { selectAvailableDay, selectOption } from "../helpers/ui";

test.describe("booking flows", () => {
  test.beforeEach(async ({ loginAsInnAdmin }) => {
    await loginAsInnAdmin();
  });

  test("opens the booking form from the booking calendar @smoke", async ({
    page,
  }) => {
    await page.goto("/");

    await page
      .getByRole("button", { name: /Quarto 101 -/ })
      .last()
      .click();

    const dialog = page.getByRole("dialog", { name: "Nova Reserva" });
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByText("Preencha os detalhes para criar uma nova reserva."),
    ).toBeVisible();
  });

  test("creates and updates a booking from the bookings list", async ({
    page,
    uniqueSuffix,
  }) => {
    const guestName = `Hospede E2E ${uniqueSuffix}`;
    const updatedGuestName = `${guestName} Editado`;
    const checkInDayIndex = 5 + (Number(uniqueSuffix.split("-")[0]) % 10);

    await page.goto("/bookings");
    await page.getByRole("button", { name: "Nova Reserva" }).click();

    const dialog = page.getByRole("dialog", { name: "Nova Reserva" });
    await selectOption(page, dialog.getByRole("combobox").nth(0), "Quarto 101");
    await selectAvailableDay(page, dialog, "Check-in", checkInDayIndex);
    await selectAvailableDay(page, dialog, "Check-out");
    await dialog.getByLabel("Nome Completo").fill(guestName);
    await dialog.getByLabel("E-mail").fill("e2e@devinn.local");
    await dialog.getByLabel("Valor Pago").fill("100");
    await dialog.getByRole("button", { name: "Salvar" }).click();

    const row = page.getByRole("row", { name: new RegExp(guestName) });
    await expect(row).toBeVisible();

    await row.getByRole("button", { name: "Ações" }).click();
    await page.getByRole("menuitem", { name: "Editar" }).click();

    const editDialog = page.getByRole("dialog", { name: "Editar Reserva" });
    await editDialog.getByLabel("Nome Completo").fill(updatedGuestName);
    await editDialog.getByRole("button", { name: "Salvar" }).click();

    const updatedRow = page.getByRole("row", { name: new RegExp(updatedGuestName) });
    await expect(updatedRow).toBeVisible();

    await updatedRow.getByRole("button", { name: "Ações" }).click();
    await page.getByRole("menuitem", { name: "Excluir" }).click();
    await page.getByRole("button", { name: "Excluir" }).click();
    await expect(updatedRow).not.toBeVisible();
  });
});
