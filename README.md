# Wallet Mock

Fully functional end-to-end (E2E) tests for your decentralized application (dApp). This package installs a fully
operational, headless Web3 Wallet into the [Playwright](https://github.com/microsoft/playwright) Browser Context. The
wallet can be configured to execute on the blockchain or return mock responses. It is discoverable
through [EIP-6963](https://eips.ethereum.org/EIPS/eip-6963) and leverages [viem](https://github.com/wevm/viem) `Account`
and `Transport` interfaces for easy customization.

## Features

- Create comprehensive E2E tests for your dApps, including real blockchain transactions
- Mock specific calls or all calls to the wallet
- All wallet actions are pre-approved by default, eliminating the need for user interaction
- All wallet interactions are headless, meaning, no user interaction is required. You should be testing your dApp, not
  the wallet

## Quickstart

### Install

```shell
npm install -D @bozhkovatanas/wallet-mock
```

### Setup the Mock Wallet

```javascript
import {test} from "@playwright/test";
import {installMockWallet} from "@bozhkovatanas/wallet-mock";
import {privateKeyToAccount} from "viem/accounts";
import {http} from "viem";

// Replace with your actual RPC URLs
const ETHEREUM_RPC_URL = `https://YOUR_ETHEREUM_RPC_URL`;
const ARBITRUM_RPC_URL = `https://YOUR_ARBITRUM_RPC_URL`;

test.beforeEach(async ({page}) => {
    const transports = new Map<number, Transport>();
    transports.set(1, http(ETHEREUM_RPC_URL));
    transports.set(42161, http(ARBITRUM_RPC_URL));

    await installMockWallet({
        page,
        account: privateKeyToAccount(process.env.TEST_PRIVATE_KEY as Hash),
        transports,
})
    ;
});

test("Wallet Integration Test", async ({page}) => {
    await page.getByRole("button", {name: "Log In"}).click();
    await page.getByRole("button", {name: "Choose Wallet"}).click();
    await page.getByRole("menuitem", {name: "Mock Wallet"}).click();

    // Add your test assertions here
});
```

> **Note:** This setup will execute actual transactions on the blockchain without user intervention using the provided
> Private Key.

## 📚 Function: `installMockWallet`

The `installMockWallet` function is the main export of the library, designed to integrate a mock wallet into your
testing setup.

### Function Signature

```ts
type InstallMockWalletParamsWithBrowserContext = {
    account: LocalAccount,
    transports: Map<number, Transport>,
    browserContext: BrowserContext
};
type InstallMockWalletParamsWithPage = { 
    account: LocalAccount, 
    transports: Map<number, Transport>, 
    page: Page
};

async function installMockWallet(params: InstallMockWalletParamsWithBrowserContext | InstallMockWalletParamsWithPage): Promise<void>;
```
You can pass in either a `BrowserContext` or a `Page` object, depending on your Playwright testing setup.

### Uniswap Demo

The Mock Wallet will show up as an EIP-6963 compatible wallet.

<img width="500" alt="Screenshot Uniswap" src="https://github.com/johanneskares/wallet-mock/assets/1416628/b3d31df0-6273-42da-b00f-63bc8294a592">

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
     transports: new Map(1, http("http://127.0.0.1:8545")),
   });
   ```
