# AIRVENT Oracle MQTT → Supabase 데이터 업로드 복구

## 확인된 시스템
- 제조사 센서: `5EBHA10001`
- Oracle Broker: `mqtt.airvent.ai:1883` (현재 시험용, TLS 미사용)
- Topic: `env/SML001/5EBHA10001/data`
- 웹 대시보드: Supabase `sensor_readings` 테이블을 조회하고 INSERT를 구독
- 기존 `dashboard/bridge/index.ts`는 Supabase 저장 **및 Solana 제출**을 함께 처리함
- 기존 Naver Cloud `airvent-db` 운영 절차는 `docs/ops/airvent-db-bridge-runbook.md`에 기록

## 복구 순서: 먼저 읽기 전용 진단
1. Supabase SQL Editor에서 아래 SQL로 최근 업로드 시각을 확인.
2. 기존 Naver Cloud `airvent-db`의 `pm2 list`, `pm2 logs airvent-bridge --lines 60`을 확인.
3. 기존 서버의 `MQTT_HOST`가 이전 브로커를 가리키면 새로운 Oracle Broker와 일치하지 않을 수 있음.
4. 중복 업로드를 막기 위해 기존 Bridge와 새 ingest를 **동시에** 수집기로 구동하지 말 것.
5. 기존 서버의 비밀값은 채팅/로그/리포지토리에 붙여 넣지 말 것.

```sql
select device_id, created_at, created_at at time zone 'Asia/Seoul' as kst,
       pm1_0, pm2_5, pm10, temperature, humidity, co2, voc
from public.sensor_readings
where device_id = '5EBHA10001'
order by created_at desc
limit 10;
```

## 독립 데이터 수집기 (Solana 연결 없이 동작)
`dashboard/bridge/ingest.ts`는 MQTT를 구독하고 다음 절차를 수행.
- Topic과 Device ID를 검증
- JSON 숫자 문자열을 실수로 변환
- **센서 timestamp 대신 서버 수신 시간을 created_at에 저장**
- `dashboard/bridge/spool/`에 측정값을 먼저 기록
- Supabase 오류가 발생하면 파일을 보관하고 5초마다 재시도
- 서비스 재시작 시 기존 spool 파일을 재전송

참고: spool 기록은 프로세스 crash 대비 단순 복구용이며, 완전한 exactly-once 전달이나 장기 데이터 보관이 아님. 재시도/중복 처리에 대한 데이터베이스 고유 인덱스가 아직 없어 운영 전 추가 검증 필요. `MAX_SPOOL_FILES`는 5000으로 제한되므로 디스크와 미전송 건수를 감시.

## Oracle 서버 적용 전 확인
기존 서버에서 실행 중인 Bridge를 종료하는 것이 맞는지 확인한 뒤에만 새 서비스를 시작.
Oracle 서버에 `/opt/airvent-team` Git 저장소, Node.js, npm, PM2 및 Supabase 관리자 키가 있는지 먼저 확인할 것.
**현재 실제 Oracle 서버에는 배포하지 않았음.**

```bash
# Oracle Ubuntu terminal
node -v
npm -v
pm2 list
test -d /opt/airvent-team && echo "repository present" || echo "repository not installed"
```

필요 시 브랜치를 별도로 설치하거나 승인된 변경을 main에 반영한 후:
```bash
cd /opt/airvent-team/dashboard/bridge
npm install
cp -n .env.example .env
chmod 600 .env
# .env를 편집: 아래 예시 참조 (실제 시크릿은 서버에만 입력)
```

```dotenv
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_SIDE_SERVICE_KEY
MQTT_HOST=mqtt://127.0.0.1:1883
MQTT_USERNAME=airvent_broker
MQTT_PASSWORD=YOUR_EXISTING_MQTT_PASSWORD
MQTT_TOPIC=env/SML001/+/data
DEVICE_ID=5EBHA10001
```

Oracle Mosquitto를 같은 서버에서 구독할 경우 `127.0.0.1:1883`을 사용함. 외부 1883 공개는 이 서버 내 Bridge 구동에 **필요 없음**.

```bash
# First manually verify; stop with Ctrl+C
npm exec -- ts-node -T ingest.ts
# After log confirmation, process manager setup (when authorized)
pm2 start ecosystem.ingest.config.cjs
pm2 save
pm2 logs airvent-ingest --lines 50
```

`systemctl status pm2-ubuntu` 등 실제 PM2 자동 시작 설정도 점검할 것.

## 대시보드 확인
- `useSensorRealtime`: 초기 Supabase SELECT + INSERT Realtime + 60초 폴링/탭 복귀 갱신
- `AirQualityTab`: 기존 60분 시계열 데이터 SELECT + Realtime + 60초 갱신
- `OverviewTab`: 실제로는 노드 1대이므로 공간 선택에 따라 가상 배율을 적용하지 않음
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_DEMO_DEVICE_ID`가 현재 Supabase 프로젝트 및 노드와 일치하는지 Vercel 설정 확인
- Supabase RLS SELECT 권한이 해당 화면의 로그인 인증 방식과 일치하는지 확인
- Realtime을 사용한다면 `public.sensor_readings`에 대한 publication 설정 확인

## 데이터 품질/운영
- `timestamp`는 기기 원본으로 남길 수 있으나 `created_at`은 항상 서버 수신 시각 사용
- 값이 없는 경우 0으로 날조하지 않고 유효성 검사 실패를 기록
- VOC의 단위는 제조사 스펙 확인 전까지 임의 표기 금지
- 센서 연결이 끊겼는데 마지막 값만 보이지 않도록 최종 수신 시각과 오프라인 배지를 운영 UI에 추가 권장
- TLS 1883 전체 인터넷 개방은 즉시 운영 전 검토: 가능하면 8883 + CA 인증으로 전환하거나 1883은 loopback만 사용

## 아직 확인할 사항
- 실제 Supabase 프로젝트의 최근 쓰기 성공 시각
- 기존 `airvent-db` 서비스 실행 여부
- Oracle VM에 Node.js 및 PM2가 설치되어 있는지
- 실제 Vercel 배포가 어느 브랜치/리포지토리를 사용하는지
- Solana 온체인 제출 재개 여부는 별도 검증 및 운영 의사결정 필요
