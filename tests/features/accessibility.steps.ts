import { Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { CustomWorld } from "./support/world";

Then("the page should have no WCAG violations", async function (this: CustomWorld) {
  const results = await new AxeBuilder({ page: this.page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

Then("the email input should have aria-invalid", async function (this: CustomWorld) {
  await expect(this.page.locator("[data-cy='auth-login-input-email']")).toHaveAttribute("aria-invalid", "true");
});

Then("the password input should have aria-invalid", async function (this: CustomWorld) {
  await expect(this.page.locator("[data-cy='auth-login-input-password']")).toHaveAttribute("aria-invalid", "true");
});

Then("the email input should have aria-describedby", async function (this: CustomWorld) {
  const describedBy = await this.page.locator("[data-cy='auth-login-input-email']").getAttribute("aria-describedby");
  expect(describedBy).toBeTruthy();
});

Then("the password input should have aria-describedby", async function (this: CustomWorld) {
  const describedBy = await this.page.locator("[data-cy='auth-login-input-password']").getAttribute("aria-describedby");
  expect(describedBy).toBeTruthy();
});
