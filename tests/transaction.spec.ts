import { expect, test } from "@playwright/test";
import { installMockWallet } from "./../src/installMockWallet";
import { privateKeyToAccount } from "viem/accounts";
import { custom, http, isHex } from "viem";
import { sepolia } from "viem/chains";

test.beforeEach(async ({ page }) => {
  await installMockWallet({
    page,
    account: privateKeyToAccount(
      isHex(process.env.PRIVATE_KEY) ? process.env.PRIVATE_KEY : "0x",
    ),
    defaultChain: sepolia,
    debug: true,
  });
});

test("Metamask Wallet Test Dapp", async ({ page }) => {
  const baseUrl = "https://metamask.github.io/test-dapp/";
  await page.goto(baseUrl);
  await page.getByRole("button", { name: "USE MOCK WALLET" }).click();

  await expect(
    page.getByRole("heading", { name: "Active Provider" }),
  ).toBeVisible();
  await expect(page.getByText("Name: Mock Wallet")).toBeVisible();

  await page.locator("#personalSign").click();
  await expect(
    page.getByText(
      "0x7ac0fa03981bf136329ffaa21aed4f0ac7fa9a4837e966f16c5bf8783be7e43f41afe27bc4fb75",
    ),
  ).toBeVisible();
});
