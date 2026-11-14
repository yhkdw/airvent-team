# AIRVENT → 블록하우스 MQTT 실시간 중계 (SSE)

상태: GitHub 구현 완료 / Oracle 서버 직접 배포 전 / 실센서 송신 검증 전

## 작동 구조

스마트라인 센서 → Oracle Mosquitto MQTT 1883
- 기존 airvent-ingest → Supabase: 그대로 유지
- 신규 airvent-realtime → SSE (로컬 127.0.0.1:3108) → Nginx HTTPS 443 → 블록하우스 대시보드

중요: 센서가 현재 약 60초마다 송신한다면 읽기 이벤트도 약 60초마다 도착합니다.
실시간 중계는 서버의 조회 주기 지연을 제거할 뿐, 센서가 1초마다 신규 값을 생성하도록 바꾸지 않습니다.
SSE 15초 heartbeat는 상태 유지용이고 새 측정값이 아닙니다.

## 구현 파일

- airvent-realtime/server.cjs: MQTT topic 구독 후 수신 즉시 SSE reading 이벤트 전달
- airvent-realtime/token.cjs: HMAC-SHA256 60초 유효 서명 토큰
- airvent-realtime/token.test.cjs: 서명 발급/검증 테스트
- airvent-realtime/airvent-realtime.service: 신규 systemd 서비스
- airvent-realtime/relay.env.example: Oracle 설정 예시
- airvent-realtime/nginx/airvent-stream-location.conf: 기존 nginx 443 서버 내부에 넣을 설정
- airvent-realtime/nginx/airvent-stream-443.conf.example: 443 서버가 전혀 없을 때 참고할 독립 예시
- api/airvent/stream-token.js: AIRVENT Vercel에서 블록하우스 백엔드용 단기 토큰 발급

## 배포 전 필수 조건

1. 기존 Oracle MQTT(1883)/브리지/Supabase가 정상 동작하는지 확인합니다.
2. Oracle에서 node --version 실행: v20 이상 필요.
3. 기존 인증서 /etc/letsencrypt/live/mqtt.airvent.ai/fullchain.pem 존재 여부 확인.
4. nginx 설치/현재 443 설정 확인: sudo nginx -T. 기존 설정을 덮어쓰면 안 됩니다.
5. Oracle Cloud Security List 또는 NSG에 외부 HTTPS TCP 443 허용. 3108은 외부 개방 금지.
6. AIRVENT Vercel 환경변수 두 개를 등록하고 새 프로덕션 배포:
   AIRVENT_PARTNER_API_KEY = 블록하우스 전용 난수 (64자리 hex 권장)
   AIRVENT_STREAM_SIGNING_KEY = Oracle과 동일한 별도 64자리 hex
7. 브라우저의 접속 Origin은 https://aero-fire.vercel.app 으로 제한됩니다.
8. 계정/비밀번호/키는 채팅이나 GitHub에 올리지 않습니다.

## 맥북에서 파일 전송 (PR 코드 받아온 뒤)

맥북에 해당 브랜치를 clone하거나 최신 코드를 받은 후 아래와 같이 전송:

    scp -i ~/Downloads/ssh-key-2026-11-02.key -r ./airvent-realtime ubuntu@140.238.58.39:/home/ubuntu/
    ssh -i ~/Downloads/ssh-key-2026-11-02.key ubuntu@140.238.58.39

Oracle에 접속했으면 다음 명령을 순서대로 실행:

    node --version
    command -v node
    sudo install -d -m 755 /opt/airvent-realtime
    sudo cp -a ~/airvent-realtime/. /opt/airvent-realtime/
    sudo npm --prefix /opt/airvent-realtime install --omit=dev --ignore-scripts
    cd /opt/airvent-realtime
    npm test
    sudo useradd --system --no-create-home --shell /usr/sbin/nologin airventrelay || true
    sudo chown -R root:root /opt/airvent-realtime
    sudo chmod -R a+rX /opt/airvent-realtime
    sudo install -d -m 700 /etc/airvent-realtime
    sudo cp /opt/airvent-realtime/relay.env.example /etc/airvent-realtime/relay.env
    sudo chmod 600 /etc/airvent-realtime/relay.env
    sudo nano /etc/airvent-realtime/relay.env

relay.env의 AIRVENT_STREAM_SIGNING_KEY는 Vercel과 반드시 똑같아야 합니다.
한 번의 생성 예: openssl rand -hex 32
MQTT_USERNAME/MQTT_PASSWORD는 기존 1883 계정을 사용하며, 이미 운영 중인 .env를 수정하지 않습니다.
systemd EnvironmentFile은 dotenv와 문법이 다릅니다. 비밀번호에 특수문자나 #가 있으면 적절히 큰따옴표로 감싸세요.

    sudo cp /opt/airvent-realtime/airvent-realtime.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable --now airvent-realtime
    sudo systemctl status airvent-realtime --no-pager
    sudo journalctl -u airvent-realtime -n 50 --no-pager
    curl -sS http://127.0.0.1:3108/healthz

