# AIRVENT 대시보드 SSE 실시간 표시 / 1분 기록 분리 — 단계적 적용

## 목표와 구현 경계

- 화면: 기존 Supabase 1분 히스토리와 별도로 Oracle MQTT → SSE `reading` 이벤트를 수신 즉시 KPI에 표시
- 저장: 센서가 5초 간격 MQTT를 발행하게 되면 기존 Oracle `airvent-ingest`에서 60초 **UTC 수신 시각 창당 평균 1건**만 Supabase `sensor_readings`에 기록
- 현재 센서는 실제로 약 **60~63초마다** 새 MQTT 패킷을 보내고 있음. SSE 도입만으로 5초 간격의 새로운 측정값이 생성되지 않음
- 기존 Mosquitto 1883, Oracle `airvent-ingest`, Supabase 스키마는 이 PR로 **수정하거나 재시작하지 않음**
- 센서 펌웨어 원본과 현재 Oracle에서 실행 중인 `airvent-ingest`의 실행 파일/소스는 이 GitHub 저장소에 없으므로 펌웨어 5초 전송과 실제 DB 저장 정책 전환은 **미적용** 상태

## GitHub 변경

1. `dashboard/src/hooks/useAirventStream.ts`: JWT로 단기 SSE URL 발급, MQTT `reading` 이벤트 즉시 반영, 180초 이상 신규 패킷 없으면 실시간 표시 중지, 재연결 및 세션 정리
2. `api/airvent/dashboard-stream-token.js`: 로그인한 Supabase 사용자의 JWT를 `/auth/v1/user`에서 검증한 뒤 서명된 60초 접속 토큰 발급. **시연용 노드 5EBHA10001로만 허용** (다른 실물 노드는 소유권/RLS 확인 구현 전 금지)
3. `dashboard/src/hooks/useSensorRealtime.ts`: SSE가 현재 살아 있으면 SSE를 우선 표시, 끊기면 기존 Supabase INSERT 구독 및 30초 조회로 자동 폴백
4. `dashboard/src/pages/dashboard/{OverviewTab,AirQualityTab}.tsx`: 실제 KPI, 마지막 데이터 시각, 상태 표시. 그래프/RAW 데이터는 그대로 Supabase 기록 사용. 단일 센서의 공간별 임의 배수 조정 제거
5. `airvent-realtime/server.cjs`: 블록하우스 외 `https://airvent.ai` 등의 Origin 허용 가능. Origin은 CORS 제한일 뿐 인증 대체 수단이 아니며 서명된 토큰 요구 사항은 유지
6. `ingestion/minute-window.cjs`: Oracle 기존 ingest에 통합할 수 있는 1분 창 평균 계산기. **자체 저장·MQTT 구독 없음**. `node --test ingestion/minute-window.test.cjs`

## 배포 전 테스트 순서 (중요)

### 1. 웹 대시보드: 코드는 feature flag OFF가 기본값

`VITE_AIRVENT_SSE_ENABLED`가 `true`가 아니면 **현재 Supabase 방식 그대로** 동작합니다.
PR의 Preview Vercel 빌드가 통과하고, Production 환경의 `AIRVENT_STREAM_SIGNING_KEY`가 Oracle 키와 동일한지 확인한 후에만 진행합니다.

### 2. Oracle 릴레이 CORS 설정 변경 — 기존 서비스 유지

실제 서비스 접속 후 현재 파일을 백업하고 신규 `airvent-realtime/server.cjs`만 적용합니다.

```bash
# Mac, 저장소의 변경 사항을 clone/pull 한 뒤
scp -i ~/Downloads/ssh-key-2026-11-02.key ./airvent-realtime/server.cjs ubuntu@140.238.58.39:/home/ubuntu/server.cjs
ssh -i ~/Downloads/ssh-key-2026-11-02.key ubuntu@140.238.58.39
# Oracle
sudo cp /opt/airvent-realtime/server.cjs /opt/airvent-realtime/server.cjs.backup-20261114
sudo cp /home/ubuntu/server.cjs /opt/airvent-realtime/server.cjs
sudo node --check /opt/airvent-realtime/server.cjs
sudo systemctl restart airvent-realtime
sudo systemctl is-active airvent-realtime
curl -fsS http://127.0.0.1:3108/healthz
```

기존 `/etc/airvent-realtime/relay.env`에 `AIRVENT_CORS_ORIGINS`가 이미 있다면 `https://airvent.ai`를 쉼표로 추가해야 합니다. 없으면 기본 허용 목록에 포함됩니다. 기존 `AIRVENT_CORS_ORIGIN=https://aero-fire.vercel.app`는 그대로 둡니다. Nginx/Mosquitto/PM2는 변경하지 않습니다.

