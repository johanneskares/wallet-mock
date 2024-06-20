# Wallet Mock
Fully functional end-to-end (E2E) tests for your decentralized application (dApp). This package installs a fully operational Web3 Wallet into the [Playwright](https://github.com/microsoft/playwright) Browser Context. The wallet can be configured to execute on the blockchain or return mock responses. It is discoverable through [EIP-6963](https://eips.ethereum.org/EIPS/eip-6963) and leverages [viem](https://github.com/wevm/viem) `Account` and `Transport` interfaces for easy customization.

## Features
- Create comprehensive E2E tests for your dApps, including real blockchain transactions
- Mock specific calls or all calls to the wallet
- All wallet actions are pre-approved by default, eliminating the need for user interaction

## Quickstart
### Install
```shell
npm install -D @johanneskares/wallet-mock
```
### Example
```ts
import { test } from "@playwright/test";
import { installMockWallet } from "@johanneskares/mock-wallet";
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

test("Your Test", async ({ page }) => {
  await page.getByRole("button", { name: "Log In" }).click();
  await page.getByRole("button", { name: "Choose Wallet" }).click();
  await page.getByRole("menuitem", { name: "Mock Wallet" }).click();
});
```
> **Note:** This setup will execute actual transactions on the blockchain without user intervention using the provided Private Key.

### Uniswap Demo
The Mock Wallet will show up as an EIP-6963 compatible wallet.

<img width="500" alt="Screenshot Uniswap" src="https://github.com/johanneskares/wallet-mock/assets/1416628/b3d31df0-6273-42da-b00f-63bc8294a592">

## Mocking
Here's a simple example of how to mock a specific function while using regular RPC calls for all other functions:

```ts
await installMockWallet({
  page,
  account: privateKeyToAccount(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  ),
  transport: (config) => {
    return custom({
      request: async ({ method, params }) => {
        // Mock only this RPC call
        if (method === "eth_sendTransaction") {
          return "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
        }

        return await http()(config).request({ method, params });
      },
    })(config);
  },
});
```

## Testing with Hardhat
To test with a local Hardhat node:

1. Start your local Hardhat Node:
   ```shell
   npx hardhat node
   ```

2. Connect the Mock Wallet to your Hardhat Node:
   ```ts
   await installMockWallet({
     page,
     account: privateKeyToAccount(
       "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
     ),
     transport: http("http://127.0.0.1:8545"),
   });
   ```
