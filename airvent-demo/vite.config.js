import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/demo/",
  // Solana 라이브러리들이 Buffer 전역을 요구합니다.
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  resolve: {
    alias: {
      // @coral-xyz/anchor 가 내부적으로 Buffer를 사용
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    include: ['buffer'],
    esbuildOptions: {
      // anchor 의 BigInt 의존성 인식
      target: 'es2020',
    },
  },
  // 모노레포 루트의 /idl 디렉토리에서 IDL JSON import 허용
  // (Vite는 기본적으로 프로젝트 루트 밖 파일을 허용하지만 명시적으로 fs.allow 설정)
  server: {
    fs: {
      allow: ['..'],
    },
  },
})