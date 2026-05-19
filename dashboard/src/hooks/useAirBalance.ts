/**
 * useAirBalance — 주어진 지갑의 AIR 토큰 잔액을 조회/폴링하는 훅.
 *
 * `owner`가 PublicKey면 그 지갑 잔액을, null이면 0을 반환합니다.
 * DashboardPage가 사용자 Phantom 지갑 잔액을 표시할 수 있게 만들기 위한 핵심 도구.
 */
import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { getConnection, AIR_MINT } from "../config/chain";

interface UseAirBalanceOptions {
    owner: PublicKey | null;
    intervalMs?: number;
}

export function useAirBalance({ owner, intervalMs = 15000 }: UseAirBalanceOptions) {
    const [balance, setBalance] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!owner) {
            setBalance(null);
            return;
        }

        let isMounted = true;
        const connection = getConnection();

        const fetchBalance = async () => {
            try {
                const accounts = await connection.getTokenAccountsByOwner(owner, {
                    mint: AIR_MINT,
                });
                if (!isMounted) return;

                if (accounts.value.length === 0) {
                    // ATA 미생성 — 잔액 0
                    setBalance(0);
                    return;
                }

                const info = await connection.getTokenAccountBalance(
                    accounts.value[0].pubkey
                );
                if (!isMounted) return;
                setBalance(info.value.uiAmount ?? 0);
            } catch (e: any) {
                if (!isMounted) return;
                setError(e?.message ?? "failed to fetch balance");
            }
        };

        fetchBalance();
        const interval = setInterval(fetchBalance, intervalMs);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [owner?.toBase58(), intervalMs]);

    return { balance, error };
}
