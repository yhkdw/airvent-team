import mqtt from 'mqtt';
import { createClient } from '@supabase/supabase-js';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import * as fs from 'fs';
import * as path from 'path';

import { config, logConfigSummary } from './config';

// ==========================================
// 1. CLIENTS (config.ts 에서 검증된 값 사용)
// ==========================================

const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey);

// Load IDL and verify it matches the configured on-chain program before using keys.
// 정본 IDL은 리포 루트의 idl/ 디렉토리에 보관 (Single Source of Truth).
const idlPath = path.resolve(__dirname, '../../idl/airvent_contract.json');
const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
const PROGRAM_ID = config.solana.programId;
const AIR_MINT = config.solana.airMint;

validateProgramId(idl, PROGRAM_ID);

const walletKeypair = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(fs.readFileSync(config.solana.walletPath, 'utf-8')))
);
const wallet = new Wallet(walletKeypair);

const connection = new Connection(config.solana.rpc, 'confirmed');
const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
const program = new Program(idl as any, provider) as any;

// State to prevent spamming
const processedMessages = new Set<string>();

// ==========================================
// 2. INITIALIZATION
// ==========================================

function validateProgramId(programIdl: any, configuredProgramId: PublicKey): void {
  const idlProgramId = programIdl?.address;
  const configured = configuredProgramId.toBase58();

  if (!idlProgramId) {
    throw new Error(`IDL address missing: ${idlPath}`);
  }

  if (idlProgramId !== configured) {
    throw new Error(
      [
        'SOLANA_PROGRAM_ID does not match IDL address.',
        `  SOLANA_PROGRAM_ID: ${configured}`,
        `  IDL address:       ${idlProgramId}`,
        'Refusing to start because PDA derivation and Anchor program target would diverge.',
      ].join('\n')
    );
  }
}

async function init() {
  console.log('🚀 Starting AirVent Bridge Service...');
  logConfigSummary();
  console.log(`🔑 Server Wallet: ${wallet.publicKey.toBase58()}`);

  const balance = await connection.getBalance(wallet.publicKey);
  console.log(`💰 Balance: ${balance / 1e9} SOL`);

  // Connect to MQTT
  const mqttClient = mqtt.connect(config.mqtt.host, {
    username: config.mqtt.username,
    password: config.mqtt.password,
    connectTimeout: 5000,
  });

  mqttClient.on('connect', () => {
    console.log('✅ MQTT Connected to broker.');
    mqttClient.subscribe(config.mqtt.topic, (err) => {
      if (err) console.error('❌ MQTT Subscribe Error:', err);
      else console.log(`📡 Subscribed to data topic: ${config.mqtt.topic}`);
    });
  });

  mqttClient.on('message', async (topic, message) => {
    try {
      const payloadStr = message.toString();
      const payload = JSON.parse(payloadStr);

      // Deduplication check
      if (payload.msg_id && processedMessages.has(payload.msg_id)) {
        return;
      }
      if (payload.msg_id) {
        processedMessages.add(payload.msg_id);
        // clean up set periodically (simple mechanism: clear every 1000 messages)
        if (processedMessages.size > 1000) processedMessages.clear();
      }

      console.log(`\n📥 Received data from ${payload.device_id || 'unknown'}`);

      await handleIncomingData(payload);
    } catch (e: any) {
      console.error('❌ Error processing message:', e.message);
    }
  });

  mqttClient.on('error', (err) => {
    console.error('❌ MQTT Error:', err.message);
  });
}

// ==========================================
// 3. DATA PROCESSING
// ==========================================

async function handleIncomingData(payload: any) {
  const {
    device_id,
    pm1_0,
    pm2_5,
    pm10,
    temperature,
    humidity,
    co2,
    voc,
    timestamp
  } = payload;

  if (!device_id) return;

  // 1. Insert into Supabase
  try {
    const { error } = await supabase
      .from('sensor_readings')
      .insert([
        {
          device_id,
          pm1_0: parseFloat(pm1_0) || 0,
          pm2_5: parseFloat(pm2_5) || 0,
          pm10: parseFloat(pm10) || 0,
          temperature: parseFloat(temperature) || 0,
          humidity: parseFloat(humidity) || 0,
          co2: parseFloat(co2) || 0,
          voc: parseFloat(voc) || 0,
          created_at: timestamp ? new Date(parseInt(timestamp)).toISOString() : new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('⚠️ Supabase Insert Error (table might not exist):', error.message);
    } else {
      console.log(`🗄️ Saved to Supabase: ${device_id} [PM2.5: ${pm2_5}]`);
    }
  } catch (e: any) {
    console.error('⚠️ Supabase Error:', e.message);
  }

  // 2. Submit to Solana
  try {
    const [nodeRegistryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("device"), Buffer.from(device_id)],
      PROGRAM_ID
    );
    const [deviceRewardsPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("device_rewards"), Buffer.from(device_id)],
      PROGRAM_ID
    );
    const [rewardConfigPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("reward_config")],
      PROGRAM_ID
    );
    const [treasuryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury")],
      PROGRAM_ID
    );

    let deviceAccount;
    try {
      deviceAccount = await program.account.deviceRegistry.fetch(nodeRegistryPda);
    } catch (e) {
      console.error(`⚠️ Solana: Device ${device_id} is not registered on the blockchain. Skipping rewards.`);
      return;
    }

    const ownerPubKey = deviceAccount.owner;
    const ownerTokenAccount = await getAssociatedTokenAddress(AIR_MINT, ownerPubKey);

    const tTemp = Math.round((parseFloat(temperature) || 0) * 10);
    const tHum = Math.round((parseFloat(humidity) || 0) * 10);
    const tCo2 = Math.round(parseFloat(co2) || 0);
    const tPm25 = Math.round(parseFloat(pm2_5) || 0);

    const tx = await program.methods
      .submitData(device_id, tPm25, tCo2, tTemp, tHum)
      .accounts({
        device: nodeRegistryPda,
        deviceRewards: deviceRewardsPda,
        rewardConfig: rewardConfigPda,
        treasury: treasuryPda,
        ownerTokenAccount: ownerTokenAccount,
        tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      })
      .rpc();

    console.log(`🔗 Submitted to Solana: ${tx}`);

  } catch (e: any) {
    console.error('⚠️ Solana Submit Error:', e.message);
  }
}

// Start
init().catch(console.error);
