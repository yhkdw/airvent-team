/**
 * Anchor 프로그램 클라이언트 — register_device 인스트럭션 호출 등.
 *
 * IDL은 모노레포의 단일 정본(/idl/airvent_contract.json)을 import.
 * Vite는 vite.config.js의 server.fs.allow 설정으로 상위 디렉토리 import 허용.
 */
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";

import idl from "../../../idl/airvent_contract.json";
import {
    PROGRAM_ID,
    getConnection,
    deriveDevicePda,
    deriveDeviceRewardsPda,
} from "../config/chain";
import { phantomAsWallet } from "./phantom";

/**
 * Phantom 지갑 + Devnet RPC 로 Anchor Program 인스턴스 생성.
 */
function buildProgram() {
    const wallet = phantomAsWallet();
    const provider = new AnchorProvider(getConnection(), wallet, {
        commitment: "confirmed",
    });
    return new Program(idl, provider);
}

/**
 * 디바이스가 이미 온체인에 등록되어 있는지 + 누구 소유인지 조회.
 * @returns { exists: boolean, owner?: PublicKey, isActive?: boolean }
 */
export async function fetchDeviceInfo(deviceId) {
    const connection = getConnection();
    const devicePda = deriveDevicePda(deviceId);
    const info = await connection.getAccountInfo(devicePda);
    if (!info) {
        return { exists: false };
    }
    // Program 통해 디코드
    try {
        const program = buildProgram();
        const acc = await program.account.deviceRegistry.fetch(devicePda);
        return {
            exists: true,
            owner: acc.owner,
            isActive: acc.isActive ?? acc.is_active ?? true,
        };
    } catch (e) {
        // 디코드 실패 — 적어도 PDA는 존재함
        return { exists: true };
    }
}

/**
 * register_device 인스트럭션 호출.
 * 호출자(connected Phantom wallet)가 device_id 의 owner 가 됩니다.
 * @returns Tx signature
 */
export async function registerDevice(deviceId) {
    const program = buildProgram();
    const wallet = phantomAsWallet();

    const devicePda = deriveDevicePda(deviceId);
    const deviceRewardsPda = deriveDeviceRewardsPda(deviceId);

    const tx = await program.methods
        .registerDevice(deviceId)
        .accounts({
            device: devicePda,
            deviceRewards: deviceRewardsPda,
            owner: wallet.publicKey,
            systemProgram: SystemProgram.programId,
        })
        .rpc();

    return tx;
}

/**
 * transfer_ownership 인스트럭션 호출 — 기존 owner 가 새 owner 로 위임.
 * (현재 데모에선 사용 안 함. 정상 케이스: 미등록 → register_device 만)
 */
export async function transferOwnership(deviceId, newOwnerPubkey) {
    const program = buildProgram();
    const wallet = phantomAsWallet();

    const devicePda = deriveDevicePda(deviceId);

    const tx = await program.methods
        .transferOwnership(new PublicKey(newOwnerPubkey))
        .accounts({
            device: devicePda,
            owner: wallet.publicKey,
        })
        .rpc();

    return tx;
}
