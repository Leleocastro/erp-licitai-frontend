import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "./support/world";

Given("I am on the login page", async function (this: CustomWorld) {
  await this.page.goto("/login");
});

When("I click the submit button without filling fields", async function (this: CustomWorld) {
  await this.page.locator("[data-cy='auth-login-btn-submit']").click();
});

When("I fill email with {string}", async function (this: CustomWorld, email: string) {
  await this.page.locator("[data-cy='auth-login-input-email']").fill(email);
});

When("I fill password with {string}", async function (this: CustomWorld, password: string) {
  await this.page.locator("[data-cy='auth-login-input-password']").fill(password);
});

When("I click the submit button", async function (this: CustomWorld) {
  await this.page.locator("[data-cy='auth-login-btn-submit']").click();
});

When("I attempt login {int} times with wrong credentials", async function (this: CustomWorld, times: number) {
  for (let i = 0; i < times; i++) {
    await this.page.locator("[data-cy='auth-login-input-email']").fill("wrong@test.com");
    await this.page.locator("[data-cy='auth-login-input-password']").fill("wrongpass");
    await this.page.locator("[data-cy='auth-login-btn-submit']").click();
    await this.page.waitForTimeout(500);
  }
});

Then("I should see the login form", async function (this: CustomWorld) {
  await expect(this.page.locator("[data-cy='auth-login-card']")).toBeVisible();
});

Then("I should see the email input", async function (this: CustomWorld) {
  await expect(this.page.locator("[data-cy='auth-login-input-email']")).toBeVisible();
});

Then("I should see the password input", async function (this: CustomWorld) {
  await expect(this.page.locator("[data-cy='auth-login-input-password']")).toBeVisible();
});

Then("I should see the submit button", async function (this: CustomWorld) {
  await expect(this.page.locator("[data-cy='auth-login-btn-submit']")).toBeVisible();
});

Then("all interactive elements should have data-cy tags", async function (this: CustomWorld) {
  const elements = [
    "[data-cy='auth-login-input-email']",
    "[data-cy='auth-login-input-password']",
    "[data-cy='auth-login-btn-submit']",
    "[data-cy='auth-login-label-email']",
    "[data-cy='auth-login-label-password']",
  ];
  for (const selector of elements) {
    await expect(this.page.locator(selector)).toBeVisible();
  }
});

Then("I should see the email error message", async function (this: CustomWorld) {
  await expect(this.page.locator("[data-cy='auth-login-error-email']")).toBeVisible();
});

Then("I should see the password error message", async function (this: CustomWorld) {
  await expect(this.page.locator("[data-cy='auth-login-error-password']")).toBeVisible();
});

Then("I should see the global error message", async function (this: CustomWorld) {
  await expect(this.page.locator("[data-cy='auth-login-error-global']")).toBeVisible();
});

Then("the submit button should be disabled", async function (this: CustomWorld) {
  await expect(this.page.locator("[data-cy='auth-login-btn-submit']")).toBeDisabled();
});

Then("I should see the blocked message", async function (this: CustomWorld) {
  await expect(this.page.locator("[data-cy='auth-login-blocked-message']")).toBeVisible();
});

Then("I should see the countdown timer", async function (this: CustomWorld) {
  await expect(this.page.locator("[data-cy='auth-login-countdown']")).toBeVisible();
});
