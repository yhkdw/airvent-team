#!/usr/bin/env bash
# ==============================================================================
# AirVent IDL 동기화 스크립트
# ------------------------------------------------------------------------------
# Anchor 컨트랙트가 변경되면 빌드된 IDL 파일을 리포 루트의 idl/ 디렉토리로
# 가져와 모든 코드가 같은 IDL을 보게 만듭니다 (Single Source of Truth).
#
# 사용법:
#   ./scripts/sync-idl.sh                       # 기본 위치에서 자동 탐색
#   ./scripts/sync-idl.sh /path/to/solana-contract
#
# 정본 위치:
#   airvent-team/idl/airvent_contract.json
#
# 정본을 참조하는 코드:
#   - dashboard/bridge/index.ts
#   - dashboard/bridge/register.ts
# ==============================================================================

set -euo pipefail

# 색상
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 경로 결정
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IDL_DEST="$REPO_ROOT/idl"
SOLANA_CONTRACT_DIR="${1:-$REPO_ROOT/../solana-contract}"

echo "📦 AirVent IDL Sync"
echo "   Destination: $IDL_DEST"
echo "   Source repo: $SOLANA_CONTRACT_DIR"
echo ""

# 1) solana-contract 리포 존재 확인
if [ ! -d "$SOLANA_CONTRACT_DIR" ]; then
  echo -e "${RED}❌ solana-contract 리포를 찾을 수 없습니다: $SOLANA_CONTRACT_DIR${NC}"
  echo "   첫 번째 인자로 경로를 지정하세요."
  exit 1
fi

# 2) 빌드된 IDL 탐색
SOURCE_IDL="$SOLANA_CONTRACT_DIR/target/idl/airvent_contract.json"
if [ ! -f "$SOURCE_IDL" ]; then
  echo -e "${YELLOW}⚠️  빌드된 IDL이 없습니다.${NC}"
  echo "   다음 명령으로 먼저 빌드하세요:"
  echo "     cd $SOLANA_CONTRACT_DIR && anchor build"
  exit 1
fi

# 3) 정본 디렉토리 준비
mkdir -p "$IDL_DEST"

# 4) 기존 정본과 비교
if [ -f "$IDL_DEST/airvent_contract.json" ]; then
  if diff -q "$SOURCE_IDL" "$IDL_DEST/airvent_contract.json" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 변경 없음 — 정본 IDL이 이미 최신입니다.${NC}"
    exit 0
  fi

  echo "🔄 IDL이 변경되었습니다. diff:"
  diff "$IDL_DEST/airvent_contract.json" "$SOURCE_IDL" | head -20 || true
  echo ""
fi

# 5) 복사
cp "$SOURCE_IDL" "$IDL_DEST/airvent_contract.json"
echo -e "${GREEN}✅ 동기화 완료: $IDL_DEST/airvent_contract.json${NC}"

# 6) IDL의 program address 추출해서 안내
ADDR=$(grep -o '"address":[^,]*' "$IDL_DEST/airvent_contract.json" | head -1 | sed 's/.*"address":[[:space:]]*"\([^"]*\)".*/\1/')
echo ""
echo "ℹ️  Program address: $ADDR"
echo "   dashboard/bridge/.env 의 SOLANA_PROGRAM_ID 값과 일치하는지 확인하세요."
echo ""
echo "🔍 다음 단계: 변경 사항을 검토하고 커밋"
echo "     git status idl/"
echo "     git diff idl/"
