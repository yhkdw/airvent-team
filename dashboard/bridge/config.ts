/**
 * Centralized configuration loader for the AirVent Bridge service.
 *
 * - 모든 환경변수를 한 곳에서 로드하고 검증합니다.
 * - 필수 값이 누락되면 즉시 프로세스를 종료(fail-fast)합니다.
 * - 비밀번호/지갑 경로 등 민감 정보는 절대 로그에 출력하지 않습니다.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { PublicKey } from '@solana/web3.js';

const bridgeDir = __dirname;

// .env 파일 로드 (bridge 디렉토리 기준이라 실행 위치가 바뀌어도 안정적입니다)
dotenv.config({ path: path.resolve(bridgeDir, '.env') });

type EnvKey =
  | 'SUPABASE_URL'
  | 'SUPABASE_SERVICE_ROLE_KEY'
  | 'MQTT_HOST'
  | 'MQTT_USERNAME'
  | 'MQTT_PASSWORD'
  | 'MQTT_TOPIC'
  | 'SOLANA_RPC'
  | 'SOLANA_PROGRAM_ID'
  | 'SOLANA_AIR_MINT'
  | 'BRIDGE_WALLET_PATH';

function requireEnv(key: EnvKey): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
  console.error(`\n❌ 환경변수 누락: ${key}`);
    console.error(`   dashboard/bridge/.env 파일에 ${key} 값을 설정하세요.`);
    console.error(`   .env.example 을 참고하면 됩니다.\n`);
    process.exit(1);
  }
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  const value = process.env[key];
  return value && value.trim() !== '' ? value : fallback;
}

export const config = {
  supabase: {
    url: requireEnv('SUPABASE_URL'),
    serviceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  },
  mqtt: {
    host: requireEnv('MQTT_HOST'),
    username: requireEnv('MQTT_USERNAME'),
    password: requireEnv('MQTT_PASSWORD'),
    topic: optionalEnv('MQTT_TOPIC', 'env/SML001/+/data'),
  },
  solana: {
    rpc: requireEnv('SOLANA_RPC'),
    programId: new PublicKey(requireEnv('SOLANA_PROGRAM_ID')),
    airMint: new PublicKey(requireEnv('SOLANA_AIR_MINT')),
    walletPath: requireEnv('BRIDGE_WALLET_PATH'),
  },
  scripts: {
    deviceId: optionalEnv('DEVICE_ID', '5EBHA10001'),
  },
};

/**
 * 부팅 시 안전한 요약 로그 (민감 정보 제외)
 */
export function logConfigSummary(): void {
  console.log('🔧 Loaded configuration:');
  console.log(`   • Supabase URL: ${config.supabase.url}`);
  console.log(`   • MQTT host:    ${config.mqtt.host}`);
  console.log(`   • MQTT topic:   ${config.mqtt.topic}`);
  console.log(`   • Solana RPC:   ${config.solana.rpc}`);
  console.log(`   • Program ID:   ${config.solana.programId.toBase58()}`);
  console.log(`   • AIR Mint:     ${config.solana.airMint.toBase58()}`);
}
