export enum WalletMode {
  PrivateKey = 'private_key',
  Extension = 'extension',
  Generated = 'generated',
}

export interface WalletAccount {
  address: string;
  label: string;
  mode: WalletMode;
  createdAt: number;
}

export interface EncryptedKeystore {
  ciphertext: string;
  iv: string;
  salt: string;
}

export interface WalletState {
  mode: WalletMode | null;
  accounts: WalletAccount[];
  activeAccount: WalletAccount | null;
  isLocked: boolean;
  isInitialized: boolean;
}
