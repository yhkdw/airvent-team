# v1.3.4 Release Notes

## Manual QA checklist
- [ ] Homepage 렌더링 정상
- [ ] Dashboard 진입 정상
- [ ] Public Explorer: 검색/필터/노드 선택 정상
- [ ] Wallet connect/disconnect 정상
- [ ] Ops: 사이트/메트릭 변경 시 차트/테이블 갱신 정상
- [ ] Personal: 내 디바이스/리워드/CSV export 정상
- [ ] CSV newline: CRLF/LF 전환 후 export 결과 확인
- [ ] 콘솔 self-tests: __airvent.runSelfTests() 모두 PASS

## Known limitations
- 외부 지도 SDK 없이 간단한 SVG 맵으로 구현됨
- 위치는 프라이버시 보존을 위해 근사치(지터) 표시
