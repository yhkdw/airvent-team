# IDL (Interface Definition Language)

이 디렉토리는 **모든 솔라나 컨트랙트 IDL의 정본(Single Source of Truth)** 입니다.
브리지·대시보드·스크립트 등 어떤 코드든 IDL이 필요하면 여기 한 곳만 참조해야 합니다.

## 현재 정본 IDL

| 파일 | 컨트랙트 | Program ID (Devnet) | 사용처 |
|---|---|---|---|
| `airvent_contract.json` | 보상 컨트랙트 (`solana-contract` 리포) | `B4m1ENS6SWV3H6mZkJ2VFkBKawqYe7atH4AjXoc4NZzR` | `dashboard/bridge/index.ts`, `dashboard/bridge/register.ts` |

> `airvent_subscription`은 현재 `dashboard/src/idl/airvent_subscription.ts`에 TypeScript 형태로 보관되어 있습니다. JSON으로 일원화하는 작업은 별도 follow-up입니다.

## 🔄 IDL이 변경되면? — 갱신 절차

컨트랙트 코드를 수정해서 IDL이 바뀌면 다음 순서로 동기화합니다.

```bash
# 1. solana-contract 리포에서 컨트랙트 빌드
cd ../solana-contract
anchor build

# 2. airvent-team 리포로 돌아와 동기화 스크립트 실행
cd ../airvent-team
./scripts/sync-idl.sh

# 3. 변경된 내용 확인 후 커밋
git diff idl/airvent_contract.json
git add idl/airvent_contract.json
git commit -m "chore(idl): sync airvent_contract"
```

`solana-contract` 리포 경로가 다르면 인자로 전달할 수 있습니다.
```bash
./scripts/sync-idl.sh /Users/me/projects/solana-contract
```

## ⚠️ 정합성 검증 (자동)

브리지(`dashboard/bridge/index.ts`)는 부팅 시 **IDL의 `address` 필드와 `SOLANA_PROGRAM_ID` 환경변수가 일치하는지** 검증합니다. 불일치 시 즉시 에러로 종료됩니다 (PDA가 엉뚱한 프로그램을 가리키는 사고 예방).

따라서 IDL을 동기화할 때 반드시 함께 확인할 것:

```bash
# 정본 IDL의 address 확인
grep -m1 '"address"' idl/airvent_contract.json

# 브리지 .env의 SOLANA_PROGRAM_ID 확인
grep '^SOLANA_PROGRAM_ID' dashboard/bridge/.env
```

두 값이 같아야 합니다. (예: Devnet 배포 시 둘 다 `B4m1...`, Mainnet 배포 시 둘 다 새 ID)

## 🚫 하지 말 것

- IDL을 다른 디렉토리(`dashboard/bridge/idl/`, 루트 `airvent_contract.json` 등)에 복사해두지 마세요. 한 곳만 유지합니다.
- 손으로 IDL을 편집하지 마세요. 항상 `anchor build` → `sync-idl.sh` 흐름으로 갱신.

## 📂 옛 위치 (이전 작업으로 비워야 할 곳)

다음 위치들은 더 이상 코드에서 참조되지 않습니다. 다음 정리 단계에서 제거하세요:

- `airvent-team/airvent_contract.json` (루트의 옛 사본)
- `airvent-team/dashboard/bridge/idl/` (브리지의 옛 사본 디렉토리)
