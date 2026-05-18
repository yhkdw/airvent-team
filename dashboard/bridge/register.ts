import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import * as fs from 'fs';
import * as path from 'path';

const SOLANA_RPC = 'https://api.devnet.solana.com';
const PROGRAM_ID = new PublicKey('B4m1ENS6SWV3H6mZkJ2VFkBKawqYe7atH4AjXoc4NZzR');
const DEVICE_ID = '5EBHA10001';

async function main() {
  const walletPath = '/Users/user/.config/solana/airvent-bridge.json';
  const walletKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf-8')))
  );
  const wallet = new Wallet(walletKeypair);

  const connection = new Connection(SOLANA_RPC, 'confirmed');
  const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });

  const idlPath = path.resolve(process.cwd(), 'idl/airvent_contract.json');
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
