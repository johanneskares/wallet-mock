import { privateKeyToAccount } from "viem/accounts";
import { Hex, createWalletClient, fromHex, http } from "viem";
import * as chains from "viem/chains";

let chainId: string | undefined;

export async function privateKeyWalletRequest({
  method,
  params,
  privateKey,
}: {
  method: string;
  params?: Array<unknown>;
  privateKey: `0x${string}`;
}) {
  try {
    const account = privateKeyToAccount(privateKey);

    if (method === "eth_accounts" || method === "eth_requestAccounts") {
      return [account.address];
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
      return account.signMessage({
        message: {
          raw: params?.[0] as Hex,
        },
      });
    }

    const client = createWalletClient({
      account,
      chain: getChain(chainId),
      transport: http(),
    });

    const returnValue = await client.request({
      method: method as any,
      params: params as any,
    });

    return returnValue;
  } catch (error) {
    console.error("error", error);
    return null;
  }
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
