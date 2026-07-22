import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";

Given("I am logged in", async function () {
  await this.page.goto("/login");
  await this.page.locator("[data-cy='auth-login-input-email']").fill("admin@licitai.com");
  await this.page.locator("[data-cy='auth-login-input-password']").fill("admin123");
  await this.page.locator("[data-cy='auth-login-btn-submit']").click();
  await this.page.waitForURL("**/core/**");
});

Given("I am not logged in", async function () {
  await this.context.clearCookies();
});

Given("I am on the dashboard", async function () {
  await this.page.goto("/core/usuarios");
});

When("I try to access {string}", async function (path: string) {
  await this.page.goto(path);
});

When("I click the logout button", async function () {
  const logoutBtn = this.page.locator("[data-cy='dashboard-btn-logout']");
  if (await logoutBtn.isVisible()) {
    await logoutBtn.click();
  }
});

Then("I should see the sidebar navigation", async function () {
  await expect(this.page.locator("nav")).toBeVisible();
});

Then("the Usuarios link should be active", async function () {
  const link = this.page.locator("a[href='/core/usuarios']");
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("class", /bg-accent/);
});

Then("I should see the Orgaos link", async function () {
  await expect(this.page.locator("a[href='/core/orgaos']")).toBeVisible();
});

Then("I should see the Roles link", async function () {
  await expect(this.page.locator("a[href='/core/roles']")).toBeVisible();
});

Then("I should be redirected to the login page", async function () {
  await expect(this.page).toHaveURL(/\/login/);
});

Then("my session should be cleared", async function () {
  const cookies = await this.context.cookies();
  const tokenCookie = cookies.find((c: { name: string }) => c.name === "token");
  expect(tokenCookie).toBeUndefined();
});
