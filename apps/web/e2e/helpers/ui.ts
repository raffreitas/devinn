import type { Locator, Page } from "@playwright/test";

export async function selectOption(
  page: Page,
  trigger: Locator,
  optionText: string,
) {
  await trigger.click();
  await page
    .locator('[data-slot="select-content"] [data-slot="select-item"]')
    .filter({ hasText: optionText })
    .first()
    .click();
}

export async function selectAvailableDay(
  page: Page,
  formRoot: Locator,
  labelText: string,
  dayIndex = 0,
) {
  const formItem = formRoot
    .locator("label", { hasText: labelText })
    .first()
    .locator("xpath=..");

  await formItem.getByRole("button").click();
  await page
    .locator('[data-slot="calendar"] button[data-day]:not([disabled])')
    .nth(dayIndex)
    .click();
}
