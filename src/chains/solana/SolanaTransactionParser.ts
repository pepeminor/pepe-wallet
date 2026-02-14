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

    // ✅ FIX: Fetch transactions one by one to avoid batch request limits
    // Public RPC nodes only allow 1 transaction per batch request
    try {
      for (let i = 0; i < signatures.length; i++) {
        try {
          const tx = await this.connection.getParsedTransaction(
            signatures[i].signature,
            {
              maxSupportedTransactionVersion: 0,
            }
          );

          if (tx) {
            this.classifyTransaction(tx, address, records[i]);
          }

          // Small delay to avoid rate limiting (20ms between requests)
          if (i < signatures.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 20));
          }
        } catch (txErr) {
          console.warn(`Failed to parse transaction ${signatures[i].signature}:`, txErr);
          // Continue with next transaction
        }
      }
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
