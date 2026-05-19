/**
 * SolanaBadge — Tx 시그니처를 Solana Explorer 링크로 렌더링하는 공용 배지.
 *
 * 기존엔 RewardsTab/WalletTab에서 각자 인라인으로 anchor 태그를 만들었습니다.
 * 모든 Explorer 링크는 이 컴포넌트를 통하도록 일원화하세요.
 *
 * 사용 예:
 *   <SolanaBadge signature={tx} />                  // 기본 배지
 *   <SolanaBadge signature={tx} variant="compact" />  // 짧은 형태 (테이블 셀용)
 */
import { ExternalLink } from "lucide-react";
import { explorerTxUrl } from "../config/chain";

type Variant = "default" | "compact" | "subtle";

interface SolanaBadgeProps {
    signature: string | null | undefined;
    variant?: Variant;
    label?: string;
    /** 시그니처를 잘라 표시할지 (compact 모드만 적용) */
    truncate?: boolean;
}

function truncateSig(sig: string): string {
    if (sig.length <= 12) return sig;
    return `${sig.slice(0, 6)}…${sig.slice(-4)}`;
}

export default function SolanaBadge({
    signature,
    variant = "default",
    label,
    truncate = true,
}: SolanaBadgeProps) {
    if (!signature) return null;

    const href = explorerTxUrl(signature);
    const displayText = truncate ? truncateSig(signature) : signature;

    if (variant === "compact") {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={signature}
                className="inline-flex items-center gap-1 font-mono text-[10px] text-purple-400 hover:text-purple-300 hover:underline transition-colors"
            >
                {label ?? displayText}
                <ExternalLink size={10} />
            </a>
        );
    }

    if (variant === "subtle") {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={signature}
                className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-purple-400 transition-colors"
            >
                {label ?? "Tx"}
                <ExternalLink size={10} />
            </a>
        );
    }

    // default
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={signature}
            className="inline-flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 px-2 py-1 rounded transition-colors font-mono"
        >
            {label ?? `Solscan ${displayText}`}
            <ExternalLink size={10} />
        </a>
    );
}
