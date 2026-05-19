/**
 * Phantom 지갑 직접 통합 (window.solana).
 *
 * wallet-adapter 패키지를 쓰지 않고 Phantom 의 inject 객체와 직접 통신.
 * 데모용으로 가볍게 쓰기 적합. (모바일에서는 Phantom 앱의 in-app browser 에서 동작)
 */

/**
 * Phantom 이 주입되어 있는지 확인.
 */
export function getPhantomProvider() {
    if (typeof window === "undefined") return null;
    const provider = window?.phantom?.solana ?? window?.solana;
    if (provider?.isPhantom) return provider;
    return null;
}

/**
 * Phantom 지갑 연결. trusted=true로 자동 재연결 시도.
 * @returns Promise<PublicKey> — 연결된 지갑 publicKey
 */
export async function connectPhantom() {
    const provider = getPhantomProvider();
    if (!provider) {
        throw new Error(
            "Phantom 지갑이 설치되어 있지 않습니다. https://phantom.app 에서 설치하세요."
        );
    }
    const resp = await provider.connect();
    return resp.publicKey;
}

export async function disconnectPhantom() {
    const provider = getPhantomProvider();
    if (!provider) return;
    try {
        await provider.disconnect();
    } catch (e) {
        // ignore — already disconnected
    }
}

/**
 * 페이지 로드 시 이미 연결되어 있으면 자동 재연결.
 * 사용자가 한 번 연결한 후 새로고침해도 다시 묻지 않게 함.
 */
export async function tryEagerConnect() {
    const provider = getPhantomProvider();
    if (!provider) return null;
    try {
        const resp = await provider.connect({ onlyIfTrusted: true });
        return resp.publicKey;
    } catch {
        return null;
    }
}

/**
 * Phantom 을 AnchorProvider 의 Wallet 인터페이스에 맞춰 어댑팅.
 * Anchor의 Wallet은 publicKey + signTransaction + signAllTransactions 만 있으면 됨.
 */
export function phantomAsWallet() {
    const provider = getPhantomProvider();
    if (!provider) throw new Error("Phantom 지갑 미연결");
    return {
        get publicKey() {
            return provider.publicKey;
        },
        signTransaction: (tx) => provider.signTransaction(tx),
        signAllTransactions: (txs) => provider.signAllTransactions(txs),
    };
}
