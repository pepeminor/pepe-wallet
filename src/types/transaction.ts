export interface TransactionInfo {
  signature: string;
  timestamp: number;
  type: TransactionType;
  status: TransactionStatus;
  amount?: number;
  tokenSymbol?: string;
  from?: string;
  to?: string;
  fee?: number;
}

export enum TransactionType {
  Send = 'send',
  Receive = 'receive',
  Swap = 'swap',
  Unknown = 'unknown',
}

export enum TransactionStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Failed = 'failed',
}
