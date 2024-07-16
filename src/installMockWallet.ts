import type {BrowserContext} from "@playwright/test";
import {createWallet, Wallet} from "./createWallet";
import {LocalAccount, Transport} from "viem";
import {randomUUID} from "crypto";

let wallets: Map<string, Wallet> = new Map();

export async function installMockWallet({
  browserContext,
  account,
  transports,
}: {
  browserContext: BrowserContext;
  account: LocalAccount;
  transports: Map<number, Transport>;
}) {
  // Connecting the browser context to the Node.js playwright context
  await browserContext.exposeFunction("eip1193Request", eip1193Request);

  // Everytime we call installMockWallet, we create a new uuid to identify the wallet.
  const uuid = randomUUID();
  wallets.set(uuid, createWallet(account, transports));

  await browserContext.addInitScript(
    ({ uuid }) => {
      // This function needs to be declared in the browser context
      function announceMockWallet() {
        const provider: EIP1193Provider = {
          request: async (request) => {
            return await eip1193Request({
              ...request,
              uuid,
            });
          },
          on: () => {},
          removeListener: () => {},
        };

        const info: EIP6963ProviderInfo = {
          uuid,
          name: "Mock Wallet",
          icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>",
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
    },
    { uuid },
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
}: {
  method: string;
  params?: Array<unknown>;
  uuid: string;
}) {
  const wallet = wallets.get(uuid);
  if (wallet == null) throw new Error("Account or transport not found");

  // console.log("eip1193Request", method, params);

  const result = await wallet.request({
    method,
    params,
  });

  // console.log("eip1193Result", result);
  return result;
}
