import {
  Hex,
  Transport,
  createWalletClient,
  fromHex, publicActions, Account, http,
} from "viem";
import * as chains from "viem/chains";

export type Wallet = ReturnType<typeof createWallet>;

export function createWallet(account: Account, transports: Map<number, Transport>) {
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
        let chain = getChain(chainId);
        const client = createWalletClient({
          account,
          chain: chain,
          transport: transports.get(chain.id) ?? http(),
        }).extend(publicActions);

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
          if (!client.account.signMessage) throw new Error("Method `personal_sign` not supported by account");
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

        if(method === "eth_chainId") {
          return chainId;
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
