import {expect, Page, test} from "@playwright/test";
import {installMockWallet} from "./../src/installMockWallet";
import {privateKeyToAccount} from "viem/accounts";
import {http, isHex} from "viem";
import {mainnet} from "viem/chains";

let page: Page = null;
test.beforeEach(async ({ context }) => {
  page = await context.newPage();
  await installMockWallet({
    page,
    account: privateKeyToAccount(
        isHex(process.env.PRIVATE_KEY) ? process.env.PRIVATE_KEY : "0x",
    ),
    transports: new Map().set(1, http(mainnet.rpcUrls.default.http[0])),
  });
});

test("Metamask Wallet Test Dapp", async () => {
  const baseUrl = "https://metamask.github.io/test-dapp/";
  await page.goto(baseUrl);
  await page.getByRole("button", { name: "USE MOCK WALLET" }).click();
  await expect(page.getByRole('heading', {name: 'Active Provider'})).toBeVisible();
  await expect(page.getByText('Name: Mock Wallet')).toBeVisible();
});
