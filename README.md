# AirVent Subscription — Solana Anchor 스마트 컨트랙트

AirVent DePIN 플랫폼의 무료/프리미엄 구독 관리를 Solana 블록체인 위에 구현한 Anchor 프로젝트입니다.

## 📋 프로젝트 구조

```
Airvent-codex/
├── Anchor.toml              # Anchor 프레임워크 설정
├── Cargo.toml               # Rust 워크스페이스 설정
├── programs/
│   └── airvent_subscription/
│       ├── Cargo.toml
│       └── src/lib.rs        # 스마트 컨트랙트 (개선 완료)
├── app/                      # 프론트엔드 연동 코드
│   ├── idl/
│   │   └── airvent_subscription.ts   # IDL 타입 정의
│   ├── solana/
│   │   ├── provider.ts       # Solana 연결 유틸리티
│   │   └── subscription.ts   # 컨트랙트 호출 함수
│   └── components/
│       └── SubscriptionCard.tsx  # 구독 관리 UI
├── migrations/
│   └── deploy.ts
└── tests/                    # (향후 추가)
```

## 🔧 스마트 컨트랙트 기능

| 기능 | 함수명 | 설명 |
|------|--------|------|
| 무료 계정 생성 | `initialize_free_subscription` | 대시보드 가입 시 온체인 계정 생성 |
| 포인트 적립 | `earn_free_points` | 오라클/서버가 사용자에게 포인트 적립 (1~1000) |
| 프리미엄 업그레이드 | `upgrade_to_premium` | 하드웨어 시리얼 등록 및 프리미엄 전환 |
| 프리미엄 해제 | `downgrade_from_premium` | 무료 구독으로 다시 전환 |

## 🛠️ 빌드 및 배포

### 사전 요구사항
- [Rust](https://rustup.rs/)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor CLI](https://www.anchor-lang.com/docs/installation)

### 빌드
```bash
anchor build
```

### 배포 (Solana Testnet)

로컬 PC의 용량 문제 해결을 위해 **GitHub Codespaces**에서 배포하는 것을 권장합니다.

1. **Codespace 실행**: GitHub 리포지토리 상단의 `Code` -> `Codespaces` -> `Create codespace` 클릭
2. **배포 스크립트 실행**: 터미널에서 다음 명령 실행
   ```bash
   bash scripts/deploy-testnet.sh
   ```
3. **Program ID 업데이트**: 배포 완료 후 출력되는 ID를 아래 파일들에 업데이트하세요.
   - `Anchor.toml`
   - `programs/airvent_subscription/src/lib.rs` (declare_id)
   - `app/solana/provider.ts`

## 🔗 대시보드 연동 방법

### 1. 패키지 설치
```bash
cd Airvent_Dashboard
npm install @solana/web3.js @coral-xyz/anchor
```

### 2. 파일 복사
`app/` 폴더의 파일들을 대시보드 프로젝트로 복사:

```
app/idl/             → src/idl/
app/solana/          → src/solana/
app/components/      → src/components/ 에 추가
```

### 3. 환경 변수 (선택)
`.env` 파일에 추가:
```
VITE_SOLANA_CLUSTER=testnet
VITE_SOLANA_RPC=https://api.testnet.solana.com
```

### 4. DashboardPage에 통합
```tsx
import SubscriptionCard from "../components/SubscriptionCard";

// DashboardPage 내부에 추가:
<SubscriptionCard />
```

## 🔒 보안 사항

- **Authority 패턴**: 포인트 적립은 반드시 `authority` (서버/오라클) 서명이 필요합니다
- **단일 적립 제한**: 최대 1,000 포인트/건
- **오버플로우 보호**: `checked_add`로 안전하게 처리
- **PDA 기반**: 사용자당 하나의 고유 계정 (seeds: `["subscription", user_pubkey]`)

## 🛡️ 데이터 위변조 검증 (Data Tampering Verification)

AirVent 플랫폼은 공기질 데이터의 무결성을 보장하기 위해 HMAC-SHA256 기반의 검증 시스템을 제공합니다.

### 📋 주요 검증 항목
1. **무결성 검증**: 서버/디바이스 비밀키를 이용한 HMAC 서명 비교
2. **연속성 검증**: 타임스탬프 역행 여부 확인
3. **이상치 검증**: 급격한 데이터 변화 감지 (Suspicious 판정)

### 🚀 실행 방법
```bash
python air_quality_validator.py --input sample_data.jsonl --secret airvent-demo-key
```

### 📂 파일 구성
- `air_quality_validator.py`: 검증 로직 및 CLI 툴
- `sample_data.jsonl`: 테스트용 예시 데이터 (정상/변조/의심 데이터 포함)
