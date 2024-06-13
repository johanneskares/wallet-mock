import {
  LocalAccount,
  Hex,
  Transport,
  createWalletClient,
  fromHex,
} from "viem";
import * as chains from "viem/chains";

export type Wallet = ReturnType<typeof createWallet>;

export function createWallet(account: LocalAccount, transport: Transport) {
  let chainId: string | undefined;

  return {
    request: async ({
      method,
      params,
    }: {
      method: string;
      params?: Array<unknown>;
    }) => {
      try {
        const client = createWalletClient({
          account,
          chain: getChain(chainId),
          transport,
        });

        if (method === "eth_accounts" || method === "eth_requestAccounts") {
          return client.getAddresses();
        }

        if (
          method === "wallet_requestPermissions" ||
          method === "wallet_revokePermissions"
        ) {
          return [{ parentCapability: "eth_accounts" }];
        }

        if (method === "wallet_switchEthereumChain") {
          chainId = (params?.[0] as any).chainId;
          return null;
        }

        if (method === "personal_sign") {
          return client.account.signMessage({
            message: {
              raw: params?.[0] as Hex,
            },
          });
        }

        return await client.request({
          method: method as any,
          params: params as any,
        });
      } catch (error) {
        console.error("error", error);
        return null;
      }
    },
  };
}

function getChain(chainIdHex: string | undefined) {
  if (!chainIdHex) return chains.mainnet;

  const chainId = fromHex(chainIdHex as Hex, "number");
  for (const chain of Object.values(chains)) {
    if ("id" in chain) {
      if (chain.id === chainId) {
        return chain;
      }
    }
  }

  return chains.mainnet;
}
