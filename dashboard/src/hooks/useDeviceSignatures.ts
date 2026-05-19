/**
 * useDeviceSignatures — 디바이스 PDA의 최근 트랜잭션 시그니처를 폴링하는 훅.
 *
 * RewardsTab과 WalletTab에서 동일한 패턴을 따로 구현하던 걸 일원화.
 *
 * 동작:
 *  - 마운트 시 1회 fetch
 *  - intervalMs 마다 재요청 (기본 15초)
 *  - 언마운트 시 정리
 */
import { useEffect, useState } from "react";
import { ConfirmedSignatureInfo } from "@solana/web3.js";
import { getConnection, deriveDevicePda, DEMO_DEVICE_ID } from "../config/chain";

interface UseDeviceSignaturesOptions {
    deviceId?: string;
    limit?: number;
    intervalMs?: number;
}

export function useDeviceSignatures({
    deviceId = DEMO_DEVICE_ID,
    limit = 10,
    intervalMs = 15000,
}: UseDeviceSignaturesOptions = {}) {
    const [signatures, setSignatures] = useState<ConfirmedSignatureInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const connection = getConnection();
        const devicePda = deriveDevicePda(deviceId);

        const fetchSigs = async () => {
            try {
                const sigs = await connection.getSignaturesForAddress(devicePda, {
                    limit,
                });
                if (!isMounted) return;
                setSignatures(sigs);
                setIsLoading(false);
            } catch (e: any) {
                if (!isMounted) return;
                setError(e?.message ?? "failed to fetch signatures");
                setIsLoading(false);
            }
        };

        fetchSigs();
        const interval = setInterval(fetchSigs, intervalMs);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [deviceId, limit, intervalMs]);

    return { signatures, latestSignature: signatures[0]?.signature ?? null, isLoading, error };
}
