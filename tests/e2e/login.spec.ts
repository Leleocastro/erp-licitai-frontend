import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("AC1 - should display login form with data-cy tags", async ({ page }) => {
    await expect(page.locator("[data-cy='auth-login-page']")).toBeVisible();
    await expect(page.locator("[data-cy='auth-login-card']")).toBeVisible();
    await expect(page.locator("[data-cy='auth-login-input-email']")).toBeVisible();
    await expect(page.locator("[data-cy='auth-login-input-password']")).toBeVisible();
    await expect(page.locator("[data-cy='auth-login-btn-submit']")).toBeVisible();
    await expect(page.locator("[data-cy='auth-login-label-email']")).toBeVisible();
    await expect(page.locator("[data-cy='auth-login-label-password']")).toBeVisible();
    await expect(page.locator("[data-cy='auth-login-title']")).toBeVisible();
    await expect(page.locator("[data-cy='auth-login-card-title']")).toBeVisible();
    await expect(page.locator("[data-cy='auth-login-card-description']")).toBeVisible();
  });

  test("AC1 - should show validation errors for empty fields", async ({ page }) => {
    await page.locator("[data-cy='auth-login-btn-submit']").click();

    await expect(page.locator("[data-cy='auth-login-error-email']")).toBeVisible();
    await expect(page.locator("[data-cy='auth-login-error-password']")).toBeVisible();
  });

  test("AC1 - should show validation error for invalid email", async ({ page }) => {
    await page.locator("[data-cy='auth-login-input-email']").fill("not-an-email");
    await page.locator("[data-cy='auth-login-btn-submit']").click();

    await expect(page.locator("[data-cy='auth-login-error-email']")).toBeVisible();
  });

  test("AC1 - should show validation error for short password", async ({ page }) => {
    await page.locator("[data-cy='auth-login-input-email']").fill("user@test.com");
    await page.locator("[data-cy='auth-login-input-password']").fill("123");
    await page.locator("[data-cy='auth-login-btn-submit']").click();

    await expect(page.locator("[data-cy='auth-login-error-password']")).toBeVisible();
  });

  test("AC1 - should show global error on invalid credentials", async ({ page }) => {
    await page.locator("[data-cy='auth-login-input-email']").fill("wrong@test.com");
    await page.locator("[data-cy='auth-login-input-password']").fill("wrongpass");
    await page.locator("[data-cy='auth-login-btn-submit']").click();

    await expect(page.locator("[data-cy='auth-login-error-global']")).toBeVisible();
  });

  test("AC2 - should block UI after 5 failed attempts with countdown", async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      await page.locator("[data-cy='auth-login-input-email']").fill("wrong@test.com");
      await page.locator("[data-cy='auth-login-input-password']").fill("wrongpass");
      await page.locator("[data-cy='auth-login-btn-submit']").click();
      await page.waitForTimeout(500);
    }

    await expect(page.locator("[data-cy='auth-login-btn-submit']")).toBeDisabled();
    await expect(page.locator("[data-cy='auth-login-blocked-message']")).toBeVisible();
    await expect(page.locator("[data-cy='auth-login-countdown']")).toBeVisible();
  });
});
