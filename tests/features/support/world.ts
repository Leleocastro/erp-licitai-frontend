import { World, setWorldConstructor, Before, After } from "@cucumber/cucumber";
import { Browser, BrowserContext, Page, chromium } from "@playwright/test";

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  async open() {
    this.browser = await chromium.launch();
    this.context = await this.browser.newContext({ baseURL: "http://localhost:3001" });
    this.page = await this.context.newPage();
  }

  async close() {
    await this.page?.close();
    await this.context?.close();
    await this.browser?.close();
  }
}

setWorldConstructor(CustomWorld);

Before(async function () {
  this.setDefaultTimeout(15000);
  await (this as CustomWorld).open();
});

After(async function () {
  await (this as CustomWorld).close();
});
