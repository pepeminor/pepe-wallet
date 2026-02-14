import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js';
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from '@solana/spl-token';
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
import { JupiterQuoteResponse } from '@/types/swap';
import { getSolanaConnection } from './SolanaConnection';
import { SolanaTokenService } from './SolanaTokenService';
import { SolanaSwapService } from './SolanaSwapService';
import { SolanaTransactionParser } from './SolanaTransactionParser';

export class SolanaProvider implements IChainProvider {
  chainId = ChainId.Solana;

  private connection!: Connection;
  private tokenService!: SolanaTokenService;
  private swapService!: SolanaSwapService;
  private txParser!: SolanaTransactionParser;
  private address: string | null = null;

  async initialize(network: NetworkType): Promise<void> {
    this.connection = getSolanaConnection(network);
    this.tokenService = new SolanaTokenService(this.connection);
    this.swapService = new SolanaSwapService();
    this.txParser = new SolanaTransactionParser(this.connection);
  }

  setAddress(address: string) {
    this.address = address;
  }

  getAddress(): string | null {
    return this.address;
  }

  getConnection(): Connection {
    return this.connection;
  }

  async getNativeBalance(address: string): Promise<number> {
    const pubkey = new PublicKey(address);
    const lamports = await this.connection.getBalance(pubkey);
    return lamports / LAMPORTS_PER_SOL;
  }

  async getTokenBalances(address: string): Promise<TokenBalanceInfo[]> {
    return this.tokenService.getTokenBalances(address);
  }

  async sendNativeToken(params: SendNativeParams): Promise<string> {
    const { from, to, amount, secretKey } = params;

    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(from),
        toPubkey: new PublicKey(to),
        lamports: Math.round(amount * LAMPORTS_PER_SOL),
      })
    );

    tx.feePayer = new PublicKey(from);
    const { blockhash } = await this.connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;

    // ✅ SECURITY FIX: Simulate transaction before signing
    const simulation = await this.connection.simulateTransaction(tx, undefined, false);

    if (simulation.value.err) {
      throw new Error(
        `Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`
      );
    }

    if (secretKey) {
      const keypair = Keypair.fromSecretKey(secretKey);
      tx.sign(keypair);
      const sig = await this.connection.sendRawTransaction(tx.serialize());
      await this.connection.confirmTransaction(sig, 'confirmed');
      return sig;
    }

    throw new Error('No signing method available. Use wallet adapter for extension wallets.');
  }

  async sendToken(params: SendTokenParams): Promise<string> {
    const { from, to, mint, amount, decimals, secretKey } = params;
    const fromPubkey = new PublicKey(from);
    const toPubkey = new PublicKey(to);
    const mintPubkey = new PublicKey(mint);

    const fromAta = await getAssociatedTokenAddress(mintPubkey, fromPubkey);
    const toAta = await getAssociatedTokenAddress(mintPubkey, toPubkey);

    const tx = new Transaction();

    // Create ATA for recipient if needed
    try {
      await getAccount(this.connection, toAta);
    } catch {
      tx.add(
        createAssociatedTokenAccountInstruction(
          fromPubkey,
          toAta,
          toPubkey,
          mintPubkey
        )
      );
    }

    tx.add(
      createTransferInstruction(
        fromAta,
        toAta,
        fromPubkey,
        BigInt(Math.round(amount * 10 ** decimals))
      )
    );

    tx.feePayer = fromPubkey;
    const { blockhash } = await this.connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;

    // ✅ SECURITY FIX: Simulate transaction before signing
    const simulation = await this.connection.simulateTransaction(tx, undefined, false);

    if (simulation.value.err) {
      throw new Error(
        `Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`
      );
    }

    if (secretKey) {
      const keypair = Keypair.fromSecretKey(secretKey);
      tx.sign(keypair);
      const sig = await this.connection.sendRawTransaction(tx.serialize());
      await this.connection.confirmTransaction(sig, 'confirmed');
      return sig;
    }

    throw new Error('No signing method available. Use wallet adapter for extension wallets.');
  }

  async getTransactionHistory(
    address: string,
    limit?: number
  ): Promise<TransactionRecord[]> {
    return this.txParser.getHistory(address, limit);
  }

  async getSwapQuote(params: SwapQuoteParams): Promise<SwapQuote> {
    return this.swapService.getQuote(params);
  }

  async executeSwap(params: ExecuteSwapParams): Promise<string> {
    const { quote, userPublicKey, secretKey } = params;
    const jupQuote = quote.raw as JupiterQuoteResponse;

    const swapResult = await this.swapService.getSwapTransaction(
      jupQuote,
      userPublicKey
    );

    const swapTxBuf = Buffer.from(swapResult.swapTransaction, 'base64');
    const tx = VersionedTransaction.deserialize(swapTxBuf);

    // ✅ SECURITY FIX: Simulate swap transaction before signing
    const simulation = await this.connection.simulateTransaction(tx, {
      sigVerify: false,
    });

    if (simulation.value.err) {
      throw new Error(
        `Swap simulation failed: ${JSON.stringify(simulation.value.err)}`
      );
    }

    // Verify simulation succeeded
    if (!simulation.value.logs || simulation.value.logs.length === 0) {
      throw new Error('Swap simulation returned no logs - transaction may fail');
    }

    // Check for common swap errors in logs
    const logs = simulation.value.logs.join('\n');
    if (logs.includes('Error:') || logs.includes('failed')) {
      console.warn('Swap simulation warnings:', logs);
    }

    if (secretKey) {
      const keypair = Keypair.fromSecretKey(secretKey);
      tx.sign([keypair]);
      const sig = await this.connection.sendRawTransaction(tx.serialize());
      await this.connection.confirmTransaction(
        { signature: sig, blockhash: tx.message.recentBlockhash, lastValidBlockHeight: swapResult.lastValidBlockHeight },
        'confirmed'
      );
      return sig;
    }

    throw new Error('No signing method available. Use wallet adapter for extension wallets.');
  }

  isValidAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return PublicKey.isOnCurve(address);
    } catch {
      return false;
    }
  }

  async signMessage(_message: Uint8Array): Promise<Uint8Array> {
    throw new Error('signMessage requires a keypair or wallet adapter.');
  }
}
