# AirVent Bridge Service

MQTT (Naver Cloud) → Supabase + Solana 데이터 브리지.

## 🔧 환경 설정 (.env)

이 서비스는 모든 시크릿/설정을 환경변수로 받습니다. 처음 셋업할 때:

```bash
cd dashboard/bridge
cp .env.example .env
```

그리고 `.env` 파일을 열어 실제 값을 채워주세요. 누락된 키가 있으면 서비스 시작 시 즉시 에러로 종료됩니다 (fail-fast).

### 필수 환경변수

| 키 | 설명 | 예시 |
|---|---|---|
| `SUPABASE_URL` | Supabase 프로젝트 URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (서버 전용) | `eyJhbGciOi...` |
| `MQTT_HOST` | MQTT 브로커 주소 (스킴 포함) | `mqtt://211.188.57.53:1883` |
| `MQTT_USERNAME` | MQTT 사용자명 | `airvent_broker` |
| `MQTT_PASSWORD` | MQTT 비밀번호 | `••••••••` |
| `SOLANA_RPC` | Solana RPC 엔드포인트 | `https://api.devnet.solana.com` |
| `SOLANA_PROGRAM_ID` | airvent-contract Program ID | `B4m1ENS6SWV3H6mZkJ2VFkBKawqYe7atH4AjXoc4NZzR` |
| `SOLANA_AIR_MINT` | AIR 토큰 Mint 주소 | `BXV4ewBjMB1qmXjU3bc14SfXHQbseFhRy5xE4RtHtvsL` |
| `BRIDGE_WALLET_PATH` | 서버 지갑 키 파일 절대경로 | `/Users/.../airvent-bridge.json` |

### 선택 환경변수

| 키 | 기본값 | 설명 |
|---|---|---|
| `MQTT_TOPIC` | `env/SML001/+/data` | 구독할 MQTT 토픽 |
| `DEVICE_ID` | `5EBHA10001` | `register.ts` 실행 시 등록할 디바이스 ID |

## 🚀 실행

```bash
# 의존성 설치
npm install

# 브리지 메인 서비스
npm start

# TypeScript 타입체크
npm run typecheck

# 디바이스 1회성 등록 (해당 device_id가 미등록일 때)
npx ts-node -T register.ts

# 서버 지갑의 AIR ATA 생성 (최초 1회)
npx ts-node -T create_ata.ts
```

## 🔐 보안 주의사항

- `.env` 파일은 **절대 Git에 커밋하지 마세요**. `.gitignore`에 등록되어 있지만 항상 `git status`로 확인 권장.
- `SUPABASE_SERVICE_ROLE_KEY`는 RLS를 우회할 수 있는 서버 전용 키입니다. 브라우저/Vercel 프론트 환경변수에 넣지 말고 브리지 서버에만 보관하세요.
- 지갑 키 파일(`*-keypair.json`, `airvent-bridge*.json` 등)도 마찬가지로 커밋 금지. 같은 패턴이 루트/`bridge`의 `.gitignore`에 포함되어 있습니다.
- MQTT 비밀번호가 한 번이라도 노출된 적이 있다면 즉시 로테이션을 권장합니다.
- 프로덕션에서는 MQTT를 `mqtts://` (TLS)로 마이그레이션하세요.

## 🧱 코드 구조

```
bridge/
├── config.ts           # 환경변수 중앙 로더 (fail-fast 검증)
├── index.ts            # 메인 진입점 (MQTT 구독 → Supabase + Solana)
├── register.ts         # 디바이스 등록 1회성 스크립트
├── create_ata.ts       # AIR 토큰 ATA 생성 스크립트
├── .env.example        # 환경변수 템플릿
├── .env                # 실제 값 (Git 미추적)
└── .gitignore
```

> **IDL 위치**: 정본 IDL은 `airvent-team/idl/airvent_contract.json` 에 보관됩니다 (Single Source of Truth).
> 브리지는 이 정본을 직접 읽으며, 부팅 시 IDL의 `address` 필드와 `SOLANA_PROGRAM_ID` 환경변수가
> 일치하는지 자동 검증합니다. IDL 갱신은 `./scripts/sync-idl.sh` 로 수행하세요.
> 상세 절차는 [`idl/README.md`](../../idl/README.md) 참고.
