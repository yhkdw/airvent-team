import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 데모용 모듈 (Phase 4-B 신규)
import { supabase } from './lib/supabase';
import {
  connectPhantom,
  disconnectPhantom,
  tryEagerConnect,
  getPhantomProvider,
} from './lib/phantom';
import {
  fetchDeviceInfo,
  registerDevice,
  transferOwnership,
} from './lib/anchor-client';
import { PublicKey } from '@solana/web3.js';
import { useAirBalance } from './lib/useAirBalance';
import {
  DEMO_SERVER_WALLET,
  PAIRED_DEVICE_KEY,
  truncatePubkey,
  explorerAddressUrl,
  explorerTxUrl,
} from './config/chain';
import {
  Wind,
  Wifi,
  Wallet,
  Gift,
  Bell,
  ShieldCheck,
  ChevronRight,
  Leaf,
  Gauge,
  Thermometer,
  Droplets,
  MapPin,
  CheckCircle2,
  Lock,
  User,
  Smartphone,
  RefreshCw,
  Coins,
  CloudSun,
  Settings,
  BatteryCharging,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const aqTrend = [
  { t: '06', aqi: 41 },
  { t: '08', aqi: 46 },
  { t: '10', aqi: 52 },
  { t: '12', aqi: 49 },
  { t: '14', aqi: 43 },
  { t: '16', aqi: 39 },
  { t: '18', aqi: 44 },
  { t: '20', aqi: 47 },
];

const roomData = [
  {
    room: 'Living Room',
    score: 91,
    pm25: 7, pm1: 5,
    co2: 612,
    tvoc: 112,
    temp: 23.4,
    humi: 46,
    state: 'Excellent',
  },
  {
    room: 'Bedroom',
    score: 87,
    pm25: 10, pm1: 8,
    co2: 694,
    tvoc: 138,
    temp: 23.1,
    humi: 48,
    state: 'Good',
  },
  {
    room: 'Kids Room',
    score: 84,
    pm25: 12, pm1: 9,
    co2: 731,
    tvoc: 151,
    temp: 22.8,
    humi: 47,
    state: 'Good',
  },
];

const wifiList = [
  { name: 'AirVent-Node-A12', secure: true, strength: 4 },
  { name: 'Home_5G', secure: true, strength: 5 },
  { name: 'Office_Guest', secure: true, strength: 3 },
  { name: 'IoT_Lab_2.4G', secure: true, strength: 4 },
];

const navItems = [
  { key: 'login', label: 'Login', icon: User },
  { key: 'pair', label: 'Node', icon: Wifi },
  { key: 'dashboard', label: 'Dashboard', icon: Gauge },
  { key: 'wallet', label: 'Wallet', icon: Wallet },
  { key: 'reward', label: 'Reward', icon: Gift },
];

const chip = 'rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/80';
const card = 'rounded-[28px] border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-2xl shadow-black/30';

function StatusBar() {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  
  // Real-time update logic omitted for prototype simplicity
  
  return (
    <div className="flex items-center justify-between px-6 pt-4 text-[12px] font-medium text-white/90 z-50 relative">
      <span>{time}</span>
      <div className="flex items-center gap-1.5">
        <Wifi className="h-4 w-4" />
        <BatteryCharging className="h-4 w-4" />
      </div>
    </div>
  );
}

function TopHeader({ title, subtitle, right }) {
  return (
    <div className="px-6 pt-4 pb-2 z-10 relative">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <p className="text-[10px] uppercase tracking-[0.3em] font-semibold text-cyan-300/80 mb-1">AirVent DePIN</p>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-[26px] font-bold leading-tight tracking-tight text-white">{title}</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-1.5 text-[13px] text-white/60 leading-snug">{subtitle}</motion.p>
        </div>
        {right && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>{right}</motion.div>
        )}
      </div>
    </div>
  );
}

function ScoreRing({ value }) {
  const degrees = Math.max(18, Math.min(100, value)) * 3.6;
  return (
    <div className="relative h-44 w-44 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from 220deg, rgba(34,211,238,1) 0deg, rgba(56,189,248,1) ${degrees * 0.55}deg, rgba(52,211,153,1) ${degrees}deg, rgba(255,255,255,0.05) ${degrees}deg 360deg)`,
        }}
      />
      <div className="absolute inset-[14px] rounded-full bg-slate-950 flex flex-col items-center justify-center p-2 shadow-inner" />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[12px] font-medium text-white/50">Indoor Air Score</span>
        <span className="mt-0.5 text-[54px] font-bold text-white tracking-tighter">{value}</span>
        <span className="mt-1 rounded-full bg-emerald-400/20 px-3 py-1 text-[11px] font-semibold text-emerald-300">Excellent</span>
      </div>
    </div>
  );
}

