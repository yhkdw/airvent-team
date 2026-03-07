import { Component, ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: string;
}

/**
 * WalletErrorBoundary
 * SubscriptionCard 또는 기타 지갑 관련 컴포넌트에서 발생하는
 * 런타임 에러로 인한 검은 화면을 방지합니다.
 */
export class WalletErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: "" };
    }

    static getDerivedStateFromError(err: Error): State {
        return { hasError: true, error: err.message || "Unknown error" };
    }

    componentDidCatch(err: Error) {
        console.error("[WalletErrorBoundary] Caught error:", err);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: "" });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-6 text-center">
                    <div className="w-12 h-12 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <div className="text-sm text-rose-200 font-bold mb-2">지갑 컴포넌트에서 오류가 발생했습니다.</div>
                    <div className="text-xs text-rose-400 font-mono mb-4 bg-black/40 p-3 rounded-lg break-all">
                        {this.state.error}
                    </div>
                    <button
                        onClick={this.handleRetry}
                        className="rounded-xl border border-rose-500/50 bg-rose-500/10 text-rose-100 font-bold px-6 py-2.5 hover:bg-rose-500/20 transition-all text-sm"
                    >
                        🔄 다시 시도하기
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
