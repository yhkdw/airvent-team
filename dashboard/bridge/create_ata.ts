import { Connection, Keypair } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import * as fs from 'fs';

import { config } from './config';

async function main() {
  const walletKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(config.solana.walletPath, 'utf-8')))
  );
  const connection = new Connection(config.solana.rpc, 'confirmed');

  try {
    const ata = await getOrCreateAssociatedTokenAccount(
      connection,
      walletKeypair,
      config.solana.airMint,
      walletKeypair.publicKey
    );
    console.log('✅ ATA created/exists:', ata.address.toBase58());
  } catch (err: any) {
    console.error('❌ Failed to create ATA:', err.message);
  }
}

main();
