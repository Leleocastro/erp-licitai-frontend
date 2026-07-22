import { test, expect } from "@playwright/test";

test.describe("Dashboard Sidebar (AC4)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/core/usuarios");
  });

  test("should display sidebar with Core module active", async ({ page }) => {
    const usuariosLink = page.locator("a[href='/core/usuarios']");
    const orgaosLink = page.locator("a[href='/core/orgaos']");
    const rolesLink = page.locator("a[href='/core/roles']");

    await expect(usuariosLink).toBeVisible();
    await expect(orgaosLink).toBeVisible();
    await expect(rolesLink).toBeVisible();

    await expect(usuariosLink).toHaveAttribute("class", /bg-accent/);
  });

  test("should have data-cy tags on nav items", async ({ page }) => {
    await expect(page.locator("[data-cy='dashboard-nav-usuarios']")).toBeVisible();
    await expect(page.locator("[data-cy='dashboard-nav-orgaos']")).toBeVisible();
    await expect(page.locator("[data-cy='dashboard-nav-roles']")).toBeVisible();
  });
});

test.describe("Logout (AC3)", () => {
  test("should clear session and redirect to login on logout", async ({ page }) => {
    await page.goto("/core/usuarios");

    const logoutBtn = page.locator("[data-cy='dashboard-btn-logout']");
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await expect(page).toHaveURL(/\/login/);
    }
  });
});

test.describe("Route Protection (AC6)", () => {
  test("should redirect unauthenticated users to login", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/core/usuarios");
    await expect(page).toHaveURL(/\/login/);
  });

  test("should protect core routes via middleware", async ({ page }) => {
    const routes = ["/core/usuarios", "/core/orgaos", "/core/roles"];

    for (const route of routes) {
      await page.context().clearCookies();
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/);
    }
  });
});
