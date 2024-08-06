import type { BrowserContext, Page } from "@playwright/test";
import { Wallet, createWallet } from "./createWallet";
import { Chain, LocalAccount, Transport } from "viem";
import { randomUUID } from "crypto";

let wallets: Map<string, Wallet> = new Map();

export async function installMockWallet({
  debug,
  ...params
}: {
  debug?: boolean;
} & ({ page: Page } | { browserContext: BrowserContext }) &
  (
    | {
        account: LocalAccount;
        transports?: Record<number, Transport>;
        defaultChain?: Chain;
      }
    | {
        wallet: Wallet;
      }
  )) {
  const browserOrPage =
    "browserContext" in params ? params.browserContext : params.page;

  const wallet: Wallet =
    "wallet" in params
      ? params.wallet
      : createWallet(params.account, params.transports, params.defaultChain);

  // Connecting the browser context to the Node.js playwright context
  await browserOrPage.exposeFunction("eip1193Request", eip1193Request);

  // Everytime we call installMockWallet, we create a new uuid to identify the wallet.
  const uuid = randomUUID();
  wallets.set(uuid, wallet);

  await browserOrPage.addInitScript(
    ({ uuid, debug }) => {
      // This function needs to be declared in the browser context
      function announceMockWallet() {
        const provider: EIP1193Provider = {
          request: async (request) => {
            return await eip1193Request({
              ...request,
              uuid,
              debug,
            });
          },
          on: () => {},
          removeListener: () => {},
        };

        const info: EIP6963ProviderInfo = {
          uuid,
          name: "Mock Wallet",
          icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-cat'><path d='M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z'/><path d='M8 14v.5'/><path d='M16 14v.5'/><path d='M11.25 16.25h1.5L12 17l-.75-.75Z'/></svg>",
          rdns: "com.example.mock-wallet",
        };

        const detail: EIP6963ProviderDetail = { info, provider };
        const announceEvent = new CustomEvent("eip6963:announceProvider", {
          detail: Object.freeze(detail),
        });
        window.dispatchEvent(announceEvent);
      }

      announceMockWallet();

      window.addEventListener("eip6963:requestProvider", () => {
        announceMockWallet();
      });

      window.addEventListener("DOMContentLoaded", () => {
        announceMockWallet();
      });
    },
    { uuid, debug },
  );
}

interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

interface EIP1193Provider {
  request: (request: {
    method: string;
    params?: Array<unknown>;
  }) => Promise<unknown>; // Standard method for sending requests per EIP-1193
  on: () => void;
  removeListener: () => void;
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EIP1193Provider;
}

async function eip1193Request({
  method,
  params,
  uuid,
  debug,
}: {
  method: string;
  params?: Array<unknown>;
  uuid: string;
  debug?: boolean;
}) {
  const wallet = wallets.get(uuid);
  if (wallet == null) throw new Error("Account or transport not found");

  try {
    const result = await wallet.request({
      method,
      params,
    });

    if (debug === true) {
      console.log(
        "WALLET",
        uuid.substring(0, 8),
        "REQUEST",
        method,
        params,
        "RESULT",
        result,
      );
    }
    return result;
  } catch (e) {
    if (debug === true) {
      console.log(
        "WALLET",
        uuid.substring(0, 8),
        "REQUEST",
        method,
        params,
        "ERROR",
        e,
      );
    }
    throw e;
  }
}
