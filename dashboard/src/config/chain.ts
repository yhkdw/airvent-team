/**
 * AirVent 대시보드 - Solana 체인/디바이스 상수 중앙 관리
 *
 * 흩어져 있던 PROGRAM_ID, AIR_MINT, RPC, DEVICE_ID 등을 한 곳에 모은 모듈입니다.
 * 환경변수(VITE_*)로 오버라이드할 수 있도록 설계하여 Devnet/Testnet/Mainnet 전환이 쉽습니다.
 *
 * Vite는 빌드 시점에 `import.meta.env.*` 값을 정적으로 치환합니다.
 * 따라서 이 모듈은 런타임에 비싼 연산을 하지 않습니다.
 */
import { Connection, PublicKey } from "@solana/web3.js";

// ---------- Cluster / RPC ----------
export const SOLANA_CLUSTER = (import.meta.env.VITE_SOLANA_CLUSTER as
    | "devnet"
    | "testnet"
    | "mainnet-beta") || "devnet";

export const SOLANA_RPC =
    import.meta.env.VITE_SOLANA_RPC || "https://api.devnet.solana.com";

// ---------- Programs ----------
export const PROGRAM_ID = new PublicKey(
    import.meta.env.VITE_SOLANA_PROGRAM_ID ||
    "B4m1ENS6SWV3H6mZkJ2VFkBKawqYe7atH4AjXoc4NZzR"
);

// ---------- AIR Token ----------
export const AIR_MINT = new PublicKey(
    import.meta.env.VITE_SOLANA_AIR_MINT ||
    "BXV4ewBjMB1qmXjU3bc14SfXHQbseFhRy5xE4RtHtvsL"
);

// ---------- Demo / Server wallet ----------
// 데모용 서버 지갑 (브리지가 사용하는 지갑) — 사용자가 Phantom 연결 안 했을 때 fallback 용도.
// 사용자 지갑 잔액과 명확히 구분해 표시해야 합니다.
export const DEMO_SERVER_WALLET = new PublicKey(
    import.meta.env.VITE_DEMO_SERVER_WALLET ||
    "GUyFB5qJvPMRZweeL8fb7KQDdRicArQCTyAw64dkRyHw"
);

// ---------- Demo device ----------
export const DEMO_DEVICE_ID =
    import.meta.env.VITE_DEMO_DEVICE_ID || "5EBHA10001";

// ---------- Helpers ----------

/**
 * 한 번만 생성되는 싱글톤 Connection.
 * (컴포넌트마다 new Connection() 하면 RPC를 낭비합니다.)
 */
let _connection: Connection | null = null;
export function getConnection(): Connection {
    if (!_connection) {
        _connection = new Connection(SOLANA_RPC, "confirmed");
    }
    return _connection;
}

/**
 * 디바이스 PDA 계산 (브리지의 register_device/submit_data와 동일한 시드).
 */
export function deriveDevicePda(deviceId: string): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("device"), Buffer.from(deviceId)],
        PROGRAM_ID
    );
    return pda;
}

/**
 * Solana Explorer URL 생성기. badge 컴포넌트 등에서 공통 사용.
 */
export function explorerTxUrl(signature: string): string {
    return `https://explorer.solana.com/tx/${signature}?cluster=${SOLANA_CLUSTER}`;
}

export function explorerAddressUrl(address: string | PublicKey): string {
    const s = typeof address === "string" ? address : address.toBase58();
    return `https://explorer.solana.com/address/${s}?cluster=${SOLANA_CLUSTER}`;
}
