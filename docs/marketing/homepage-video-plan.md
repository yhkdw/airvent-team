# Homepage Demo Video — Plan & Guidelines

랜딩 페이지(`LandingPage.tsx`)에 통합되는 데모 영상의 목적·자산 위치·카피·보안 가이드를 한 페이지에 정리합니다.

## 🎯 목적

방문자가 **30초 이내**에 다음을 이해할 수 있도록 합니다.

1. **AirVent Node** 라는 실제 측정기가 존재함
2. **실내 공기질 데이터**를 실시간으로 측정하고 전송함
3. **대시보드**에서 측정값을 바로 확인 가능
4. **검증 가능한 데이터 흐름** — Solana 기반 검증 기록

> ⚠️ 투자/수익 강조 어휘 금지. 측정·데이터·검증·신뢰성 중심.

## 🌐 URL

| 환경 | URL |
|---|---|
| Production | https://airvent.ai |
| Vercel Preview/Dev | https://airvent-team.vercel.app |

## 📁 자산 위치

### Hero & Full Demo 공통

```
dashboard/public/videos/
├── airvent-demo-ko.mp4          (60초, 15.2MB, 2030 kbps) — 메인
└── airvent-demo-en.mp4          (60초, 15.1MB)            — 영어 옵션
```

랜딩 페이지에서 참조하는 경로:

```
/videos/airvent-demo-ko.mp4
```

Vite의 `public/` 디렉토리는 빌드 시 루트로 그대로 복사됩니다. 따라서 dev (`npm run dev`)와 production (`npm run build && deploy`) 모두 동일 경로로 접근 가능.

### 영상 갱신 흐름

1. `demo/output/airvent-demo-ko.mp4` 에서 새 버전 생성 (`scripts/render-demo.mjs`)
2. `cp demo/output/airvent-demo-ko.mp4 dashboard/public/videos/airvent-demo-ko.mp4` 로 복사
3. 머신에서 `npm run build` 확인 후 커밋 + 푸시

### 포스터 (fallback 이미지)

영상 로딩 전 또는 autoplay 차단 시 표시. 현재는 `product_bg.png` 같은 기존 이미지 사용 가능. 별도 포스터 이미지 추천:

```
dashboard/public/hero-airvent-device.png      ← 권장 (1280x720 권장)
```

없으면 어두운 그라데이션 placeholder 가 표시됩니다.

---

## 🧱 페이지 구조

### 1) Hero 근처 — Compact 비디오 카드 (`DemoVideoCard`)

- "Live Node Demo" 라벨
- "Real sensor → Dashboard → Verification" 텍스트
- 3 proof chips:
  - `Live Telemetry`
  - `Dashboard`
  - `Solana Verification`
- 비디오는 **muted + loop + autoplay + playsInline**
- 시청자가 클릭하면 Full Demo 섹션으로 스크롤 또는 controls 활성화

### 2) Full Demo 섹션 (`HomepageDemoSection`)

- 제목: **AirVent DePIN Demo**
- 부제: "실제 노드, 실시간 대시보드, 검증 가능한 데이터 흐름을 한 번에 확인하세요."
- 60초 비디오 (`controls`, `preload="metadata"`)
- 3 단계 텍스트:
  1. Node measures indoor air
  2. Dashboard displays live telemetry
  3. Verification record is anchored to Solana
- CTA 버튼:
  - **Live Dashboard 보기** → `/dashboard`
  - **Genesis Node 알아보기** → `/node`

---

## 🗣 추천 카피

### 🇰🇷 한국어

| 위치 | 카피 |
|---|---|
| 메인 헤드라인 | 실내 공기질 데이터를 실시간으로 측정하고 검증합니다. |
| 서브카피 | AirVent Node는 실내 공기질을 측정하고, 대시보드와 검증 가능한 데이터 흐름으로 연결합니다. |
| CTA 1 | Live Dashboard 보기 |
| CTA 2 | Demo 영상 보기 |
| CTA 3 | Genesis Node 알아보기 |

### 🇺🇸 English

| 위치 | 카피 |
|---|---|
| Headline | Live Indoor Air Data, Verified Onchain. |
| Subcopy | AirVent Node measures indoor air quality, streams telemetry to the dashboard, and connects trusted data to Solana-based verification. |
| CTA 1 | View Live Dashboard |
| CTA 2 | Watch Demo |
| CTA 3 | Explore Genesis Node |

### 피해야 할 표현 (한·영 공통)

| 금지 | 권장 대체 |
|---|---|
| guaranteed income | participate in network rewards (선택) |
| expected returns / 예상 수익 | network contribution recognition |
| investment profit / 투자 수익 | data contribution |
| 초기 비용 0원으로 수익화 | 측정값 기여 + 검증 기록 |

---

## ⚡ 성능 가이드라인

| 항목 | 권장 |
|---|---|
| Hero 비디오 | YouTube/Loom iframe 금지 → 로컬 mp4 사용 |
| Full Demo 비디오 | `preload="metadata"` (전체 파일 다운로드 회피) |
| Hero autoplay | `muted` + `playsInline` 필수 (모바일 정책) |
| 모바일 레이아웃 | 비디오는 헤드라인 아래로 배치, 읽힘 보장 |
| 파일 크기 | 25MB 이내 권장 (현재 15.2MB OK) |

---

## 🔐 보안 체크리스트

영상에 다음이 **단 한 프레임이라도 노출되어서는 안 됩니다**:

- ❌ Supabase URL, anon key, **service_role key**
- ❌ MQTT 비밀번호 / 사용자명
- ❌ Solana 지갑 secret key, keypair JSON
- ❌ admin 이메일/비밀번호
- ❌ 터미널의 시크릿 환경변수 출력
- ❌ `.env` 파일 내용
- ❌ Git 로그에서 시크릿이 보이는 커밋

녹화 전 체크:

```bash
# 시크릿이 화면에 없는지 환경변수 확인
env | grep -iE "KEY|TOKEN|SECRET|PASSWORD" | head
# 위 결과가 안 보이는 터미널/탭에서만 녹화
```

### 영상 자체에 시크릿이 들어갔다면

해당 mp4 폐기 → 재녹화 + 재렌더 → 옛 버전이 이미 푸시됐다면 Git 히스토리에서 제거 (`git filter-repo` 또는 BFG).

---

## 🧪 검증 헬퍼

`scripts/check-homepage-video.sh` 를 실행하면 다음을 한 번에 점검합니다:

- `dashboard/public/videos/airvent-demo-ko.mp4` 존재 + 크기 (25MB 초과 시 경고)
- 본 문서 (`homepage-video-plan.md`) 존재
- `LandingPage.tsx` 에서 `/videos/airvent-demo-ko.mp4` 참조 여부
- 시크릿(.env, wallet json) 추적 여부 → 추적되면 exit 1

```bash
chmod +x scripts/check-homepage-video.sh
./scripts/check-homepage-video.sh
```

---

## 📝 변경 이력

| 날짜 | 변경 | 작성자 |
|---|---|---|
| 2026-05-21 | 초안 작성. 데모 영상 통합 시작 | yhkdw |
