import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility (AC7)", () => {
  test("login page should have no accessibility violations", async ({ page }) => {
    await page.goto("/login");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("login form inputs should have aria-invalid on error", async ({ page }) => {
    await page.goto("/login");
    await page.locator("[data-cy='auth-login-btn-submit']").click();

    const emailInput = page.locator("[data-cy='auth-login-input-email']");
    const passwordInput = page.locator("[data-cy='auth-login-input-password']");

    await expect(emailInput).toHaveAttribute("aria-invalid", "true");
    await expect(passwordInput).toHaveAttribute("aria-invalid", "true");
  });

  test("login form inputs should have aria-describedby for error messages", async ({ page }) => {
    await page.goto("/login");
    await page.locator("[data-cy='auth-login-btn-submit']").click();

    const emailInput = page.locator("[data-cy='auth-login-input-email']");
    const passwordInput = page.locator("[data-cy='auth-login-input-password']");

    const emailDescribedBy = await emailInput.getAttribute("aria-describedby");
    const passwordDescribedBy = await passwordInput.getAttribute("aria-describedby");

    expect(emailDescribedBy).toBeTruthy();
    expect(passwordDescribedBy).toBeTruthy();

    if (emailDescribedBy) {
      await expect(page.locator(`#${emailDescribedBy}`)).toBeVisible();
    }
    if (passwordDescribedBy) {
      await expect(page.locator(`#${passwordDescribedBy}`)).toBeVisible();
    }
  });

  test("dashboard page should have no accessibility violations", async ({ page }) => {
    await page.goto("/core/usuarios");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
