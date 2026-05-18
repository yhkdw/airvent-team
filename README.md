<div align="center">
  <img src="https://raw.githubusercontent.com/yhkdw/airvent-team/main/dashboard/public/airvent-logo-v3.png" alt="AirVent Logo" width="200" />

  # AirVent DePIN
  **Solana-Powered Hyperlocal Air Quality Network**

  [![Solana](https://img.shields.io/badge/Solana-DePIN-14F195?logo=solana&logoColor=black)](https://solana.com/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Version](https://img.shields.io/badge/version-v1.6.0-emerald.svg)]()
</div>

<br/>

**AirVent** is a Decentralized Physical Infrastructure Network (DePIN) of IoT sensors measuring hyperlocal air quality (PM1.0, PM2.5, PM10, CO2, VOCs, Temperature, and Humidity). Node operators securely transmit environmental data and are rewarded with **$AIR** tokens on the Solana blockchain for contributing high-quality data to the global network.

*한국어 요약: AirVent는 대기오염 및 실내 공기질 데이터를 실시간으로 측정하는 IoT 센서 네트워크입니다. 센서 기여자는 양질의 환경 데이터를 제공하는 대가로 Solana 스마트 컨트랙트를 통해 토큰 리워드($AIR)를 분배받는 DePIN 생태계입니다.*

---

## 🏗 Architecture & Data Flow

AirVent is built with a robust, scalable, and decentralized architecture, ensuring data integrity from the physical sensor all the way to the blockchain.

1. **IoT Sensor Node (Hardware)** 🌬️
   - Captures high-precision environmental metrics every 15 seconds.
   - Securely transmits data payloads via MQTT to the central broker.
2. **Bridge Service (Node.js)** 🌉
   - Subscribes to real-time MQTT data streams (`env/SML001/+/data`).
   - Deduplicates and caches data in **Supabase** (PostgreSQL) for fast frontend retrieval.
   - Calls the `submitData` instruction on the **Solana Smart Contract** (`B4m1ENS6SWV3H6mZkJ2VFkBKawqYe7atH4AjXoc4NZzR`), triggering on-chain records and reward distribution.
3. **Solana Smart Contract (Rust/Anchor)** ⛓️
   - Manages device registry, ownership proofs, and active status.
   - Verifies incoming data submissions and automatically distributes $AIR token rewards to the node operator's associated token account.
4. **React Dashboard (Vite)** 📊
   - **Real-time Monitoring**: Visualizes air quality metrics instantly via Supabase Realtime subscriptions.
   - **100% Decentralized On-Chain Viewer**: Uses `@solana/web3.js` to fetch recent transaction signatures directly from the Solana RPC, displaying a live audit log of data submissions on the dashboard.

---

## 🛠 Tech Stack

- **Frontend**: React, Vite, TailwindCSS, `@solana/web3.js`, `lucide-react`
- **Bridge Backend**: Node.js, TypeScript, MQTT.js, Supabase JS Client, `@coral-xyz/anchor`
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Blockchain**: Solana, Rust, Anchor Framework, SPL Token Program

---

## 🚀 Getting Started (Local Development)

Developers and contributors can easily run the entire platform locally to view real-time data ingestion and Solana blockchain interactions.

### 1. Clone the Repository
```bash
git clone https://github.com/yhkdw/airvent-team.git
cd airvent-team
```

### 2. Run the Bridge Service (Data Ingestion)
The Bridge service connects to the physical IoT sensors and the Solana blockchain. *(Note: Requires a valid `.env` file with Supabase credentials and a funded Solana local wallet).*
```bash
cd dashboard/bridge
npm install
npm start
```
*Expected Output:*
```log
🚀 Starting AirVent Bridge Service...
🔑 Server Wallet: GUyFB5q...
✅ MQTT Connected to broker.
📡 Subscribed to data topic: env/SML001/+/data
📥 Received data from 5EBHA10001
🗄️ Saved to Supabase: 5EBHA10001 [PM2.5: 14]
🔗 Submitted to Solana: 4Ftc2nXvDvYkW1VFtucQwL...
```

### 3. Run the Frontend Dashboard
The dashboard visualizes the data and the Solana on-chain transactions.
```bash
# Open a new terminal tab
cd dashboard
npm install
npm run dev
```
Navigate to `http://localhost:5176` in your browser. 
Go to the **Rewards** tab and scroll to the bottom to see the **Live On-Chain Records** fetching directly from the Solana Devnet!

---

## 🔗 Links & Resources

- **Solana Smart Contract**: [Devnet Explorer (`B4m1ENS6SWV3H6mZkJ2VFkBKawqYe7atH4AjXoc4NZzR`)](https://explorer.solana.com/address/B4m1ENS6SWV3H6mZkJ2VFkBKawqYe7atH4AjXoc4NZzR?cluster=devnet)
- **Token Mint ($AIR)**: [Devnet Explorer (`BXV4ewBjMB1qmXjU3bc14SfXHQbseFhRy5xE4RtHtvsL`)](https://explorer.solana.com/address/BXV4ewBjMB1qmXjU3bc14SfXHQbseFhRy5xE4RtHtvsL?cluster=devnet)

---

<div align="center">
  <i>Built for the future of decentralized environmental monitoring.</i>
</div>
