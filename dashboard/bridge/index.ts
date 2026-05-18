import mqtt from 'mqtt';
import { createClient } from '@supabase/supabase-js';
import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ==========================================
// 1. CONFIGURATION
// ==========================================

// Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// MQTT
const MQTT_HOST = 'mqtt://211.188.57.53:1883';
const MQTT_USERNAME = 'airvent_broker';
const MQTT_PASSWORD = 'AirVent!@Mqtt#';

// Solana
const SOLANA_RPC = 'https://api.devnet.solana.com';
const PROGRAM_ID = new PublicKey('B4m1ENS6SWV3H6mZkJ2VFkBKawqYe7atH4AjXoc4NZzR');

// Load wallet
const walletPath = '/Users/user/.config/solana/airvent-bridge.json';
const walletKeypair = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf-8')))
);
const wallet = new Wallet(walletKeypair);

// Connection and Provider
const connection = new Connection(SOLANA_RPC, 'confirmed');
const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });

// Load IDL
const idlPath = path.resolve(process.cwd(), 'idl/airvent_contract.json');
const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
const program = new Program(idl, provider);

// State to prevent spamming
const processedMessages = new Set<string>();

// ==========================================
// 2. INITIALIZATION
// ==========================================

async function init() {
  console.log('🚀 Starting AirVent Bridge Service...');
  console.log(`🔑 Server Wallet: ${wallet.publicKey.toBase58()}`);
  
  const balance = await connection.getBalance(wallet.publicKey);
  console.log(`💰 Balance: ${balance / 1e9} SOL`);

  // Connect to MQTT
  const mqttClient = mqtt.connect(MQTT_HOST, {
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
    connectTimeout: 5000,
  });

  mqttClient.on('connect', () => {
    console.log('✅ MQTT Connected to broker.');
    mqttClient.subscribe('env/SML001/+/data', (err) => {
      if (err) console.error('❌ MQTT Subscribe Error:', err);
      else console.log('📡 Subscribed to data topic: env/SML001/+/data');
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

import { getAssociatedTokenAddress } from '@solana/spl-token';

const AIR_MINT = new PublicKey('BXV4ewBjMB1qmXjU3bc14SfXHQbseFhRy5xE4RtHtvsL');

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
      program.programId
    );
    const [deviceRewardsPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("device_rewards"), Buffer.from(device_id)],
      program.programId
    );
    const [rewardConfigPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("reward_config")],
      program.programId
    );
    const [treasuryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury")],
      program.programId
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
