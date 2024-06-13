# Wallet Mock
Fully functional E2E tests for your dApp. Installs a fully operational Mock Wallet into the [Playwright](https://github.com/microsoft/playwright) Browser Context, making it discoverable through [EIP-6963](https://eips.ethereum.org/EIPS/eip-6963) and leveraging [viem](https://github.com/wevm/viem) `Account` and `Transport` interfaces.

## Quickstart
```ts
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
  ...
});
```

Please note! This will execute actual transactions on the blockchain using the Private Key. You can use a [Custom Transport](https://viem.sh/docs/clients/transports/custom.html) to intercept the behavior.