Oracle SSE 오류가 발생하면 **릴레이만** 백업 파일로 돌린 다음 `systemctl restart airvent-realtime` 하세요. 기존 MQTT 수집 브리지에는 영향이 없어야 합니다.

### 3. Vercel 환경변수 + 배포

AIRVENT의 실제 Production 프로젝트 `airvent-team`에 다음 설정 후 새 Production 배포:
- `AIRVENT_STREAM_SIGNING_KEY`: Oracle 기존 키와 동일한 Secret. 이미 설정돼 있다면 수정하지 않음
- `VITE_AIRVENT_SSE_ENABLED=true`: 프런트 SSE 표시를 활성화하는 빌드 플래그
- 브라우저에는 `AIRVENT_PARTNER_API_KEY`나 서명 비밀키를 **절대 제공하지 않음**

확인:
- 로그인하지 않은 `GET https://airvent.ai/api/airvent/dashboard-stream-token?device_id=5EBHA10001` → **401**
- 로그인한 대시보드 → SSE reading 수신 시 **MQTT 실시간 수신**, 최신 PM/CO₂/온습도 KPI 변경
- SSE 10분 만료/인터넷 끊김 → 인증 토큰 재발급 및 자동 재연결, 그동안 기존 DB 데이터로 폴백
- 기존 블록하우스 `X-API-Key` 스트림도 변경 없이 유지

### 4. Oracle 1분 DB 저장 전환 — 운영 소스 확인 필요

현재 `airvent-ingest`가 MQTT마다 Supabase INSERT를 한다면 센서 송신을 5초로 바꾸기 전에 이 코드를 통합해야 합니다.

`ingestion/minute-window.cjs`의 `MinuteAggregator`는 **실측 MQTT 패킷을 모으고 월/일이 아닌 UTC 분 경계로 평균**을 산출합니다. 운영 ingest에 통합할 때는 다음과 같은 방식이 필요합니다.

```js
const { MinuteAggregator } = require('./minute-window.cjs');
const minute = new MinuteAggregator();
// 기존 MQTT message 이벤트의 packet 파싱과 검증 뒤:
minute.add({device_id: deviceId, ...packet}, Date.now());
// 단일 비동기 writer 루프에서 5~10초마다:
for (const item of minute.ready(Date.now())) {
  const { error } = await supabase.from('sensor_readings').insert(item.row);
  if (!error) minute.confirm(item.device_id, item.minute_start);
}
```

위 코드는 **통합 예시**입니다. 기존 운영 수집 코드의 Supabase 클라이언트, 인증, 장애 복구, 보관 스키마를 확인하기 전에는 그대로 실행하거나 별도 MQTT 수집기를 추가하지 마세요. 중복 INSERT 가능성이 있습니다.

정확한 '1분당 단 1행' 보장이 필요하면 별도 `minute_start` 컬럼 + `UNIQUE(device_id, minute_start)` 또는 별도 원자적 upsert를 준비해야 합니다. 현 `sensor_readings`의 DDL/RLS를 확인하지 않은 상태라 스키마 변경은 이 PR에 포함하지 않았습니다. 저장 장애에 대한 영속 큐/재시도 설계도 필수입니다.

### 5. 센서 펌웨어 5초 측정/발행

현물 센서 펌웨어 개발자가 5초 전송 가능 여부, 각 PM·CO₂·TVOC 센서의 내부 측정 갱신율, 전원/네트워크 부하를 확인해야 합니다. **5초 MQTT 발행만 해도 센서 내부 측정이 60초면 값은 실제 60초 간격으로만 달라질 수 있습니다.** 전환 전 원래의 ~1분 발행 방식으로 운영합니다.

## 합격 기준

- 실제 센서 1대로 화면 'MQTT 실시간 수신'과 마지막 수신 시각이 실제 패킷마다 변화
- 60초 저장 기록 그래프가 기존 그대로 표시
- 중계 끊김에도 기존 DB 기록 표시; 복구 시 자동 재연결
- DB 1분 저장 전환 전후 24시간 데이터 손실·중복·급증이 없는지 운영 로그 대조
- 블록하우스 연동과 Oracle 기존 수집 서비스에 회귀 장애 없음

**현 상태:** 소스 변경/검증용 PR만 제공. Oracle 실서비스와 센서 펌웨어, Supabase 실제 저장 정책은 변경 전입니다.
