#!/bin/bash
# AirVent Dashboard Demo 자동 실행 스크립트

echo "🚀 AirVent 대시보드 데모를 준비 중입니다..."

# 1. dashboard 폴더로 이동
cd dashboard || { echo "❌ dashboard 폴더를 찾을 수 없습니다."; exit 1; }

# 2. 패키지 설치 확인 및 실행
if [ ! -d "node_modules" ]; then
    echo "📦 필요한 패키지들을 설치합니다 (최초 1회)..."
    npm install
fi

echo "✨ 데모를 실행합니다! 잠시 후 우측 하단에 뜨는 'Open in Browser' 버튼을 눌러주세요."
npm run dev