service 파일의 ExecStart는 /usr/bin/node를 사용합니다. command -v node가 다른 위치를 출력하면
서비스를 실행하기 전에 ExecStart를 해당 절대경로로 수정하세요.

healthz 예: {"ok":true,"mqtt_connected":true,"devices":1}

## Nginx 연결 (진행 전에 기존 설정 검토 필수)

    sudo nginx -T
    sudo ss -lntp | grep ':443'
    sudo ls -l /etc/letsencrypt/live/mqtt.airvent.ai/fullchain.pem
    sudo ls -l /etc/letsencrypt/live/mqtt.airvent.ai/privkey.pem

- 현재 mqtt.airvent.ai의 443 SSL 서버가 있다면 nginx/airvent-stream-location.conf의 location 내용만 그 서버 블록 안에 추가하세요.
- 443 SSL 서버가 없다면 nginx/airvent-stream-443.conf.example을 참고하여 독립적인 SSL 서버 블록을 생성하세요.
- 기존 Nginx, Mosquitto 1883/8883, certbot 자동갱신 설정을 지우거나 덮어쓰지 않습니다.
- stream URL에는 짧은 서명 토큰이 포함되므로 해당 Nginx location은 access_log off 입니다.
- SSE proxy_buffering off 이 중요합니다.

설정 확인 후에만:

    sudo nginx -t
    sudo systemctl reload nginx

Oracle Cloud 443 Ingress 규칙이 허용돼야 외부에서 연결됩니다.
Certbot 갱신 후 Nginx 인증서 다시 읽기 작업이 필요할 수 있습니다.

## AIRVENT API

GET https://airvent.ai/api/airvent/stream-token?device_id=5EBHA10001
- 요청 헤더: X-API-Key: 비공개 AIRVENT_PARTNER_API_KEY
- 블록하우스 백엔드에서만 호출. 브라우저나 Antigravity 프런트 코드에 키를 넣지 않음.
- 응답: success, device_id, expires_at, url, reconnect_after_seconds (600)

GET https://mqtt.airvent.ai/v1/air-quality/stream?device_id=...&token=...
- 응답: text/event-stream (SSE)
- event: status → MQTT 연결 상태
- event: reading → 실제 MQTT 수신값
- : heartbeat → 측정값이 아닌 연결유지 주석
- 10분 뒤 스트림 종료. 새 접속 URL을 발급받아 연결 필요.
- 새 토큰 URL은 60초 안에 최초 접속해야 합니다.

읽기 이벤트 필드: device_id, vendor_id, timestamp, received_at,
timestamp_source, device_timestamp, stale, pm1_0, pm2_5, pm10,
co2, temperature, humidity, voc.

## 블록하우스 Next.js 백엔드 예제

예를 들어 Aero Fire 서버 API route에서 로그인한 사용자에게만 URL을 전달합니다.

    const r = await fetch(
      'https://airvent.ai/api/airvent/stream-token?device_id=5EBHA10001',
      {headers: {'X-API-Key': process.env.AIRVENT_PARTNER_API_KEY},cache:'no-store'}
    );
    if (!r.ok) throw new Error('AIRVENT token error ' + r.status);
    const {url} = await r.json();
    return Response.json({url},{headers:{'Cache-Control':'no-store'}});

블록하우스 브라우저에서는 아래 동작 구현:
- 블록하우스 자체 백엔드로 /api/airvent/stream-session 요청
- 받은 URL을 EventSource로 열기
- reading 이벤트의 JSON을 화면에 반영
- 연결 종료·오류 발생 시 기존 EventSource.close() 후 새 토큰을 받아 재연결
- 페이지 종료 시 EventSource.close()를 실행

예시:

    async function connectAirvent() {
      const response = await fetch('/api/airvent/stream-session', {cache:'no-store'});
      if (!response.ok) throw new Error('Token endpoint error');
      const {url} = await response.json();
      const stream = new EventSource(url);
      stream.addEventListener('reading', e => {
        const reading = JSON.parse(e.data);
        console.log(reading);
      });
      stream.onerror = () => {
        stream.close();
        setTimeout(() => connectAirvent().catch(console.error), 3000);
      };
      return stream;
    }

사이트 공개 범위에 맞는 블록하우스 사용자 인증·rate limit 추가 필요.
서명 URL을 분석 로그·콘솔 로그·스크린샷에 노출하지 마세요.

## 검증

- npm test 성공 여부
- Oracle healthz MQTT_connected=true
- AIRVENT stream-token 미인증 요청은 401
- 올바른 인증에서 토큰 URL 발급
- 새 토큰으로 curl -N URL 실행 시 SSE 연결
- 실제 센서 송신 때 event: reading 수신
- 기존 pm2 logs airvent-ingest 에 계속 Stored 로그
- AIRVENT 대시보드 기존 그래프 정상 갱신
- 블록하우스 실시간 화면 값과 타임스탬프 확인

실제 스트림 배포, Nginx 443 방화벽, 비밀키 설정, 블록하우스 화면 수정은 아직 수행되지 않았습니다.
