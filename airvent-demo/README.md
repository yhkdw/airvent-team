# AirVent Demo — Mobile Pairing App

AirVent DePIN 의 모바일 컨셉 앱. 사용자가 본인 측정기를 Phantom 지갑으로 페어링하고,
온체인에 소유권을 등록하며, 본인 디바이스의 실시간 측정값과 AIR 토큰 보상을 받는 흐름을 구현합니다.

> 이 디렉토리는 모노레포(`airvent-team`)의 일부입니다. 메인 README는 [`../README.md`](../README.md) 참고.

---

## 🎯 무엇이 동작하나

| 기능 | 상세 |
|---|---|
| **Phantom 직접 연결** | `window.solana` 사용 (wallet-adapter 패키지 미사용). React 19 호환성 안전 |
| **온체인 디바이스 상태 미리보기** | `device_id` 입력 시 자동으로 PDA 조회 → 등록 여부·소유자 표시 |
| **`register_device` 호출** | 미등록 디바이스를 본인 지갑이 소유로 등록 (Devnet 트랜잭션) |
| **`transfer_ownership` 호출** | 본인이 owner인 경우 다른 지갑으로 소유권 위임 |
| **본인 측정값 필터링** | 페어링된 `device_id` 의 `sensor_readings` 만 표시 (Supabase Realtime) |
| **연결 지갑 AIR 잔액** | 실제 사용자 지갑 잔액 (15초 폴링) |
| **localStorage 페어링 지속** | 새로고침/재방문 시 자동 복원 + Phantom 자동 재연결(`onlyIfTrusted`) |

---

## 🛠 설정

### 1. 의존성 설치

```bash
cd airvent-demo
npm install
```

신규 의존성:
- `@coral-xyz/anchor` — Solana Anchor 클라이언트
- `@solana/spl-token` — AIR 토큰 잔액 조회
- `bn.js`, `buffer` — Solana 라이브러리의 트랜잭션 직렬화 기반

### 2. 환경 변수 (`.env`)

기본값으로도 Devnet 환경에서 동작합니다. 오버라이드가 필요하면:

```env
# 필수 (Supabase 측정값 조회용 anon key)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...

# 선택 (기본 Devnet)
VITE_SOLANA_CLUSTER=devnet
VITE_SOLANA_RPC=https://api.devnet.solana.com
VITE_SOLANA_PROGRAM_ID=B4m1ENS6SWV3H6mZkJ2VFkBKawqYe7atH4AjXoc4NZzR
VITE_SOLANA_AIR_MINT=BXV4ewBjMB1qmXjU3bc14SfXHQbseFhRy5xE4RtHtvsL
VITE_DEMO_SERVER_WALLET=GUyFB5qJvPMRZweeL8fb7KQDdRicArQCTyAw64dkRyHw
```

`VITE_*` 환경변수는 클라이언트 번들에 포함됩니다 → **service_role 키는 절대 넣지 마세요**.

### 3. 실행

```bash
npm run dev      # http://localhost:5173/demo/
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
```

---

## 📲 페어링 사용자 흐름

1. **Login 화면 → Node Pairing 진입**
2. **디바이스 ID 입력** (예: `5EBHA10001`)
   - 입력하자마자 온체인 상태가 자동 조회됩니다
   - "등록 가능" / "이미 등록됨 (소유자 표시)" 표시
3. **Phantom 연결** 버튼 → 지갑 승인 팝업
   - 새로고침해도 자동 재연결 (`tryEagerConnect`)
4. **`register_device` 호출**
   - Phantom 서명 → Devnet 전송 → Tx 시그니처 + Explorer 링크 표시
   - localStorage에 `device_id` 저장 → 다음 방문 시 페어링 유지
5. **대시보드로 이동** — 본인 디바이스의 실시간 측정값 표시
6. **Wallet 탭** — 연결된 지갑의 AIR 잔액 표시

### 소유권 위임 (Transfer Ownership)

본인이 owner인 디바이스에서 추가 옵션이 열립니다:

1. PairScreen → "다른 지갑에 소유권 위임하기 (고급)" 클릭
2. 새 owner 주소 입력 (base58 자동 검증)
3. "위임 진행" → "정말 위임" 2단계 확인
4. Phantom 서명 → `transfer_ownership` 인스트럭션 호출
5. 성공 시 자동으로 페어링 해제 (이제 내 디바이스 아님)

---

## 🧩 코드 구조

```
airvent-demo/
├── src/
│   ├── App.jsx                # 화면 라우팅 + 페어링/위임 UI (1268 라인)
│   ├── main.jsx               # 진입점 + Buffer 폴리필 등록
│   ├── index.css              # Tailwind
│   ├── config/
│   │   └── chain.js           # Solana/Supabase 상수 (env 오버라이드)
│   └── lib/
│       ├── phantom.js         # window.solana 직접 통합 (connect/eager/disconnect)
│       ├── anchor-client.js   # AnchorProvider + registerDevice/transferOwnership/fetchDeviceInfo
│       ├── supabase.js        # Supabase 클라이언트
│       └── useAirBalance.js   # 임의 지갑의 AIR 잔액 폴링 훅
├── vite.config.js             # Buffer alias + fs.allow ['..'] (정본 IDL import)
├── package.json
└── .env.example
```

IDL은 모노레포의 **정본** 위치([`../idl/airvent_contract.json`](../idl/README.md))에서 직접 import 합니다. 사본 없음.

---

## 🚨 자주 발생하는 문제

### "Phantom 지갑이 설치되어 있지 않습니다"

`window.phantom?.solana` / `window.solana` 가 주입되지 않은 환경입니다.

- 데스크탑: [Phantom 브라우저 확장](https://phantom.app) 설치 후 새로고침
- 모바일: **Phantom 모바일 앱 안의 in-app browser** 로 사이트를 열어야 합니다 (Safari/Chrome에서는 미감지)

### "Transaction simulation failed: insufficient funds for rent"

지갑에 SOL이 없어 트랜잭션 수수료/계정 임대비를 못 냅니다.

```bash
# 본인 지갑 주소로 Devnet airdrop (2 SOL)
solana airdrop 2 <YOUR_PHANTOM_PUBKEY> --url devnet

# 또는 https://faucet.solana.com 에서 받기
```

### "Device ID is already registered"

다른 사용자가 먼저 `register_device` 한 디바이스입니다. 본인 측정기가 맞다면:
1. 기존 owner에게 `transfer_ownership` 요청
2. 또는 본인 디바이스의 정확한 `device_id` 확인

### Buffer / BN.js 관련 런타임 에러

`vite.config.js`의 `define`/`resolve.alias`/`optimizeDeps`가 Solana 라이브러리의 Node 의존성을 폴리필합니다. 변경 후 에러가 나면 Vite 캐시 클리어:

```bash
rm -rf node_modules/.vite
npm run dev
```

---

## 🔗 관련 문서

- [메인 README](../README.md) — 전체 아키텍처
- [브리지 서비스](../dashboard/bridge/README.md) — MQTT → Supabase + Solana
- [IDL 정본 관리](../idl/README.md) — 컨트랙트 갱신 절차
- [airvent-contract 리포](https://github.com/yhkdw/solana-contract) — 솔라나 보상 컨트랙트 원본
