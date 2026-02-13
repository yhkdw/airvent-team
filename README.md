# AirVent MVP Demo (데모 우선 구현)

의존성 없이 바로 실행 가능한 단일 서버 데모입니다.

## 기능
- 웹 UI(`/`)에서 증명 제출 및 보상 조회
- `POST /api/proofs`: `miner`, `ts`, `hash32`, `sig` 수신
- 데모용 서명 검증 후 보상 큐 등록
- `GET /api/rewards`: 누적 보상 목록 반환

## 실행
```bash
npm start
```

접속: `http://localhost:3000`

## API 예시
```bash
curl -X POST http://localhost:3000/api/proofs \
  -H 'Content-Type: application/json' \
  -d '{"miner":"DemoMiner","ts":1730000000000,"hash32":"abc123","sig":"signature-demo"}'

curl http://localhost:3000/api/rewards
```

## 메모
- 저장소는 메모리 기반이라 서버 재시작 시 초기화됩니다.
- `memoIx`는 Solana Memo Program ID 형태를 흉내 내는 데모 구현입니다.
