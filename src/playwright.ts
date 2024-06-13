import type { Page } from "@playwright/test";
import { privateKeyWalletRequest } from "./privateKeyWalletRequest";

export async function installMockWallet(page: Page, privateKey: `0x${string}`) {
  // Connecting the browser context to the Node.js playwright context
  await page.exposeFunction("eip1193Request", eip1193Request);

  await page.addInitScript(
    ({ privateKey }) => {
      // This function needs to be declared in the browser context
      function announceMockWallet(privateKey: `0x${string}`) {
        const provider: EIP1193Provider = {
          request: async (request) => {
            return await eip1193Request({
              ...request,
              privateKey,
            });
          },
          on: () => {},
          removeListener: () => {},
        };

        const info: EIP6963ProviderInfo = {
          uuid: "350670db-19fa-4704-a166-e52e178b59d2",
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

      announceMockWallet(privateKey);

      window.addEventListener("eip6963:requestProvider", () => {
        announceMockWallet(privateKey);
      });
    },
    { privateKey },
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
  privateKey,
}: {
  method: string;
  params?: Array<unknown>;
  privateKey: `0x${string}`;
}) {
  const result = await privateKeyWalletRequest({
    method,
    params,
    privateKey,
  });
  console.log("eip1193Request", method, params, result);
  return result;
}
