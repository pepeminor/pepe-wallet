import { Connection } from '@solana/web3.js';
import { NetworkType } from '@/types/chain';
import { ENV } from '@/config/env';

let connection: Connection | null = null;
let currentNetwork: NetworkType | null = null;

export function getSolanaConnection(network: NetworkType): Connection {
  if (connection && currentNetwork === network) return connection;

  const rpcUrl =
    network === NetworkType.Devnet
      ? ENV.SOLANA_RPC_DEVNET
      : ENV.SOLANA_RPC_MAINNET;

  connection = new Connection(rpcUrl, 'confirmed');
  currentNetwork = network;
  return connection;
}

export function resetSolanaConnection() {
  connection = null;
  currentNetwork = null;
}
