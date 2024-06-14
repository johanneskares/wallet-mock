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
          return await client.getAddresses();
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
          return await client.account.signMessage({
            message: {
              raw: params?.[0] as Hex,
            },
          });
        }

        if (method === "eth_sendTransaction") {
          const from = (params?.[0] as any).from;
          if (from !== account.address) throw new Error("Invalid from address");

          return await client.sendTransaction({
            to: (params?.[0] as any).to,
            data: (params?.[0] as any).data,
            gas: (params?.[0] as any).gas,
            gasPrice: (params?.[0] as any).gasPrice,
            value: (params?.[0] as any).value,
            maxFeePerGas: (params?.[0] as any).maxFeePerGas,
            maxPriorityFeePerGas: (params?.[0] as any).maxPriorityFeePerGas,
          });
        }

        return await client.request({
          method: method as any,
          params: params as any,
        });
      } catch (error) {
        console.error("Error within Mock Wallet:", error);
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
