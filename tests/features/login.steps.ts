import { Given, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";

Given("I am on the login page", async function () {
  await this.page.goto("/login");
});

Then("I should see the login form", async function () {
  await expect(this.page.locator("[data-cy='auth-login-card']")).toBeVisible();
});

Then("I should see the email input", async function () {
  await expect(this.page.locator("[data-cy='auth-login-input-email']")).toBeVisible();
});

Then("I should see the password input", async function () {
  await expect(this.page.locator("[data-cy='auth-login-input-password']")).toBeVisible();
});

Then("I should see the submit button", async function () {
  await expect(this.page.locator("[data-cy='auth-login-btn-submit']")).toBeVisible();
});
