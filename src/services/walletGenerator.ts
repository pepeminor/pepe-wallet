import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import bs58 from 'bs58';
import { ethers } from 'ethers';

export interface GeneratedWallet {
  mnemonic: string;
  publicKey: string;
  secretKeyBase58: string;
  evmAddress: string;
  evmPrivateKey: string;
}

export function generateWallet(): GeneratedWallet {
  const mnemonic = bip39.generateMnemonic(128);
  return restoreFromMnemonic(mnemonic);
}

export function restoreFromMnemonic(mnemonic: string): GeneratedWallet {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const derivedSeed = derivePath("m/44'/501'/0'/0'", seed.toString('hex')).key;
  const keypair = Keypair.fromSeed(derivedSeed);

  const evmWallet = deriveEvmFromMnemonic(mnemonic);

  return {
    mnemonic,
    publicKey: keypair.publicKey.toBase58(),
    secretKeyBase58: bs58.encode(keypair.secretKey),
    evmAddress: evmWallet.address,
    evmPrivateKey: evmWallet.privateKey,
  };
}

export function deriveEvmFromMnemonic(mnemonic: string): {
  address: string;
  privateKey: string;
} {
  const hdWallet = ethers.HDNodeWallet.fromMnemonic(
    ethers.Mnemonic.fromPhrase(mnemonic),
    "m/44'/60'/0'/0/0"
  );
  return {
    address: hdWallet.address,
    privateKey: hdWallet.privateKey,
  };
}

export function importFromPrivateKey(privateKeyBase58: string): {
  publicKey: string;
  secretKeyBase58: string;
} {
  const secretKey = bs58.decode(privateKeyBase58);
  const keypair = Keypair.fromSecretKey(secretKey);
  return {
    publicKey: keypair.publicKey.toBase58(),
    secretKeyBase58: bs58.encode(keypair.secretKey),
  };
}

export function getKeypairFromBase58(secretKeyBase58: string): Keypair {
  return Keypair.fromSecretKey(bs58.decode(secretKeyBase58));
}
