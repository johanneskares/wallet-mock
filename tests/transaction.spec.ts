import { expect, test } from "@playwright/test";
import { installMockWallet } from "./../src/installMockWallet";
import { privateKeyToAccount } from "viem/accounts";
import { custom, http, isHex } from "viem";

test.beforeEach(async ({ page }) => {
  await installMockWallet({
    page,
    account: privateKeyToAccount(
      isHex(process.env.PRIVATE_KEY) ? process.env.PRIVATE_KEY : "0x",
    ),
    transport: (config) => {
      return custom({
        request: async ({ method, params }) => {
          console.log("LOG", method, params);
          return await http()(config).request({ method, params });
        },
      })(config);
    },
  });
});

test("uniswap", async ({ page }) => {
  const baseUrl = "https://app.uniswap.org";
  await page.goto(baseUrl);
  await page.getByRole("button", { name: "Connect" }).first().click();

  await page.waitForTimeout(30000);
});

test("talentir", async ({ page }) => {
  const baseUrl = "https://dev.talentir.com";
  // const baseUrl = "http://localhost:3000";
  await page.goto(baseUrl);

  await page.getByRole("button", { name: "Accept all" }).click();
  await page.getByRole("button", { name: "Log In" }).click();
  await page.getByRole("button", { name: "Choose Wallet" }).click();
  await page.getByRole("menuitem", { name: "Mock Wallet" }).last().click();

  await expect(page).toHaveURL(baseUrl + "/dashboard/assets");
  await page.getByRole("link", { name: "Wallet" }).click();

  await page.waitForTimeout(2000);

  await page.getByLabel("Transfer").click();
  await page
    .getByPlaceholder("0xe0a942ff2e1724A2fe10627728bE327a43fE8C23")
    .fill("0xe0a942ff2e1724A2fe10627728bE327a43fE8C26");

  await page.getByPlaceholder("-").fill("- 0.01");

  await page.getByRole("button", { name: "Send USDC" }).click();
  await page.getByLabel("I take full responsibility").click();
  await page.getByRole("button", { name: "Confirm" }).click();

  await expect(
    page.getByRole("heading", { name: "Transaction Successful" }),
  ).toBeVisible({ timeout: 30000 });
});
