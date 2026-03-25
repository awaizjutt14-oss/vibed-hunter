import { test, expect } from "@playwright/test";

test("landing page shows product pitch", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Content Hunter AI")).toBeVisible();
  await expect(page.getByText("Open dashboard")).toBeVisible();
});
