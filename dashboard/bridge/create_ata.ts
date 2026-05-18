import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import * as fs from 'fs';

const SOLANA_RPC = 'https://api.devnet.solana.com';
const AIR_MINT = new PublicKey('BXV4ewBjMB1qmXjU3bc14SfXHQbseFhRy5xE4RtHtvsL');

async function main() {
  const walletPath = '/Users/user/.config/solana/airvent-bridge.json';
  const walletKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf-8')))
  );
  const connection = new Connection(SOLANA_RPC, 'confirmed');

  try {
    const ata = await getOrCreateAssociatedTokenAccount(
      connection,
      walletKeypair,
      AIR_MINT,
      walletKeypair.publicKey
    );
    console.log('✅ ATA created/exists:', ata.address.toBase58());
  } catch (err: any) {
    console.error('❌ Failed to create ATA:', err.message);
  }
}

main();
