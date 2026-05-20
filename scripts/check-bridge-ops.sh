#!/usr/bin/env bash
set -euo pipefail

echo "== Git status =="
git status --short --branch

echo
echo "== Required files =="
for path in \
  "docs/ops/airvent-db-bridge-runbook.md" \
  "dashboard/bridge/ecosystem.config.cjs" \
  "dashboard/bridge/.env.example"
do
  if [[ -f "$path" ]]; then
    echo "OK: $path exists"
  else
    echo "MISSING: $path"
  fi
done

echo
echo "== Secret tracking checks =="
tracked_env="$(git ls-files dashboard/bridge/.env .env dashboard/.env airvent-demo/.env || true)"
if [[ -n "$tracked_env" ]]; then
  echo "ERROR: env file is tracked by git:"
  echo "$tracked_env"
  exit 1
fi
echo "OK: no bridge/root/dashboard env file is tracked"

tracked_wallets="$(git ls-files | grep -E '(^|/)(airvent-bridge.*\.json|.*wallet.*\.json|.*-keypair\.json|id[^/]*\.json)$' || true)"
if [[ -n "$tracked_wallets" ]]; then
  echo "ERROR: wallet/keypair JSON appears to be tracked by git:"
  echo "$tracked_wallets"
  exit 1
fi
echo "OK: no airvent bridge, wallet, id, or keypair JSON is tracked"
