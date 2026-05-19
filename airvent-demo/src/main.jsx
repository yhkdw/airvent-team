import React from 'react'
import ReactDOM from 'react-dom/client'
import { Buffer } from 'buffer'
import App from './App.jsx'
import './index.css'

// Solana / Anchor 라이브러리는 Node의 Buffer를 전역으로 사용합니다.
// 브라우저에는 없으므로 polyfill 등록.
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)