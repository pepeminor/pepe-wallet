import { ethers } from 'ethers';
import {
  ChainId,
  IChainProvider,
  NetworkType,
  TokenBalanceInfo,
  SendNativeParams,
  SendTokenParams,
  SwapQuoteParams,
  SwapQuote,
  ExecuteSwapParams,
  TransactionRecord,
} from '@/types/chain';
import { CHAIN_CONFIGS } from '@/config/chains';
import { DEFAULT_TOKENS } from '@/config/tokens';
import { NATIVE_ETH_MINT } from '@/config/constants';

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
];

export class EvmProvider implements IChainProvider {
  chainId: ChainId;
  private provider!: ethers.JsonRpcProvider;
  private address: string | null = null;

  constructor(chainId: ChainId) {
    this.chainId = chainId;
  }

  async initialize(network: NetworkType): Promise<void> {
    const config = CHAIN_CONFIGS[this.chainId];
    const rpcUrl = config.rpcUrls[network];
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  setAddress(address: string) {
    this.address = address;
  }

  getAddress(): string | null {
    return this.address;
  }

  async getNativeBalance(address: string): Promise<number> {
    const balance = await this.provider.getBalance(address);
    return Number(ethers.formatEther(balance));
  }

  async getTokenBalances(address: string): Promise<TokenBalanceInfo[]> {
    const tokens = DEFAULT_TOKENS[this.chainId] ?? [];
    const results: TokenBalanceInfo[] = [];

    const promises = tokens.map(async (token) => {
      try {
        if (token.mint === NATIVE_ETH_MINT) {
          const balance = await this.provider.getBalance(address);
          const uiBalance = Number(ethers.formatEther(balance));
          return {
            mint: token.mint,
            symbol: token.symbol,
            name: token.name,
            decimals: token.decimals,
            balance: Number(balance),
            uiBalance,
            icon: token.icon,
          };
        } else {
          const contract = new ethers.Contract(token.mint, ERC20_ABI, this.provider);
          const balance: bigint = await contract.balanceOf(address);
          const uiBalance = Number(ethers.formatUnits(balance, token.decimals));
          return {
            mint: token.mint,
            symbol: token.symbol,
            name: token.name,
            decimals: token.decimals,
            balance: Number(balance),
            uiBalance,
            icon: token.icon,
          };
        }
      } catch (err) {
        console.error(`Failed to fetch balance for ${token.symbol}:`, err);
        return {
          mint: token.mint,
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          balance: 0,
          uiBalance: 0,
          icon: token.icon,
        };
      }
    });

    const settled = await Promise.all(promises);
    results.push(...settled);
    return results;
  }

  async sendNativeToken(params: SendNativeParams): Promise<string> {
    const { to, amount, secretKey } = params;
    if (!secretKey) {
      throw new Error('Secret key required for EVM transactions');
    }

    const privateKeyHex = secretKeyToEvmHex(secretKey);
    const wallet = new ethers.Wallet(privateKeyHex, this.provider);

    const tx = await wallet.sendTransaction({
      to,
      value: ethers.parseEther(amount.toString()),
    });

    const receipt = await tx.wait();
    return receipt?.hash ?? tx.hash;
  }

  async sendToken(params: SendTokenParams): Promise<string> {
    const { to, mint, amount, decimals, secretKey } = params;
    if (!secretKey) {
      throw new Error('Secret key required for EVM transactions');
    }

    const privateKeyHex = secretKeyToEvmHex(secretKey);
    const wallet = new ethers.Wallet(privateKeyHex, this.provider);
    const contract = new ethers.Contract(mint, ERC20_ABI, wallet);

    const parsedAmount = ethers.parseUnits(amount.toString(), decimals);
    const tx = await contract.transfer(to, parsedAmount);
    const receipt = await tx.wait();
    return receipt?.hash ?? tx.hash;
  }

  async getTransactionHistory(
    _address: string,
    _limit?: number
  ): Promise<TransactionRecord[]> {
    // No free EVM history API available
    return [];
  }

  async getSwapQuote(_params: SwapQuoteParams): Promise<SwapQuote> {
    throw new Error('Swap is not supported on EVM chains');
  }

  async executeSwap(_params: ExecuteSwapParams): Promise<string> {
    throw new Error('Swap is not supported on EVM chains');
  }

  isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  async signMessage(_message: Uint8Array): Promise<Uint8Array> {
    throw new Error('signMessage requires a private key.');
  }
}

/**
 * Convert a Uint8Array secret key to a hex string for ethers.
 * The secret key is stored as raw bytes of the EVM private key (32 bytes)
 * or as a hex string encoded to bytes.
 */
function secretKeyToEvmHex(secretKey: Uint8Array): string {
  // The secretKey for EVM is the hex private key encoded as UTF-8 bytes
  const decoded = new TextDecoder().decode(secretKey);
  if (decoded.startsWith('0x') && decoded.length === 66) {
    return decoded;
  }
  // Fallback: treat as raw 32-byte key
  return '0x' + Buffer.from(secretKey).toString('hex');
}
