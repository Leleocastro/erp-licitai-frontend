import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
  test("should display login form with data-cy tags", async ({ page }) => {
    await page.goto("/(auth)/login");

    await expect(page.locator("[data-cy='auth-login-page']")).toBeVisible();
    await expect(page.locator("[data-cy='auth-login-card']")).toBeVisible();
    await expect(page.locator("[data-cy='auth-login-input-email']")).toBeVisible();
    await expect(page.locator("[data-cy='auth-login-input-password']")).toBeVisible();
    await expect(page.locator("[data-cy='auth-login-btn-submit']")).toBeVisible();
  });

  test("should show validation errors for empty fields", async ({ page }) => {
    await page.goto("/(auth)/login");

    await page.locator("[data-cy='auth-login-btn-submit']").click();

    await expect(page.locator("[data-cy='auth-login-error-email']")).toBeVisible();
    await expect(page.locator("[data-cy='auth-login-error-password']")).toBeVisible();
  });
});