function LoginScreen({ onContinue }) {
  return (
    <div className="flex h-full flex-col relative pb-8">
      <TopHeader
        title="App Login"
        subtitle="Manage your nodes and rewards securely with your AirVent account"
      />

      <div className="px-5 pt-4">
        <motion.div whileHover={{ scale: 1.02 }} className={`${card} overflow-hidden p-4`}>
          <div className="rounded-[24px] bg-gradient-to-br from-cyan-400/20 via-sky-400/10 to-emerald-400/10 p-5 ring-1 ring-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/20 blur-3xl rounded-full" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-cyan-200/80 mb-0.5">Indoor Air + Onchain Reward</p>
                <h2 className="text-[19px] font-bold text-white tracking-tight">AirVent Node Network</h2>
              </div>
              <div className="rounded-2xl bg-white/10 p-3 shadow-lg shadow-cyan-900/50 backdrop-blur-md">
                <Wind className="h-6 w-6 text-cyan-200" />
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center text-[12px] font-medium text-white/80 relative z-10">
              <div className="rounded-xl bg-black/30 px-2 py-3 ring-1 ring-white/5">Real-time IAQ</div>
              <div className="rounded-xl bg-black/30 px-2 py-3 ring-1 ring-white/5">Node Connection</div>
              <div className="rounded-xl bg-black/30 px-2 py-3 ring-1 ring-white/5">AIVT Rewards</div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-5 pt-4">
        <div className={`${card} p-5`}>
          <label className="mb-2 block text-[12px] font-medium text-white/60 pl-1">Email</label>
          <div className="mb-4 flex items-center gap-3 rounded-[20px] border border-white/5 bg-black/40 px-5 py-4 transition-colors focus-within:border-cyan-400/50 focus-within:bg-black/60">
            <User className="h-5 w-5 text-white/40" />
            <input type="email" value="ceo@airvent.ai" readOnly className="bg-transparent w-full text-[15px] text-white outline-none" />
          </div>
          
          <label className="mb-2 block text-[12px] font-medium text-white/60 pl-1">Password</label>
          <div className="flex items-center gap-3 rounded-[20px] border border-white/5 bg-black/40 px-5 py-4 transition-colors focus-within:border-cyan-400/50 focus-within:bg-black/60">
            <Lock className="h-5 w-5 text-white/40" />
            <input type="password" value="password" readOnly className="bg-transparent w-full text-[15px] tracking-[0.2em] text-white outline-none" />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-[11px] font-medium text-white/60 text-center">
            <div className="rounded-xl bg-white/5 py-3 transition hover:bg-white/10">Kakao / Google Sync</div>
            <div className="rounded-xl bg-white/5 py-3 transition hover:bg-white/10">Face ID Login</div>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onContinue}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-4 text-[15px] font-bold text-slate-950 shadow-[0_4px_20px_rgba(52,211,153,0.3)] transition-all hover:shadow-[0_4px_25px_rgba(52,211,153,0.4)]"
          >
            Login & Get Started
            <ChevronRight className="h-5 w-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// 위임 가능한 owner 화면. 본인이 디바이스 소유자일 때만 표시됨.
// 새 owner 주소를 입력하면 transferOwnership 인스트럭션을 호출.
function TransferOwnershipPanel({ deviceId, currentOwnerPubkey, onTransferred }) {
  const [expanded, setExpanded] = useState(false);
  const [newOwner, setNewOwner] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  // base58 + 32~44 길이로 PublicKey 유효성 간이 검증
  const isValidPubkey = (() => {
    if (!newOwner) return false;
    try {
      // eslint-disable-next-line no-new
      new PublicKey(newOwner);
      return true;
    } catch {
      return false;
    }
  })();

  const isSelfTransfer = isValidPubkey && currentOwnerPubkey && newOwner === currentOwnerPubkey.toBase58?.();

  const handleTransfer = async () => {
    if (!isValidPubkey || isSelfTransfer) return;
    setErr(null);
    setBusy(true);
    try {
      const sig = await transferOwnership(deviceId, newOwner);
      onTransferred?.(sig);
      setExpanded(false);
      setConfirming(false);
      setNewOwner('');
    } catch (e) {
      console.error(e);
      setErr(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-[16px] bg-emerald-500/10 border border-emerald-500/30 p-3.5">
      <div className="flex items-start gap-2 text-[12px] text-emerald-300">
        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <span>이 디바이스는 이미 내 지갑 소유입니다. "대시보드로 이동" 가능.</span>
      </div>

      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="mt-3 text-[11px] font-semibold text-white/60 hover:text-white/90 underline underline-offset-2"
        >
          ⚙️ 다른 지갑에 소유권 위임하기 (고급)
        </button>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="rounded-[12px] bg-amber-500/10 border border-amber-500/30 p-2.5 text-[11px] text-amber-200 leading-relaxed">
            ⚠️ <strong>주의</strong>: 위임 후엔 이 지갑으로 디바이스를 더 이상 관리할 수 없습니다.
            보상도 새 owner에게 지급됩니다. 신뢰할 수 있는 주소인지 반드시 확인하세요.
          </div>

          <div>
            <label className="text-[10px] font-semibold text-white/60 uppercase tracking-wider mb-1 block">
              새 Owner 주소 (Solana base58)
            </label>
            <input
              type="text"
              value={newOwner}
              onChange={(e) => { setNewOwner(e.target.value.trim()); setConfirming(false); }}
              placeholder="예: 9X8b2...K4mN"
              className={`w-full rounded-[12px] bg-black/40 border px-3 py-2.5 text-[12px] text-white font-mono focus:outline-none placeholder-white/30 ${
                newOwner === '' ? 'border-white/10' :
                isValidPubkey ? 'border-emerald-500/40' : 'border-rose-500/40'
              }`}
            />
            {newOwner !== '' && !isValidPubkey && (
              <p className="mt-1 text-[10px] text-rose-400">유효하지 않은 Solana 주소입니다.</p>
            )}
            {isSelfTransfer && (
              <p className="mt-1 text-[10px] text-amber-400">현재 지갑과 동일한 주소입니다.</p>
            )}
          </div>

          {err && (
            <div className="rounded-[12px] bg-rose-500/10 border border-rose-500/30 p-2.5 text-[11px] text-rose-300">
              ❌ {err}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => { setExpanded(false); setConfirming(false); setNewOwner(''); setErr(null); }}
              disabled={busy}
              className="flex-1 rounded-[12px] bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 text-[12px] font-semibold text-white/70 disabled:opacity-50"
            >
              취소
            </button>
            {!confirming ? (
              <button
                onClick={() => setConfirming(true)}
                disabled={!isValidPubkey || isSelfTransfer || busy}
                className="flex-1 rounded-[12px] bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 px-3 py-2 text-[12px] font-bold text-amber-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                위임 진행
              </button>
            ) : (
              <button
                onClick={handleTransfer}
                disabled={busy}
                className="flex-1 rounded-[12px] bg-rose-500 hover:bg-rose-600 px-3 py-2 text-[12px] font-bold text-white disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {busy ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    서명 대기 중…
                  </>
                ) : (
                  '⚠️ 정말 위임'
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PairScreen({
  onContinue,
  walletPubkey,
  onConnectWallet,
  pairedDeviceId,
  onPaired,
  onUnpair,
}) {
  const [deviceIdInput, setDeviceIdInput] = useState('5EBHA10001');
  const [status, setStatus] = useState('idle'); // idle | checking | already | available | pairing | error
  const [statusMsg, setStatusMsg] = useState('');
  const [txSig, setTxSig] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);

  // 입력값 변경 시 온체인 디바이스 상태 미리보기
  useEffect(() => {
    if (!deviceIdInput || deviceIdInput.length < 4) {
      setStatus('idle');
      setDeviceInfo(null);
      return;
    }
    let cancelled = false;
    setStatus('checking');
    fetchDeviceInfo(deviceIdInput)
      .then((info) => {
        if (cancelled) return;
        setDeviceInfo(info);
        if (info.exists) {
          setStatus('already');
          setStatusMsg(
            info.owner
              ? `이미 등록됨 — 소유자: ${truncatePubkey(info.owner)}`
              : '이미 등록된 디바이스입니다.'
          );
        } else {
          setStatus('available');
          setStatusMsg('등록 가능 — Phantom으로 페어링하세요.');
        }
      })
      .catch((e) => {
        if (cancelled) return;
        setStatus('error');
        setStatusMsg(`조회 실패: ${e?.message ?? e}`);
      });
    return () => { cancelled = true; };
  }, [deviceIdInput]);

  const isOwnedByMe = !!(
    walletPubkey &&
    deviceInfo?.owner &&
    deviceInfo.owner.toBase58?.() === walletPubkey.toBase58?.()
  );

  const handlePair = async () => {
    if (!walletPubkey) {
      await onConnectWallet();
      return;
    }
    setStatus('pairing');
    setStatusMsg('Phantom에서 서명을 승인해주세요…');
    try {
      const sig = await registerDevice(deviceIdInput);
      setTxSig(sig);
      setStatus('paired');
      setStatusMsg('페어링 완료! 측정값을 곧 받아옵니다.');
      onPaired?.(deviceIdInput);
    } catch (e) {
      console.error(e);
      setStatus('error');
      setStatusMsg(`페어링 실패: ${e?.message ?? e}`);
    }
  };

  const pairedStateView = pairedDeviceId && (
    <div className="px-5 pt-2">
      <div className={`${card} p-5 bg-gradient-to-b from-emerald-500/10 to-transparent`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-2xl bg-emerald-500/20 p-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-[12px] font-medium text-white/60">현재 페어링된 디바이스</p>
            <p className="text-[16px] font-bold text-white font-mono">{pairedDeviceId}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onContinue}
            className="flex-1 flex items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-3 text-[14px] font-bold text-slate-950 shadow-lg"
          >
            대시보드로 이동 <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={onUnpair}
            className="rounded-[16px] bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 text-[13px] font-semibold text-white/70"
          >
            해제
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full flex-col pb-8">
      <TopHeader
        title="Node Pairing"
        subtitle="디바이스 ID를 입력하고 Phantom으로 페어링하세요"
      />

      {pairedStateView}

      <div className="px-5 pt-3">
        <div className={`${card} p-5`}>
          <p className="text-[15px] font-semibold text-white mb-1">1. 디바이스 ID</p>
          <p className="text-[11px] text-white/50 mb-3">측정기 본체 또는 박스의 시리얼 (예: 5EBHA10001)</p>
          <input
            type="text"
            value={deviceIdInput}
            onChange={(e) => setDeviceIdInput(e.target.value.trim())}
            placeholder="5EBHA10001"
            className="w-full rounded-[16px] bg-black/40 border border-white/10 px-4 py-3 text-[15px] text-white font-mono tracking-wider focus:outline-none focus:border-cyan-400/50 placeholder-white/30"
          />
          {status !== 'idle' && (
            <div className={`mt-3 flex items-center gap-2 text-[12px] ${
              status === 'available' ? 'text-emerald-400' :
              status === 'already' ? (isOwnedByMe ? 'text-cyan-400' : 'text-amber-400') :
              status === 'paired' ? 'text-emerald-400' :
              status === 'error' ? 'text-rose-400' :
              'text-white/60'
            }`}>
              {status === 'checking' && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
              <span>{statusMsg || status}</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pt-3">
        <div className={`${card} p-5`}>
          <p className="text-[15px] font-semibold text-white mb-1">2. Phantom 지갑</p>
          <p className="text-[11px] text-white/50 mb-3">측정값 보상이 이 지갑으로 자동 지급됩니다</p>

          {walletPubkey ? (
            <div className="flex items-center justify-between rounded-[16px] bg-black/40 border border-white/10 p-3.5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-violet-500/20 p-2 border border-violet-500/30">
                  <Wallet className="h-4 w-4 text-violet-300" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-white/50">연결됨</p>
                  <p className="text-[14px] font-mono font-bold text-white">{truncatePubkey(walletPubkey)}</p>
                </div>
              </div>
              <a
                href={explorerAddressUrl(walletPubkey)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300"
              >
                Explorer ↗
              </a>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onConnectWallet}
              className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/40 px-4 py-3.5 text-[14px] font-bold text-violet-200"
            >
              <Wallet className="h-4 w-4" />
              Phantom 연결
            </motion.button>
          )}
        </div>
      </div>

      <div className="px-5 pt-3">
        <div className={`${card} p-5`}>
          <p className="text-[15px] font-semibold text-white mb-1">3. 페어링</p>
          <p className="text-[11px] text-white/50 mb-3">register_device 인스트럭션을 호출해 온체인에 소유권을 등록</p>

          {isOwnedByMe ? (
            <TransferOwnershipPanel
              deviceId={deviceIdInput}
              currentOwnerPubkey={walletPubkey}
              onTransferred={(sig) => {
                setTxSig(sig);
                setStatus('paired');
                setStatusMsg('소유권 위임 완료 — 이제 다른 지갑 소유입니다.');
                // 페어링 해제 (더 이상 내 디바이스 아님)
                onUnpair?.();
              }}
            />
          ) : status === 'already' ? (
            <div className="rounded-[16px] bg-amber-500/10 border border-amber-500/30 p-3.5 text-[12px] text-amber-300">
              ⚠️ 다른 사용자가 먼저 등록한 디바이스입니다. 본인 디바이스가 맞다면 기존 소유자가 transfer_ownership 해줘야 합니다.
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handlePair}
              disabled={status === 'pairing' || status === 'checking'}
              className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-white px-4 py-3.5 text-[14px] font-bold text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'pairing' ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  서명 대기 중…
                </>
              ) : !walletPubkey ? (
                'Phantom 연결 후 페어링'
              ) : status === 'available' ? (
                <>register_device 호출 <ChevronRight className="h-4 w-4" /></>
              ) : (
                '디바이스 ID 확인 중…'
              )}
            </motion.button>
          )}

          {txSig && (
            <a
              href={explorerTxUrl(txSig)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-mono"
            >
              Tx: {txSig.slice(0, 8)}…{txSig.slice(-6)} ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ item, index }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      className="rounded-[24px] border border-white/5 bg-white/5 p-4 hover:bg-white/[0.07] transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center ring-1 ring-white/10">
            <span className="text-[11px] font-semibold">{item.room.charAt(0)}</span>
          </div>
          <div>
            <p className="text-[14px] font-bold text-white">{item.room}</p>
            <p className="text-[11px] text-white/50">Synced Real-time</p>
          </div>
        </div>
        <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-400 tracking-wide border border-emerald-500/20">{item.state}</div>
      </div>
      <div className="grid grid-cols-5 gap-2 text-[13px]">
        <div className="rounded-[16px] bg-black/40 p-2.5 flex flex-col items-center justify-center relative overflow-hidden ">
          <div className="flex items-center gap-1 text-[10px] text-white/50 mb-1"><Leaf className="h-3 w-3" />PM1.0</div>
          <p className="text-[16px] font-bold text-white">{item.pm1}</p>
        </div>
        <div className="rounded-[16px] bg-black/40 p-2.5 flex flex-col items-center justify-center relative ">
          <div className="flex items-center gap-1 text-[10px] text-white/50 mb-1"><Leaf className="h-3 w-3" />PM2.5</div>
          <p className="text-[16px] font-bold text-white">{item.pm25}</p>

        </div>
        <div className="rounded-[16px] bg-black/40 p-2.5 flex flex-col items-center justify-center relative ">
          <div className="flex items-center gap-1 text-[10px] text-white/50 mb-1"><Wind className="h-3 w-3" />CO₂</div>
          <p className="text-[16px] font-bold text-white">{item.co2}</p>
        </div>
        <div className="rounded-[16px] bg-black/40 p-2.5 flex flex-col items-center justify-center ">
          <div className="flex items-center gap-1 text-[10px] text-white/50 mb-1"><Thermometer className="h-3 w-3" />Temp</div>
          <p className="text-[16px] font-bold text-white">{item.temp}°</p>
        </div>
        <div className="rounded-[16px] bg-black/40 p-2.5 flex flex-col items-center justify-center ">
          <div className="flex items-center gap-1 text-[10px] text-white/50 mb-1"><Droplets className="h-3 w-3" />Hum</div>
          <p className="text-[16px] font-bold text-white">{item.humi}%</p>
        </div>
      </div>
    </motion.div>
  );
}

function DashboardScreen({ rooms, trend, goWallet }) {
  const mainScore = rooms[0]?.score || 91;
  return (
    <div className="flex h-full flex-col pb-8">
      <TopHeader
        title="Air Quality Status"
        subtitle="Real-time metrics and patterns across all nodes"
        right={
          <div className="relative rounded-full bg-white/10 p-2.5 text-white/80 hover:bg-white/20 transition cursor-pointer backdrop-blur-md border border-white/5">
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900"></span>
            <Bell className="h-5 w-5" />
          </div>
        }
      />

      <div className="px-5 pt-2">
        <motion.div whileHover={{ scale: 1.01 }} className={`${card} overflow-hidden p-5 flex items-center justify-between gap-6`}>
          <ScoreRing value={mainScore} />
          <div className="flex-1 space-y-3">
            <div className="rounded-[20px] bg-white/5 p-3.5 border border-white/5">
              <div className="flex items-center gap-2 text-[11px] font-medium text-white/60 mb-1.5"><Gauge className="h-3.5 w-3.5 text-cyan-300" /> Integrated Score</div>
              <p className="text-[22px] font-bold text-white tracking-tight">{mainScore} <span className="text-[13px] text-white/40 font-medium">/ 100</span></p>
            </div>
            <div className="rounded-[20px] bg-white/5 p-3.5 border border-white/5">
              <div className="flex items-center gap-2 text-[11px] font-medium text-white/60 mb-1.5"><CloudSun className="h-3.5 w-3.5 text-amber-300" /> Outdoor Comparison</div>
              <p className="text-[13px] font-semibold text-white leading-tight">Compared to outdoor, <span className="text-emerald-400">31%</span> more stable</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-5 pt-4">
        <div className={`${card} p-5`}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[15px] font-bold text-white">IAQ Trend Forecast</p>
              <p className="text-[11px] text-white/50 mt-0.5">Based on live telemetry</p>
            </div>
            <div className="rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-400 tracking-wider">Stable Zone</div>
          </div>
          <div className="h-[140px] w-full -ml-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillAqi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(34,211,238,0.4)" stopOpacity={1} />
                    <stop offset="100%" stopColor="rgba(34,211,238,0.0)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="t" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                  itemStyle={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="aqi" stroke="rgba(34,211,238,1)" fill="url(#fillAqi)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="px-5 pt-4">
        <div className={`${card} p-5`}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[15px] font-bold text-white">Active Node Locations</p>
              <p className="text-[11px] text-white/50 mt-0.5">3 devices are online</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1.5 border border-white/5">
              <MapPin className="h-3 w-3 text-cyan-300" />
              <span className="text-[11px] font-medium text-white">Bucheon Home</span>
            </div>
          </div>
          <div className="space-y-3">
            {rooms.map((item, index) => (
              <DashboardCard key={item.room} item={item} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WalletScreen({
  tokenBalance,
  onContinue,
  rooms,
  walletPubkey,
  onConnectWallet,
  onDisconnectWallet,
}) {
  // Calculate dynamic today's reward based on live room air quality score and 3 nodes
  const mainScore = rooms[0]?.score || 91;
  const todayReward = (mainScore * 3 * 0.148).toFixed(1);

  const isConnected = !!walletPubkey;

  return (
    <div className="flex h-full flex-col pb-8">
      <TopHeader
        title="Web3 Wallet Pairing"
        subtitle="Set up your Solana wallet to receive rewards"
      />

      <div className="px-5 pt-2">
        <div className={`${card} p-5 bg-gradient-to-b from-violet-500/10 to-transparent`}>
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-violet-500/20 p-3.5 border border-violet-500/30 shadow-lg shadow-violet-500/20">
              <Wallet className="h-6 w-6 text-violet-300" />
            </div>
            <div>
              <p className="text-[16px] font-bold text-white">
                {isConnected ? 'Phantom Connected' : 'Wallet Not Connected'}
              </p>
              <p className="text-[12px] text-white/60 mt-0.5">
                {isConnected ? '연결된 지갑으로 보상 자동 수령' : '데모 서버 지갑 잔액을 표시 중입니다'}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-[20px] bg-black/40 p-4 border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-white/50">Solana Devnet</p>
              <p className="mt-1 text-[15px] font-mono font-bold text-white tracking-wider">
                {isConnected ? truncatePubkey(walletPubkey, 6, 6) : '데모 fallback'}
              </p>
              {isConnected && (
                <a
                  href={explorerAddressUrl(walletPubkey)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition"
                >
                  View on Solana Explorer
                  <span className="text-[9px]">↗</span>
                </a>
              )}
            </div>
            <ShieldCheck className={`h-6 w-6 ${isConnected ? 'text-emerald-400' : 'text-white/30'}`} />
          </div>

          {isConnected ? (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onDisconnectWallet}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-[20px] bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3.5 text-[13px] font-semibold text-white/70"
            >
              연결 해제
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onConnectWallet}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-[20px] bg-white px-4 py-4 text-[15px] font-bold text-slate-900 shadow-xl"
            >
              Phantom 연결
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          )}
        </div>
      </div>

      <div className="px-5 pt-4">
        <div className={`${card} p-5`}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[15px] font-bold text-white">Estimated Rewards</p>
              <p className="text-[11px] text-white/50 mt-0.5">3 Active Nodes · 98% Data Quality</p>
            </div>
            <div className="rounded-full bg-amber-500/10 p-2 border border-amber-500/20">
              <Coins className="h-4 w-4 text-amber-400" />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-[20px] bg-black/30 border border-white/5 p-4 flex flex-col items-center justify-center">
              <p className="text-[11px] font-medium text-white/50 mb-1">Today</p>
              <p className="text-[20px] font-bold text-white">{todayReward}</p>
              <p className="text-[10px] font-bold text-cyan-300 mt-0.5 tracking-wider">AIVT</p>
            </div>
            <div className="rounded-[20px] bg-black/30 border border-white/5 p-4 flex flex-col items-center justify-center">
              <p className="text-[11px] font-medium text-white/50 mb-1">Total Onchain</p>
              <p className="text-[20px] font-bold text-white">{tokenBalance !== null ? tokenBalance.toFixed(1) : "---"}</p>
              <p className="text-[10px] font-bold text-cyan-300 mt-0.5 tracking-wider">AIVT</p>
            </div>
            <div className="rounded-[20px] bg-emerald-500/10 border border-emerald-500/20 p-4 flex flex-col items-center justify-center">
              <p className="text-[11px] font-medium text-emerald-200/70 mb-1">Quality Bonus</p>
              <p className="text-[20px] font-bold text-emerald-400">+14%</p>
              <p className="text-[10px] font-bold text-emerald-300/70 mt-0.5">Gold Tier</p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onContinue}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-[20px] border border-violet-500/30 bg-violet-500/15 px-4 py-4 text-[14px] font-bold text-violet-200 transition hover:bg-violet-500/25"
          >
            View Reward Policy Details
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function RewardScreen({ tokenBalance, rooms }) {
  const [autoClaim, setAutoClaim] = useState(true);
  const [dataShare, setDataShare] = useState(true);
  const [zone, setZone] = useState('Indoor data + Outdoor Comp');

  // Calculate dynamic projected monthly total based on live room air quality score
  const mainScore = rooms[0]?.score || 91;
  const estMonthly = Math.floor(mainScore * 3 * 4.45);

  return (
    <div className="flex h-full flex-col pb-8">
      <TopHeader
        title="Reward Management"
        subtitle="Policy settings and real-time claims"
      />

      <div className="px-5 pt-2">
        <div className={`${card} p-1 overflow-hidden`}>
          <div className="rounded-[24px] bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-transparent p-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-[12px] font-medium text-white/70">Est. Monthly Total</p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
                <Sparkles className="h-3 w-3" />Stable Zone
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[36px] font-bold text-white tracking-tighter leading-none">{estMonthly.toLocaleString()}</p>
                <p className="text-[13px] font-medium text-cyan-300 mt-2">AIVT Tokens</p>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 flex items-center justify-center">
                 <span className="text-[10px] font-bold text-white">95%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pt-4">
        <div className={`${card} p-5`}>
          <p className="mb-4 text-[15px] font-bold text-white">Automation & Policies</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-[20px] bg-black/30 border border-white/5 px-4 py-3.5">
              <div>
                <p className="text-[14px] font-bold text-white">Auto Claim</p>
                <p className="text-[11px] text-white/50 mt-0.5">Transfer to wallet at 100 AIVT</p>
              </div>
              <button
                onClick={() => setAutoClaim(!autoClaim)}
                className={`relative h-7 w-12 rounded-full transition-colors duration-300 ${autoClaim ? 'bg-emerald-500' : 'bg-white/20'}`}
              >
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform duration-300 ${autoClaim ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between rounded-[20px] bg-black/30 border border-white/5 px-4 py-3.5">
              <div>
                <p className="text-[14px] font-bold text-white">Anonymous Data Sharing</p>
                <p className="text-[11px] text-white/50 mt-0.5">Quality bonus (up to 15%) applied</p>
              </div>
              <button
                onClick={() => setDataShare(!dataShare)}
                className={`relative h-7 w-12 rounded-full transition-colors duration-300 ${dataShare ? 'bg-cyan-500' : 'bg-white/20'}`}
              >
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform duration-300 ${dataShare ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-[20px] bg-black/40 border border-white/5 p-4">
            <p className="text-[11px] font-medium text-white/50 mb-3">Data Privacy Level</p>
            <div className="flex flex-wrap gap-2">
              {['Indoor + Outdoor', 'Indoor Summary', 'No Sharing'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setZone(opt)}
                  className={`rounded-xl px-3.5 py-2 text-[12px] font-semibold transition ${zone === opt ? 'bg-cyan-400 text-slate-900 shadow-md' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pt-4">
        <div className={`${card} p-5 border-cyan-500/20 bg-cyan-500/5`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[15px] font-bold text-white">Claimable Quantity</p>
              <p className="text-[11px] text-cyan-300/70 mt-0.5">Fee-free · Sponsored Transaction</p>
            </div>
            <Gift className="h-6 w-6 text-cyan-400" />
          </div>
          <div className="flex items-end justify-between border-b border-white/5 pb-4 mb-4">
             <span className="text-[28px] font-bold text-white tracking-tight">{(mainScore * 0.15).toFixed(2)}</span>
             <span className="text-[13px] font-medium text-cyan-300 mb-2">AIVT</span>
          </div>
          <motion.button 
            whileTap={{ scale: 0.96 }}
            className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-4 text-[15px] font-bold text-slate-950 shadow-lg shadow-cyan-500/20"
          >
            Execute Instant Claim
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default function AirVentDePINApp() {
  const [screen, setScreen] = useState('login');
  const [rooms, setRooms] = useState(roomData);
  const [trend, setTrend] = useState(aqTrend);

  // Phase 4-B: Phantom 지갑 연결 상태 + 페어링한 device_id
  const [walletPubkey, setWalletPubkey] = useState(null);
  const [pairedDeviceId, setPairedDeviceId] = useState(() => {
    try {
      return localStorage.getItem(PAIRED_DEVICE_KEY) || null;
    } catch {
      return null;
    }
  });

  // 페이지 로드 시 Phantom 자동 재연결 시도 (사용자가 한 번 connect 했었으면)
  useEffect(() => {
    tryEagerConnect().then((pk) => {
      if (pk) setWalletPubkey(pk);
    });
    const provider = getPhantomProvider();
    if (!provider) return;
    const onConnect = (pk) => setWalletPubkey(pk);
    const onDisconnect = () => setWalletPubkey(null);
    provider.on?.('connect', onConnect);
    provider.on?.('disconnect', onDisconnect);
    return () => {
      provider.off?.('connect', onConnect);
      provider.off?.('disconnect', onDisconnect);
    };
  }, []);

  // 연결된 지갑의 AIR 잔액 (없으면 데모 서버 지갑으로 fallback)
  const balanceOwner = walletPubkey ?? DEMO_SERVER_WALLET;
  const { balance: tokenBalance } = useAirBalance(balanceOwner);

  // Fetch Supabase sensor readings and subscribe to live changes
  // 페어링한 device_id 가 있으면 그 디바이스만 필터링.
  useEffect(() => {
    let isMounted = true;

    const loadTelemetry = async () => {
      let query = supabase
        .from('sensor_readings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);
      if (pairedDeviceId) {
        query = query.eq('device_id', pairedDeviceId);
      }
      const { data, error } = await query;

      if (error) {
        console.error("Failed to fetch historical telemetry for Seeker app:", error);
        return;
      }

      if (data && isMounted) {
        // Take the latest record to populate the "Living Room"
        const latest = data[0];
        const livingScore = Math.max(25, 100 - Math.floor(latest.pm2_5 * 1.5) - Math.floor(Math.max(0, latest.co2 - 400) / 20));
        const livingState = livingScore > 90 ? 'Excellent' : livingScore > 75 ? 'Good' : 'Moderate';

        const updatedRooms = [
          {
            room: 'Living Room',
            score: livingScore,
            pm25: latest.pm2_5,
            pm1: latest.pm1_0,
            co2: latest.co2,
            tvoc: latest.voc || 112,
            temp: latest.temperature,
            humi: latest.humidity,
            state: livingState,
          },
          ...roomData.slice(1) // Keep Bedroom and Kids Room as high-fidelity references
        ];
        setRooms(updatedRooms);

        // Populate trend line chart based on historical PM2.5 readings
        const historicalTrend = data.map((row) => {
          const date = new Date(row.created_at);
          const score = Math.max(25, 100 - Math.floor(row.pm2_5 * 1.5) - Math.floor(Math.max(0, row.co2 - 400) / 20));
          return {
            t: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            aqi: score
          };
        }).reverse();
        setTrend(historicalTrend);
      }
    };

    loadTelemetry();

    // Subscribe to live insert notifications (페어링된 device_id 필터 적용)
    const channel = supabase
      .channel('public:sensor_readings:seekermobile')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'sensor_readings',
        ...(pairedDeviceId ? { filter: `device_id=eq.${pairedDeviceId}` } : {}),
      }, (payload) => {
        if (!isMounted) return;
        const latest = payload.new;
        const livingScore = Math.max(25, 100 - Math.floor(latest.pm2_5 * 1.5) - Math.floor(Math.max(0, latest.co2 - 400) / 20));
        const livingState = livingScore > 90 ? 'Excellent' : livingScore > 75 ? 'Good' : 'Moderate';

        setRooms(prev => [
          {
            room: 'Living Room',
            score: livingScore,
            pm25: latest.pm2_5,
            pm1: latest.pm1_0,
            co2: latest.co2,
            tvoc: latest.voc || 112,
            temp: latest.temperature,
            humi: latest.humidity,
            state: livingState,
          },
          ...prev.slice(1)
        ]);

        const date = new Date(latest.created_at);
        setTrend(prev => {
          const newPoint = {
            t: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            aqi: livingScore
          };
          const nextTrend = [...prev, newPoint];
          if (nextTrend.length > 8) nextTrend.shift();
          return nextTrend;
        });
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [pairedDeviceId]);

  // Phantom 연결/해제 핸들러 (자식 컴포넌트에 전달)
  const handleConnectWallet = async () => {
    try {
      const pk = await connectPhantom();
      setWalletPubkey(pk);
    } catch (e) {
      console.error('Phantom 연결 실패:', e);
      alert(e?.message ?? 'Phantom 연결에 실패했습니다.');
    }
  };

  const handleDisconnectWallet = async () => {
    await disconnectPhantom();
    setWalletPubkey(null);
  };

  // 페어링 완료 핸들러 (PairScreen에서 register_device 성공 시 호출)
  const handlePairedDevice = (deviceId) => {
    try {
      localStorage.setItem(PAIRED_DEVICE_KEY, deviceId);
    } catch {}
    setPairedDeviceId(deviceId);
  };

  const handleUnpair = () => {
    try {
      localStorage.removeItem(PAIRED_DEVICE_KEY);
    } catch {}
    setPairedDeviceId(null);
  };

  const Screen = () => {
    switch (screen) {
      case 'login': return <LoginScreen onContinue={() => setScreen('pair')} />;
      case 'pair': return (
        <PairScreen
          onContinue={() => setScreen('dashboard')}
          walletPubkey={walletPubkey}
          onConnectWallet={handleConnectWallet}
          pairedDeviceId={pairedDeviceId}
          onPaired={handlePairedDevice}
          onUnpair={handleUnpair}
        />
      );
      case 'dashboard': return <DashboardScreen rooms={rooms} trend={trend} goWallet={() => setScreen('wallet')} />;
      case 'wallet': return (
        <WalletScreen
          tokenBalance={tokenBalance}
          onContinue={() => setScreen('reward')}
          rooms={rooms}
          walletPubkey={walletPubkey}
          onConnectWallet={handleConnectWallet}
          onDisconnectWallet={handleDisconnectWallet}
        />
      );
      case 'reward': return <RewardScreen tokenBalance={tokenBalance} rooms={rooms} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white md:p-8 flex items-center justify-center relative">
      <a href="/" className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-full backdrop-blur-md transition border border-white/10 z-[100] shadow-lg">
        <ChevronLeft className="h-4 w-4" />
        <span className="text-[13px] font-bold tracking-wide">Back to Website</span>
      </a>

      <div className="w-full max-w-[1200px] grid grid-cols-1 md:grid-cols-[400px_minmax(0,1fr)] gap-10 items-center drop-shadow-2xl pt-20 md:pt-0">
        
        {/* Phone Frame */}
        <div className="mx-auto w-full max-w-[400px] perspective-1000">
          <div className="relative rounded-[50px] border-[6px] border-slate-800 bg-black p-1 shadow-[0_50px_100px_rgba(0,0,0,0.8),inset_0_0_10px_rgba(255,255,255,0.1)] before:absolute before:inset-0 before:rounded-[44px] before:ring-1 before:ring-white/20">
            {/* Dynamic Island Notch */}
            <div className="absolute left-1/2 top-3 z-50 h-7 w-32 -translate-x-1/2 rounded-full bg-black shadow-[inset_0_0_5px_rgba(255,255,255,0.1)]" />
            
            <div className="relative h-[850px] overflow-hidden rounded-[42px] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.15),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(52,211,153,0.1),transparent_40%),linear-gradient(180deg,#040f25_0%,#020617_50%,#040f25_100%)]">
              <StatusBar />
              
              <div className="h-full overflow-y-auto hide-scrollbar pb-32">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={screen}
                    initial={{ opacity: 0, scale: 0.96, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 1.04, filter: 'blur(4px)' }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <Screen />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom Nav */}
              <div className="absolute inset-x-0 bottom-0 bg-black/60 pt-4 pb-8 px-5 backdrop-blur-2xl border-t border-white/5">
                <div className="flex justify-between items-center px-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = screen === item.key || (item.key === 'dashboard' && screen === 'pair');
                    return (
                      <button
                        key={item.key}
                        onClick={() => setScreen(item.key)}
                        className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative px-3 ${
                          active ? 'text-cyan-400' : 'text-white/40 hover:text-white/70'
                        }`}
                      >
                        {active && (
                          <motion.div layoutId="navIndicator" className="absolute -top-4 w-10 h-1 bg-cyan-400 rounded-b-full drop-shadow-[0_2px_5px_rgba(34,211,238,0.5)]" />
                        )}
                        <Icon className={`h-6 w-6 ${active && 'drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]'}`} strokeWidth={active ? 2.5 : 2} />
                        <span className="text-[10px] font-bold">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Presentation Context Side */}
        <div className="hidden md:flex flex-col justify-center px-8">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="mb-6 flex flex-wrap gap-2">
              <div className={chip}>Vite + React (Tailwind v4)</div>
              <div className={chip}>Framer Motion Transitions</div>
              <div className={chip}>Premium UX</div>
            </div>

            <h2 className="text-[42px] font-black tracking-tight text-white leading-tight">AirVent DePIN<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Mobile Concept Demo</span></h2>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxted text-white/70 font-medium">
              A visually refined, natural-feeling mobile application prototype. Features buttery smooth transitions, dynamic glassmorphism layered styling, hidden scrollbars, and an integrated dynamic island to perfectly emulate a native mobile experience down to the finest detail.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-5">
               <div className="rounded-[24px] bg-white/5 border border-white/10 p-6 backdrop-blur-md hover:bg-white/10 transition">
                  <Wind className="h-8 w-8 text-cyan-400 mb-4" />
                  <h3 className="text-xl font-bold text-white">IAQ Dashboard</h3>
                  <p className="text-sm text-white/50 mt-2">Real-time room monitoring with beautiful area charts and precise environmental metrics.</p>
               </div>
               <div className="rounded-[24px] bg-white/5 border border-white/10 p-6 backdrop-blur-md hover:bg-white/10 transition">
                  <Wallet className="h-8 w-8 text-violet-400 mb-4" />
                  <h3 className="text-xl font-bold text-white">Web3 Integrated</h3>
                  <p className="text-sm text-white/50 mt-2">Seamless automated claims and Solana-based Phantom wallet integration flows.</p>
               </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}