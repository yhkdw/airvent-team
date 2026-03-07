/**
 * AirVent 구독 관리 — 온체인 함수 호출 모듈
 *
 * 스마트 컨트랙트의 4가지 instruction을 프론트엔드에서
 * 쉽게 호출할 수 있도록 래핑합니다.
 */
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import {
    getProgram,
    getSubscriptionPDA,
    getConnection,
    getExplorerUrl,
} from "./provider";

// ──────────────────────────────────────────
// 타입 정의
// ──────────────────────────────────────────

/** 온체인 구독 상태를 프론트엔드 친화적으로 변환 */
export interface SubscriptionInfo {
    owner: string;
    authority: string;
    isPremium: boolean;
    offchainPoints: number;
    hardwareId: string;
    hasHardware: boolean;
    joinedAt: Date;
    /** PDA 주소 */
    address: string;
    /** Solana Explorer 링크 */
    explorerUrl: string;
}

/** 트랜잭션 결과 */
export interface TxResult {
    signature: string;
    explorerUrl: string;
}

// ──────────────────────────────────────────
// 구독 상태 조회
// ──────────────────────────────────────────

/**
 * 사용자의 온체인 구독 상태를 조회합니다.
 * 계정이 아직 없으면 null을 반환합니다.
 */
export async function getUserSubscription(
    userPublicKey: PublicKey
): Promise<SubscriptionInfo | null> {
    try {
        const program = getProgram();
        const [pda] = getSubscriptionPDA(userPublicKey);
        const account = await program.account.userState.fetch(pda);

        return {
            owner: account.owner.toBase58(),
            authority: account.authority.toBase58(),
            isPremium: account.isPremium,
            offchainPoints: (account.offchainPoints as BN).toNumber(),
            hardwareId: account.hardwareId,
            hasHardware: account.hasHardware,
            joinedAt: new Date((account.joinedAt as BN).toNumber() * 1000),
            address: pda.toBase58(),
            explorerUrl: getExplorerUrl(pda.toBase58()),
        };
    } catch (err: any) {
        // Account does not exist (첫 방문 사용자)
        if (err?.message?.includes("Account does not exist")) {
            return null;
        }
        throw err;
    }
}

/**
 * 구독 계정이 존재하는지만 빠르게 확인합니다.
 */
export async function hasSubscription(userPublicKey: PublicKey): Promise<boolean> {
    const [pda] = getSubscriptionPDA(userPublicKey);
    const connection = getConnection();
    const info = await connection.getAccountInfo(pda);
    return info !== null;
}

// ──────────────────────────────────────────
// 무료 구독 계정 생성
// ──────────────────────────────────────────

/**
 * 무료 구독 계정을 온체인에 생성합니다.
 * 사용자 지갑과 authority(관리자 서버)의 서명이 필요합니다.
 *
 * @param authorityPublicKey — 포인트 적립 권한을 부여할 관리자/오라클 지갑
 */
export async function initializeFreeSubscription(
    authorityPublicKey: PublicKey
): Promise<TxResult> {
    const program = getProgram();
    const user = program.provider.publicKey!;
    const [userStatePDA] = getSubscriptionPDA(user);

    const sig = await program.methods
        .initializeFreeSubscription()
        .accounts({
            userState: userStatePDA,
            user,
            authority: authorityPublicKey,
            systemProgram: SystemProgram.programId,
        })
        .rpc();

    return {
        signature: sig,
        explorerUrl: getExplorerUrl(sig, "tx"),
    };
}

// ──────────────────────────────────────────
// 포인트 적립 (서버/오라클이 호출)
// ──────────────────────────────────────────

/**
 * 무료 구독자에게 포인트를 적립합니다.
 * authority(관리자)의 서명이 필요하므로 일반적으로 서버 사이드에서 호출합니다.
 *
 * @param ownerPublicKey — 포인트를 받을 사용자의 지갑 주소
 * @param points — 적립할 포인트 (1~1000)
 */
export async function earnFreePoints(
    ownerPublicKey: PublicKey,
    points: number
): Promise<TxResult> {
    const program = getProgram();
    const authority = program.provider.publicKey!;
    const [userStatePDA] = getSubscriptionPDA(ownerPublicKey);

    const sig = await program.methods
        .earnFreePoints(new BN(points))
        .accounts({
            userState: userStatePDA,
            owner: ownerPublicKey,
            authority,
        })
        .rpc();

    return {
        signature: sig,
        explorerUrl: getExplorerUrl(sig, "tx"),
    };
}

// ──────────────────────────────────────────
// 프리미엄 업그레이드
// ──────────────────────────────────────────

/**
 * 하드웨어 노드를 등록하고 프리미엄으로 업그레이드합니다.
 *
 * @param hardwareSerial — 하드웨어 시리얼 번호 (1~64자)
 */
export async function upgradeToPremium(
    hardwareSerial: string
): Promise<TxResult> {
    const program = getProgram();
    const user = program.provider.publicKey!;
    const [userStatePDA] = getSubscriptionPDA(user);

    const sig = await program.methods
        .upgradeToPremium(hardwareSerial)
        .accounts({
            userState: userStatePDA,
            user,
        })
        .rpc();

    return {
        signature: sig,
        explorerUrl: getExplorerUrl(sig, "tx"),
    };
}

// ──────────────────────────────────────────
// 프리미엄 해제
// ──────────────────────────────────────────

/**
 * 프리미엄을 해제하고 무료 구독으로 전환합니다.
 */
export async function downgradeFromPremium(): Promise<TxResult> {
    const program = getProgram();
    const user = program.provider.publicKey!;
    const [userStatePDA] = getSubscriptionPDA(user);

    const sig = await program.methods
        .downgradeFromPremium()
        .accounts({
            userState: userStatePDA,
            user,
        })
        .rpc();

    return {
        signature: sig,
        explorerUrl: getExplorerUrl(sig, "tx"),
    };
}
