import {
  LocalAccount,
  Hex,
  Transport,
  createWalletClient,
  fromHex,
  type Chain,
  http,
} from "viem";
import * as chains from "viem/chains";

export type Wallet = ReturnType<typeof createWallet>;
export type WalletRequest = Wallet["request"];

export function createWallet(
  account: LocalAccount,
  transports?: Record<number, Transport>,
  defaultChain?: Chain,
) {
  let chain: Chain = defaultChain ?? getChain();

  return {
    request: async ({
      method,
      params,
    }: {
      method: string;
      params?: Array<unknown>;
    }) => {
      const client = createWalletClient({
        account,
        chain,
        transport: transports?.[chain.id] ?? http(),
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

      if (method === "wallet_getPermissions") return [];

      if (method === "wallet_switchEthereumChain") {
        chain = getChain((params?.[0] as any).chainId);
        return null;
      }

      if (method === "personal_sign") {
        return await client.account.signMessage({
          message: {
            raw: params?.[0] as Hex,
          },
        });
      }

      if (method === "eth_signTypedData") {
        throw new Error("eth_signTypedData is not yet supported");
      }

      if (method === "eth_signTypedData_v3") {
        throw new Error("eth_signTypedData_v4 is not yet supported");
      }

      if (method === "eth_signTypedData_v4") {
        throw new Error("eth_signTypedData_v4 is not yet supported");
      }

      if (method === "eth_sendTransaction") {
        const from = (params?.[0] as any).from;
        if (from !== account.address) throw new Error("Invalid from address");

        return await client.sendTransaction({
          to: (params?.[0] as any).to,
          data: (params?.[0] as any).data,
          value: (params?.[0] as any).value,
          // Let viem handle the gas calcutation
          // gas: (params?.[0] as any).gas ?? (params?.[0] as any).gasLimit,
          // gasPrice: (params?.[0] as any).gasPrice,
          // maxFeePerGas: (params?.[0] as any).maxFeePerGas,
          // maxPriorityFeePerGas: (params?.[0] as any).maxPriorityFeePerGas,
        });
      }

      return await client.request({
        method: method as any,
        params: params as any,
      });
    },
  };
}

function getChain(chainIdHex?: string) {
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
