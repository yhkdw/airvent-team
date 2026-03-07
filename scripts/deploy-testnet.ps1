# ─────────────────────────────────────────────────────────
# AirVent Subscription — Solana Testnet 배포 스크립트 (Windows)
# ─────────────────────────────────────────────────────────
# 사용법: powershell -File scripts/deploy-testnet.ps1
# 사전 요구: Solana CLI, Anchor CLI, Rust 설치 필요

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "   AirVent Subscription — Testnet 배포" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Solana CLI를 Testnet으로 설정
Write-Host "[1/6] Solana CLI를 Testnet으로 설정 중..." -ForegroundColor Yellow
solana config set --url https://api.testnet.solana.com
Write-Host ""

# 2. 키페어 확인 또는 생성
$keypairPath = "$env:USERPROFILE\.config\solana\id.json"
if (-Not (Test-Path $keypairPath)) {
    Write-Host "[2/6] 키페어가 없습니다. 새로 생성합니다..." -ForegroundColor Yellow
    solana-keygen new --outfile $keypairPath --no-bip39-passphrase
} else {
    Write-Host "[2/6] 기존 키페어를 사용합니다." -ForegroundColor Green
}

$walletAddress = solana address
Write-Host "   지갑 주소: $walletAddress" -ForegroundColor White
Write-Host ""

# 3. Testnet SOL 에어드롭
Write-Host "[3/6] Testnet SOL 에어드롭 요청 중..." -ForegroundColor Yellow
Write-Host "   (Testnet은 에어드롭이 제한적일 수 있습니다)" -ForegroundColor DarkGray
try {
    solana airdrop 1 --url https://api.testnet.solana.com
} catch {
    Write-Host "   ⚠ 에어드롭 실패. Solana Faucet을 사용하세요:" -ForegroundColor Red
    Write-Host "   https://faucet.solana.com/ (Testnet 선택)" -ForegroundColor Cyan
}
Write-Host ""

# 4. 잔고 확인
Write-Host "[4/6] 잔고 확인 중..." -ForegroundColor Yellow
$balance = solana balance
Write-Host "   현재 잔고: $balance" -ForegroundColor White
Write-Host ""

# 5. Anchor 빌드
Write-Host "[5/6] Anchor 프로젝트 빌드 중..." -ForegroundColor Yellow
anchor build
Write-Host ""

# 6. Testnet 배포
Write-Host "[6/6] Testnet에 배포 중..." -ForegroundColor Yellow
anchor deploy --provider.cluster testnet

# 배포된 프로그램 ID 가져오기
try {
    $programId = solana address -k target/deploy/airvent_subscription-keypair.json
} catch {
    $programId = "확인 필요"
}

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Green
Write-Host "   ✅ 배포 완료!" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
Write-Host ""
Write-Host "   프로그램 ID: $programId" -ForegroundColor White
Write-Host "   클러스터:    Testnet" -ForegroundColor White
Write-Host "   Explorer:    https://explorer.solana.com/address/$programId`?cluster=testnet" -ForegroundColor Cyan
Write-Host ""
Write-Host "   ⚠ 중요: 배포 후 아래 파일에서 프로그램 ID를 업데이트하세요:" -ForegroundColor Yellow
Write-Host "     1. Anchor.toml → [programs.testnet] 섹션" -ForegroundColor DarkGray
Write-Host "     2. programs/.../src/lib.rs → declare_id!()" -ForegroundColor DarkGray
Write-Host "     3. app/solana/provider.ts → PROGRAM_ID" -ForegroundColor DarkGray
Write-Host ""
