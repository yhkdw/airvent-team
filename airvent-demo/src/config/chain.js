/**
 * airvent-demo 용 Solana/Supabase 체인 상수
 *
 * dashboard/src/config/chain.ts 와 동일한 구조를 JSX 친화 버전으로 재구현.
 * VITE_* 환경변수로 오버라이드 가능.
 */
import { Connection, PublicKey } from "@solana/web3.js";

export const SOLANA_CLUSTER =
    import.meta.env.VITE_SOLANA_CLUSTER || "devnet";

export const SOLANA_RPC =
    import.meta.env.VITE_SOLANA_RPC || "https://api.devnet.solana.com";

export const PROGRAM_ID = new PublicKey(
    import.meta.env.VITE_SOLANA_PROGRAM_ID ||
    "B4m1ENS6SWV3H6mZkJ2VFkBKawqYe7atH4AjXoc4NZzR"
);

export const AIR_MINT = new PublicKey(
    import.meta.env.VITE_SOLANA_AIR_MINT ||
    "BXV4ewBjMB1qmXjU3bc14SfXHQbseFhRy5xE4RtHtvsL"
);

export const DEMO_SERVER_WALLET = new PublicKey(
    import.meta.env.VITE_DEMO_SERVER_WALLET ||
    "GUyFB5qJvPMRZweeL8fb7KQDdRicArQCTyAw64dkRyHw"
);

// LocalStorage 키 — 페어링한 device_id 저장
export const PAIRED_DEVICE_KEY = "airvent_paired_device_id";

let _connection = null;
export function getConnection() {
    if (!_connection) {
        _connection = new Connection(SOLANA_RPC, "confirmed");
    }
    return _connection;
}

export function deriveDevicePda(deviceId) {
    const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("device"), Buffer.from(deviceId)],
        PROGRAM_ID
    );
    return pda;
}

export function deriveDeviceRewardsPda(deviceId) {
    const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("device_rewards"), Buffer.from(deviceId)],
        PROGRAM_ID
    );
    return pda;
}

export function explorerTxUrl(signature) {
    return `https://explorer.solana.com/tx/${signature}?cluster=${SOLANA_CLUSTER}`;
}

export function explorerAddressUrl(address) {
    const s = typeof address === "string" ? address : address.toBase58();
    return `https://explorer.solana.com/address/${s}?cluster=${SOLANA_CLUSTER}`;
}

export function truncatePubkey(pubkey, head = 4, tail = 4) {
    if (!pubkey) return "";
    const s = typeof pubkey === "string" ? pubkey : pubkey.toBase58();
    return `${s.slice(0, head)}…${s.slice(-tail)}`;
}
