/**
 * 연결된 지갑의 AIR 토큰 잔액 조회 훅.
 * dashboard/src/hooks/useAirBalance.ts 의 JS 포트.
 */
import { useEffect, useState } from "react";
import { getConnection, AIR_MINT } from "../config/chain";

export function useAirBalance(owner, intervalMs = 15000) {
    const [balance, setBalance] = useState(null);
    const [error, setError] = useState(null);

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
                    setBalance(0);
                    return;
                }

                const info = await connection.getTokenAccountBalance(
                    accounts.value[0].pubkey
                );
                if (!isMounted) return;
                setBalance(info.value.uiAmount ?? 0);
            } catch (e) {
                if (!isMounted) return;
                setError(e?.message ?? "balance fetch failed");
            }
        };

        fetchBalance();
        const id = setInterval(fetchBalance, intervalMs);
        return () => {
            isMounted = false;
            clearInterval(id);
        };
    }, [owner?.toBase58(), intervalMs]);

    return { balance, error };
}
