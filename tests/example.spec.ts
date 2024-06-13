import { expect, test } from "@playwright/test";
import { installMockWallet } from "./../src/installMockWallet";
import { privateKeyToAccount } from "viem/accounts";
import { http } from "viem";

test.beforeEach(async ({ page }) => {
  await installMockWallet({
    page,
    account: privateKeyToAccount(
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    ),
    transport: http(),
  });
});

test("talentir", async ({ page }) => {
  await page.goto("https://dev.talentir.com");

  await page.getByRole("button", { name: "Accept all" }).click();

  await page.getByRole("button", { name: "Log In" }).click();

  await page.getByRole("button", { name: "Choose Wallet" }).click();

  await page.getByRole("menuitem", { name: "Mock Wallet" }).last().click();

  await expect(page).toHaveURL("https://dev.talentir.com/signup/username");
  await page.goto("https://dev.talentir.com/dashboard/wallet");

  // wait for 10 seconds
  await page.waitForTimeout(2000);
});

test("jumper", async ({ page }) => {
  await page.goto("https://jumper.exchange/exchange");

  await page.getByRole("button", { name: "Connect" }).click();

  await page.getByRole("button", { name: "Get Started" }).click();

  // await page.getByRole("button", { name: "Choose Wallet" }).click();

  // await page.getByRole("menuitem", { name: "Mock Wallet" }).click();

  // wait for 10 seconds
  await page.waitForTimeout(2000);
});
