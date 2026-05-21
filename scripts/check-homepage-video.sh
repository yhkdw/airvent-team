#!/usr/bin/env bash
# ==============================================================================
# AirVent 홈페이지 데모 영상 통합 점검
# - 영상 파일 존재/크기 확인 (25MB 초과 경고)
# - 마케팅 문서 존재 확인
# - LandingPage.tsx 가 /videos/airvent-demo-ko.mp4 를 참조하는지
# - .env, wallet json 등 시크릿이 Git 추적 중인지 (추적 중이면 exit 1)
# ==============================================================================
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

EXIT_CODE=0

echo -e "${CYAN}== Video asset ==${NC}"
VIDEO="dashboard/public/videos/airvent-demo-ko.mp4"
if [[ -f "$VIDEO" ]]; then
  SIZE_BYTES=$(stat -f%z "$VIDEO" 2>/dev/null || stat -c%s "$VIDEO" 2>/dev/null)
  SIZE_MB=$(( SIZE_BYTES / 1024 / 1024 ))
  echo -e "${GREEN}OK${NC}: $VIDEO exists (${SIZE_MB} MB)"
  if (( SIZE_MB > 25 )); then
    echo -e "${YELLOW}WARN${NC}: video > 25MB — consider compressing for Vercel."
  fi
else
  echo -e "${YELLOW}MISSING${NC}: $VIDEO"
  echo "       copy a real mp4 there, e.g.:"
  echo "       cp demo/output/airvent-demo-ko.mp4 $VIDEO"
fi

echo
echo -e "${CYAN}== Marketing doc ==${NC}"
DOC="docs/marketing/homepage-video-plan.md"
if [[ -f "$DOC" ]]; then
  echo -e "${GREEN}OK${NC}: $DOC exists"
else
  echo -e "${YELLOW}MISSING${NC}: $DOC"
fi

echo
echo -e "${CYAN}== LandingPage references ==${NC}"
LANDING="dashboard/src/pages/LandingPage.tsx"
if [[ -f "$LANDING" ]] && grep -q "/videos/airvent-demo-ko.mp4" "$LANDING"; then
  count=$(grep -c "/videos/airvent-demo-ko.mp4" "$LANDING")
  echo -e "${GREEN}OK${NC}: $LANDING references the video ($count occurrence(s))"
else
  echo -e "${YELLOW}MISSING${NC}: $LANDING does not reference /videos/airvent-demo-ko.mp4"
fi

echo
echo -e "${CYAN}== Secret tracking ==${NC}"
tracked_env="$(git ls-files dashboard/bridge/.env .env dashboard/.env airvent-demo/.env 2>/dev/null || true)"
if [[ -n "$tracked_env" ]]; then
  echo -e "${RED}ERROR${NC}: env file is tracked by git:"
  echo "$tracked_env"
  EXIT_CODE=1
else
  echo -e "${GREEN}OK${NC}: no env file is tracked"
fi

tracked_wallets="$(git ls-files 2>/dev/null | grep -E '(^|/)(airvent-bridge.*\.json|.*wallet.*\.json|.*-keypair\.json|id[^/]*\.json)$' || true)"
if [[ -n "$tracked_wallets" ]]; then
  echo -e "${RED}ERROR${NC}: wallet/keypair JSON is tracked by git:"
  echo "$tracked_wallets"
  EXIT_CODE=1
else
  echo -e "${GREEN}OK${NC}: no wallet/keypair JSON is tracked"
fi

echo
if (( EXIT_CODE == 0 )); then
  echo -e "${GREEN}✅ All checks passed.${NC}"
else
  echo -e "${RED}❌ Some secret check failed. Resolve before pushing.${NC}"
fi
exit $EXIT_CODE
