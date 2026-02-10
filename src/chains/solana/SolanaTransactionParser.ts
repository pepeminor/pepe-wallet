import { Connection, PublicKey, ParsedTransactionWithMeta } from '@solana/web3.js';
import { TransactionRecord } from '@/types/chain';
import { LAMPORTS_PER_SOL } from '@/config/constants';

export class SolanaTransactionParser {
  constructor(private connection: Connection) {}

  async getHistory(address: string, limit = 20): Promise<TransactionRecord[]> {
    const pubkey = new PublicKey(address);

    const signatures = await this.connection.getSignaturesForAddress(pubkey, {
      limit,
    });

    const records: TransactionRecord[] = [];

    for (const sig of signatures) {
      records.push({
        signature: sig.signature,
        timestamp: (sig.blockTime ?? 0) * 1000,
        type: 'unknown',
        status: sig.err ? 'failed' : 'confirmed',
      });
    }

    // Batch fetch parsed transactions for type detection
    const txSigs = signatures.map((s) => s.signature);
    try {
      const parsedTxs = await this.connection.getParsedTransactions(txSigs, {
        maxSupportedTransactionVersion: 0,
      });

      parsedTxs.forEach((tx, i) => {
        if (!tx) return;
        const record = records[i];
        this.classifyTransaction(tx, address, record);
      });
    } catch (err) {
      console.error('Failed to parse transactions:', err);
    }

    return records;
  }

  private classifyTransaction(
    tx: ParsedTransactionWithMeta,
    address: string,
    record: TransactionRecord
  ) {
    const instructions = tx.transaction.message.instructions;

    for (const ix of instructions) {
      if ('parsed' in ix && ix.program === 'system') {
        const parsed = ix.parsed;
        if (parsed.type === 'transfer') {
          const info = parsed.info;
          record.amount = info.lamports / LAMPORTS_PER_SOL;
          record.token = 'SOL';
          if (info.source === address) {
            record.type = 'send';
            record.to = info.destination;
            record.from = address;
          } else if (info.destination === address) {
            record.type = 'receive';
            record.from = info.source;
            record.to = address;
          }
          return;
        }
      }
    }

    // Check for swap (Jupiter typically has many instructions)
    if (instructions.length > 3) {
      record.type = 'swap';
    }
  }
}
