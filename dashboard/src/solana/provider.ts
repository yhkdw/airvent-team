/**
 * Solana Provider 유틸리티
 *
 * Phantom 지갑 연결 + Anchor Provider 설정을 다루는 모듈입니다.
 * 대시보드에서 import 하여 사용합니다.
 */
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Buffer } from "buffer";
import { IDL, AirventSubscription } from "../idl/airvent_subscription";

// ──────────────────────────────────────────
// 상수
// ──────────────────────────────────────────

/** 프로그램 ID — 배포 후 실제 값으로 교체 */
export const PROGRAM_ID = new PublicKey(
    "C245wF5gEDvBzgtskqooaz4yCdqFrgutt1CLub8iLWsF"
);

/** Solana 클러스터 (testnet / devnet / mainnet-beta) */
export type SolanaCluster = "testnet" | "devnet" | "mainnet-beta";

function detectCluster(): SolanaCluster {
    const envCluster = import.meta.env.VITE_SOLANA_CLUSTER;
    if (envCluster === "mainnet-beta") return "mainnet-beta";
    if (envCluster === "devnet") return "devnet";
    if (envCluster === "testnet") return "testnet";
    return "devnet"; // 기본값을 데브넷으로 설정
}

export const CLUSTER: SolanaCluster = detectCluster();
console.log(`[SolanaProvider] Active Cluster: ${CLUSTER}`);

/** RPC 엔드포인트 (사용자 지정 또는 기본 클러스터) */
export const RPC_ENDPOINT: string =
    import.meta.env.VITE_SOLANA_RPC || clusterApiUrl(CLUSTER);

// ──────────────────────────────────────────
// 연결 유틸리티
// ──────────────────────────────────────────

/** Solana Connection 인스턴스 (싱글턴) */
let _connection: Connection | null = null;

export function getConnection(): Connection {
    if (!_connection) {
        _connection = new Connection(RPC_ENDPOINT, "confirmed");
    }
    return _connection;
}

// ──────────────────────────────────────────
// Anchor Provider & Program
// ──────────────────────────────────────────

interface AnchorWallet {
    publicKey: PublicKey;
    signTransaction: (transaction: any) => Promise<any>;
    signAllTransactions: (transactions: any[]) => Promise<any[]>;
}

/**
 * AnchorProvider를 생성합니다.
 * Wallet Adapter의 useAnchorWallet() 결과를 인자로 받습니다.
 */
export function getProvider(wallet: AnchorWallet): AnchorProvider {
    const connection = getConnection();
    const provider = new AnchorProvider(
        connection,
        wallet as any,
        { commitment: "confirmed" }
    );
    return provider;
}

/**
 * Anchor Program 인스턴스를 생성합니다.
 */
export function getProgram(wallet: AnchorWallet): Program<any> {
    const provider = getProvider(wallet);
    // @ts-ignore - IDL version mismatch
    return new Program(IDL as any, provider);
}

// ──────────────────────────────────────────
// PDA 유틸리티
// ──────────────────────────────────────────

/**
 * 사용자의 구독 상태 PDA 주소를 계산합니다.
 */
export function getSubscriptionPDA(userPublicKey: PublicKey): [PublicKey, number] {
    try {
        // Uint8Array 기반 시드 생성 (Buffer보다 브라우저 환경에서 호환성이 높음)
        const seedSubscription = new TextEncoder().encode("subscription");
        const seedUser = userPublicKey.toBytes();

        return PublicKey.findProgramAddressSync(
            [seedSubscription, seedUser],
            PROGRAM_ID
        );
    } catch (err: any) {
        // 'Expected Buffer' 에러 대응을 위한 폴백 (일부 환경/버전용)
        if (err.message?.includes("Buffer")) {
            return PublicKey.findProgramAddressSync(
                [Buffer.from("subscription"), Buffer.from(userPublicKey.toBytes())],
                PROGRAM_ID
            );
        }
        throw err;
    }
}

/**
 * Solana Explorer 링크 생성
 */
export function getExplorerUrl(
    address: string,
    type: "tx" | "address" = "address"
): string {
    const base = "https://explorer.solana.com";
    const clusterParam = CLUSTER === "mainnet-beta" ? "" : `?cluster=${CLUSTER}`;
    return `${base}/${type}/${address}${clusterParam}`;
}
