import {
  Connection,
  PublicKey,
} from '@solana/web3.js';
import { TokenBalanceInfo } from '@/types/chain';
import { DEFAULT_TOKENS } from '@/config/tokens';
import { ChainId } from '@/types/chain';
import { NATIVE_SOL_MINT } from '@/config/constants';

export class SolanaTokenService {
  constructor(private connection: Connection) {}

  async getTokenBalances(address: string): Promise<TokenBalanceInfo[]> {
    const pubkey = new PublicKey(address);
    const balances: TokenBalanceInfo[] = [];

    // Get SOL balance
    const solBalance = await this.connection.getBalance(pubkey);
    const solToken = DEFAULT_TOKENS[ChainId.Solana].find((t) => t.isNative)!;
    balances.push({
      mint: NATIVE_SOL_MINT,
      symbol: solToken.symbol,
      name: solToken.name,
      decimals: solToken.decimals,
      balance: solBalance,
      uiBalance: solBalance / 10 ** solToken.decimals,
      icon: solToken.icon,
    });

    // Get SPL token balances
    try {
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        pubkey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );

      for (const { account } of tokenAccounts.value) {
        const parsed = account.data.parsed.info;
        const mint = parsed.mint as string;
        const amount = parsed.tokenAmount;

        const knownToken = DEFAULT_TOKENS[ChainId.Solana].find(
          (t) => t.mint === mint
        );

        balances.push({
          mint,
          symbol: knownToken?.symbol ?? mint.slice(0, 4),
          name: knownToken?.name ?? 'Unknown Token',
          decimals: amount.decimals,
          balance: Number(amount.amount),
          uiBalance: amount.uiAmount ?? 0,
          icon: knownToken?.icon,
        });
      }
    } catch (err) {
      console.error('Failed to fetch token balances:', err);
    }

    return balances;
  }
}
