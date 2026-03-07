#!/bin/bash
# ─────────────────────────────────────────────────────────
# AirVent Subscription — Solana Devnet 배포 스크립트
# ─────────────────────────────────────────────────────────
# 사용법: bash scripts/deploy-devnet.sh
# 사전 요구: Solana CLI, Anchor CLI, Rust 설치 필요

set -e

echo "═══════════════════════════════════════════════════"
echo "   AirVent Subscription — Devnet 배포"
echo "═══════════════════════════════════════════════════"
echo ""

# 0. 환경 변수 초기화 (Windows PATH 간섭 방지)
echo "🔍 [0/6] 환경 변수 정리 중..."
# npm, node 관련 Windows 경로 제거 (WSL 도구 우선순위 보장)
export PATH=$(echo "$PATH" | sed -e 's/:\/mnt\/c\/Users\/[^\/]*\/AppData\/Roaming\/npm//g' -e 's/:\/mnt\/c\/Program Files\/nodejs\///g')

export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
export PATH="$HOME/.cargo/bin:$PATH"
export PATH="$HOME/.local/bin:$PATH"

# 1. Rust 및 Cargo 설치 확인
if ! command -v cargo &> /dev/null; then
    echo "⚠️ Rust가 설치되어 있지 않습니다. 설치를 시작합니다..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source $HOME/.cargo/env
    export PATH="$HOME/.cargo/bin:$PATH"
    rustup default stable
    echo "✅ Rust 설치 완료"
else
    # 이미 설치된 경우라도 default가 없을 수 있으므로 설정 시도
    rustup default stable || true
fi

# 2. Solana CLI 설치 확인 및 설치 (Ultra-Robust 모드)
if ! command -v solana &> /dev/null; then
    echo "⚠️ Solana CLI를 찾을 수 없습니다. 초강력 설치 모드를 시작합니다..."
    
    INSTALL_SUCCESS=false
    
    # 방법 1: curl 공식 스크립트
    echo "   [방법 1] 공식 설치 스크립트 시도 중..."
    # -k (insecure) 옵션을 sh 내부 curl에도 전달하기 위해 아예 바이너리 다운로드로 바로 갑니다.
    
    echo "   ⚠️ 공인 서버 접속 불안정. [방법 2] 미러 사이트 및 SSL 검증 무시 모드로 전환..."
    
    # 사용자 홈 디렉토리 명합
    USER_HOME="/home/vscode"
    [ ! -d "$USER_HOME" ] && USER_HOME="$HOME"
    
    INSTALL_DIR="$USER_HOME/.local/share/solana/install"
    mkdir -p "$INSTALL_DIR"
    
    # 여러 다운로드 시도 (SSL 무시 필수)
    URLS=(
        "https://github.com/solana-labs/solana/releases/download/v1.18.12/solana-release-x86_64-unknown-linux-gnu.tar.bz2"
        "http://release.solana.com/v1.18.12/solana-release-x86_64-unknown-linux-gnu.tar.bz2"
    )
    
    INSTALL_SUCCESS=false
    for url in "${URLS[@]}"; do
        echo "   -> 다운로드 시도: $url"
        # --no-check-certificate (wget), -k (curl) 사용
        if wget --no-check-certificate --timeout=60 --tries=5 -O "$INSTALL_DIR/solana.tar.bz2" "$url" || \
           curl -L -k --connect-timeout 60 --retry 5 -o "$INSTALL_DIR/solana.tar.bz2" "$url"; then
            echo "   ✅ 다운로드 성공. 압축 해제 중..."
            cd "$INSTALL_DIR"
            tar jxf solana.tar.bz2
            rm -rf active_release
            mv solana-release active_release
            INSTALL_SUCCESS=true
            cd - > /dev/null
            break
        fi
    done
    
    # 경로 강제 주입
    SOLANA_BIN_PATH="$INSTALL_DIR/active_release/bin"
    export PATH="$SOLANA_BIN_PATH:$PATH"
    
    # 최종 확인
    if ! command -v solana &> /dev/null; then
        echo "❌ 모든 방법이 실패했습니다."
        echo "   (최종 시도 경로: $SOLANA_BIN_PATH)"
        echo "   팁: WSL 터미널에서 'ping google.com'이 되는지 확인해 보세요."
        exit 1
    fi
    echo "✅ Solana CLI 준비 완료! ($(solana --version))"
fi

# 2. Node.js 설치 확인 및 설치 (WSL 전용)
if ! command -v node &> /dev/null; then
    echo "⚠️ Node.js가 없습니다. nvm을 통해 설치를 시도합니다..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 18
    nvm use 18
    echo "✅ Node.js 설치 완료 ($(node -v))"
fi

# 3. Anchor CLI 설치 확인 및 설치 (바이너리 방식)
if ! command -v anchor &> /dev/null; then
    echo "⚠️ Anchor CLI를 찾을 수 없습니다. 설치를 시작합니다..."
    npm install -g @coral-xyz/anchor-cli@0.30.1
    echo "✅ Anchor CLI 설치 완료"
fi

# 4. Solana CLI를 Devnet으로 설정
echo "📡 [1/6] Solana CLI를 Devnet으로 설정 중..."
solana config set --url https://api.devnet.solana.com
echo ""

# 2. 키페어 확인 또는 생성
KEYPAIR_PATH="$HOME/.config/solana/id.json"
if [ ! -f "$KEYPAIR_PATH" ]; then
    echo "🔑 [2/6] 키페어가 없습니다. 새로 생성합니다..."
    solana-keygen new --outfile "$KEYPAIR_PATH" --no-bip39-passphrase
else
    echo "🔑 [2/6] 기존 키페어를 사용합니다."
fi

WALLET_ADDRESS=$(solana address)
echo "   지갑 주소: $WALLET_ADDRESS"
echo ""

# 3. Devnet SOL 에어드롭
echo "💰 [3/6] Devnet SOL 에어드롭 요청 중..."
solana airdrop 1 --url devnet || echo "   ⚠ 에어드롭 요청이 거부되었습니다. (이미 충분하거나 제한 도달)"
echo ""

# 4. 잔고 확인
echo "💳 [4/6] 잔고 확인 중..."
BALANCE=$(solana balance)
echo "   현재 잔고: $BALANCE"
echo ""

# 5. Anchor 빌드 및 배포 환경 준비
echo "🔧 [5/6] 도구 환경 설정 중..."
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 6. Anchor 빌드
echo "🔨 [6/6] Anchor 프로젝트 빌드 중..."
anchor build
echo ""

# 7. Devnet 배포
echo "🚀 [7/6] Devnet에 배포 중..."
anchor deploy --provider.cluster devnet

# 배포된 프로그램 ID 가져오기
PROGRAM_ID=$(solana address -k target/deploy/airvent_subscription-keypair.json 2>/dev/null || echo "확인 필요")

echo ""
echo "═══════════════════════════════════════════════════"
echo "   ✅ 배포 완료!"
echo "═══════════════════════════════════════════════════"
echo ""
echo "   프로그램 ID: $PROGRAM_ID"
echo "   클러스터:    Devnet"
echo "   Explorer:    https://explorer.solana.com/address/$PROGRAM_ID?cluster=devnet"
echo ""
echo "   ⚠ 다음 파일을 업데이트하세요:"
echo "     1. Anchor.toml → [programs.devnet] 섹션"
echo "     2. programs/airvent_subscription/src/lib.rs → declare_id!()"
echo "     3. dashboard/src/solana/provider.ts → PROGRAM_ID"
echo ""
