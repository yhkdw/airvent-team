#!/bin/bash
# ─────────────────────────────────────────────────────────
# AirVent Subscription — Solana Testnet 배포 스크립트
# ─────────────────────────────────────────────────────────
# 사용법: bash scripts/deploy-testnet.sh
# 사전 요구: Solana CLI, Anchor CLI, Rust 설치 필요

set -e

echo "═══════════════════════════════════════════════════"
echo "   AirVent Subscription — Testnet 배포"
echo "═══════════════════════════════════════════════════"
echo ""

# 0. 디버깅 정보 (필요시)
echo "💻 [0/6] 시스템 환경 확인 중..."
lsb_release -a 2>/dev/null | grep Description || cat /etc/os-release | grep PRETTY_NAME
echo "   Anchor 위치: $(which anchor || echo "찾을 수 없음")"
echo "   Anchor 버전: $(anchor --version 2>/dev/null || echo "실행 불가")"
echo ""

# 1. Solana CLI를 Testnet으로 설정
echo "📡 [1/6] Solana CLI를 Testnet으로 설정 중..."
solana config set --url https://api.testnet.solana.com
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

# 3. Testnet SOL 에어드롭 (테스트용)
echo "💰 [3/6] Testnet SOL 에어드롭 요청 중..."
echo "   (Testnet은 에어드롭이 제한적일 수 있습니다)"
solana airdrop 1 --url https://api.testnet.solana.com || {
    echo "   ⚠ 에어드롭 요청이 거부되었습니다. (테스트넷 제한)"
    echo "   🔗 브라우저에서 아래 링크를 열어 수동으로 에어드롭을 받으세요:"
    echo "      https://faucet.solana.com/ (주소: $WALLET_ADDRESS, Testnet 선택)"
    echo ""
    read -p "   에어드롭을 받으셨다면 [Enter]를 눌러 진행하세요..."
}
echo ""

# 4. 잔고 확인
echo "💳 [4/6] 잔고 확인 중..."
BALANCE=$(solana balance)
echo "   현재 잔고: $BALANCE"
echo ""

# 5. Anchor 빌드
echo "🔨 [5/6] Anchor 프로젝트 빌드 중..."
anchor build
echo ""

# 6. Testnet 배포
echo "🚀 [6/6] Testnet에 배포 중..."
anchor deploy --provider.cluster testnet

# 배포된 프로그램 ID 가져오기
PROGRAM_ID=$(solana address -k target/deploy/airvent_subscription-keypair.json 2>/dev/null || echo "확인 필요")

echo ""
echo "═══════════════════════════════════════════════════"
echo "   ✅ 배포 완료!"
echo "═══════════════════════════════════════════════════"
echo ""
echo "   프로그램 ID: $PROGRAM_ID"
echo "   클러스터:    Testnet"
echo "   Explorer:    https://explorer.solana.com/address/$PROGRAM_ID?cluster=testnet"
echo ""
echo "   ⚠ 중요: 배포 후 아래 파일에서 프로그램 ID를 업데이트하세요:"
echo "     1. Anchor.toml → [programs.testnet] 섹션"
echo "     2. programs/airvent_subscription/src/lib.rs → declare_id!()"
echo "     3. app/solana/provider.ts → PROGRAM_ID"
echo ""
