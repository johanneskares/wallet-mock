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

test("Metamask Wallet Test Dapp", async ({ page }) => {
  const baseUrl = "https://metamask.github.io/test-dapp/";
  await page.goto(baseUrl);
  await page.getByRole("button", { name: "USE MOCK WALLET" }).click();

  await expect(
    page.getByRole("heading", { name: "Active Provider" }),
  ).toBeVisible();
  await expect(page.getByText("Name: Mock Wallet")).toBeVisible();
});
