import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import * as fs from 'fs';
import * as path from 'path';

import { config } from './config';

const DEVICE_ID = config.scripts.deviceId;

async function main() {
  const walletKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(config.solana.walletPath, 'utf-8')))
  );
  const wallet = new Wallet(walletKeypair);

  const connection = new Connection(config.solana.rpc, 'confirmed');
  const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });

  // 정본 IDL은 리포 루트의 idl/ 디렉토리에 보관 (Single Source of Truth).
  const idlPath = path.resolve(__dirname, '../../idl/airvent_contract.json');
  const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
  const program = new Program(idl, provider) as any;

  console.log(`Starting Registration for ${DEVICE_ID} ...`);

  const [devicePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("device"), Buffer.from(DEVICE_ID)],
    program.programId
  );

  const [deviceRewardsPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("device_rewards"), Buffer.from(DEVICE_ID)],
    program.programId
  );

  try {
    const tx = await program.methods
      .registerDevice(DEVICE_ID)
      .accounts({
        device: devicePda,
        deviceRewards: deviceRewardsPda,
        owner: wallet.publicKey,
      })
      .rpc();

    console.log('✅ Device successfully registered!');
    console.log(`Tx: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
  } catch (err: any) {
    console.error('❌ Failed to register device:', err.message);
  }
}

main();
