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
    transports: {
      [sepolia.id]: (config) => {
        return custom({
          request: async ({ method, params }) => {
            let result: unknown;
            try {
              result = await http()(config).request({ method, params });
            } finally {
              console.log("METHOD", method, "PARAMS", params, "RESULT", result);
            }
            return result;
          },
        })(config);
      },
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

  await page.pause();
});
