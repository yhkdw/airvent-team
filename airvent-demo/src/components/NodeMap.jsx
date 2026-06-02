import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Radio } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AIR_MINT } from '../config/chain';

/**
 * NodeMap — 에어벤트 노드 위치를 실제 지도에 표시하는 컴포넌트.
 *
 * - Leaflet 을 CDN 으로 동적 로드 (번들/플러그인 설정 불필요).
 * - 노드 좌표는 Supabase `devices` 테이블(latitude/longitude)에서 우선 조회,
 *   없으면 데모 샘플 노드로 폴백.
 * - 마커 색상은 PM2.5 등급(좋음/보통/나쁨)에 따라 브랜드 색으로 표시.
 *
 * 브랜드 컬러: AirVent Blue #3065A2 / Green #00B428 / Navy #2B2445
 */

// AQ 등급 → 브랜드 색상
const GOOD = '#00B428';
const MOD = '#f1c40f';
const BAD = '#e74c3c';
function grade(pm) {
  if (pm == null) return [GOOD, 'Measuring'];
  if (pm <= 15) return [GOOD, 'Good'];
  if (pm <= 35) return [MOD, 'Moderate'];
  return [BAD, 'Unhealthy'];
}

// 데모 폴백 노드 (서울·인천) — 실제 좌표 확보 전까지 사용
const SAMPLE_NODES = [
  { device_id: '5EBHA10001', label: 'Yeoksam, Gangnam', latitude: 37.5006, longitude: 127.0364, pm2_5: 7, co2: 400, temperature: 28.5, humidity: 38.6 },
  { device_id: '5EBHA10002', label: 'Hapjeong, Mapo', latitude: 37.5495, longitude: 126.9138, pm2_5: 23, co2: 620, temperature: 24.1, humidity: 51.2 },
  { device_id: '5EBHA10003', label: 'Jamsil, Songpa', latitude: 37.5133, longitude: 127.1000, pm2_5: 48, co2: 910, temperature: 26.8, humidity: 44.0 },
  { device_id: '5EBHA10004', label: 'Anguk, Jongno', latitude: 37.5760, longitude: 126.9852, pm2_5: 12, co2: 520, temperature: 25.3, humidity: 40.7 },
  { device_id: '5EBHA10005', label: 'Yeouido, Yeongdeungpo', latitude: 37.5219, longitude: 126.9245, pm2_5: 35, co2: 740, temperature: 27.0, humidity: 48.9 },
  { device_id: '5EBHA10006', label: 'Songdo, Incheon', latitude: 37.3897, longitude: 126.6433, pm2_5: 18, co2: 560, temperature: 23.4, humidity: 55.1 },
];

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

function loadLeaflet() {
  return new Promise((resolve, reject) => {
    if (window.L) return resolve(window.L);
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }
    const existing = document.querySelector(`script[src="${LEAFLET_JS}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.L));
      existing.addEventListener('error', reject);
      return;
    }
    const s = document.createElement('script');
    s.src = LEAFLET_JS;
    s.async = true;
    s.onload = () => resolve(window.L);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export default function NodeMap({ pairedDeviceId }) {
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const [nodes, setNodes] = useState(SAMPLE_NODES);
  const [ready, setReady] = useState(false);

  // Supabase devices 테이블에서 위치가 있는 노드 조회 (없으면 샘플 유지)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('devices')
          .select('device_id, label, latitude, longitude, pm2_5, co2, temperature, humidity')
          .not('latitude', 'is', null);
        if (!error && data && data.length && mounted) {
          setNodes(data);
        }
      } catch (_) { /* 폴백 유지 */ }
    })();
    return () => { mounted = false; };
  }, []);

  // 지도 초기화
  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then((L) => {
      if (cancelled || !mapEl.current || mapRef.current) return;
      const map = L.map(mapEl.current, { zoomControl: false, attributionControl: false }).setView([37.52, 126.99], 11);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
      mapRef.current = map;
      setReady(true);
      setTimeout(() => map.invalidateSize(), 200);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // 마커 렌더링/갱신
  useEffect(() => {
    const L = window.L;
    const map = mapRef.current;
    if (!L || !map || !ready) return;

    const seen = new Set();
    nodes.forEach((n) => {
      if (n.latitude == null || n.longitude == null) return;
      seen.add(n.device_id);
      const [color, txt] = grade(n.pm2_5);
      const isPaired = pairedDeviceId && n.device_id === pairedDeviceId;
      const html = `<div style="width:${isPaired ? 24 : 20}px;height:${isPaired ? 24 : 20}px;border-radius:50%;background:${color};border:3px solid ${isPaired ? '#3065A2' : '#fff'};box-shadow:0 0 0 2px rgba(0,0,0,.4),0 4px 10px rgba(0,0,0,.5)"></div>`;
      const icon = L.divIcon({ className: '', html, iconSize: [20, 20], iconAnchor: [10, 10] });
      const popup = `
        <div style="font-family:inherit;min-width:170px">
          <div style="font-weight:700;font-size:13px;color:#2B2445;display:flex;align-items:center;gap:6px">
            <span style="width:9px;height:9px;border-radius:50%;background:${color};display:inline-block"></span>${n.device_id}${isPaired ? ' ⭐' : ''}
          </div>
          <div style="color:#6b7280;font-size:11px;margin:2px 0 7px">${n.label || 'Unknown location'}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 10px;font-size:12px;color:#2B2445">
            <div>PM2.5 <b style="color:#3065A2">${n.pm2_5 ?? '-'}</b> ${txt}</div>
            <div>CO₂ <b style="color:#3065A2">${n.co2 ?? '-'}</b></div>
            <div> Temp <b style="color:#3065A2">${n.temperature ?? '-'}°</b></div>
            <div> Humidity <b style="color:#3065A2">${n.humidity ?? '-'}%</b></div>
          </div>
          <a href="https://solscan.io/account/${AIR_MINT}?cluster=devnet" target="_blank" rel="noopener noreferrer"
             style="display:inline-block;margin-top:8px;font-size:11px;color:#3065A2;font-weight:700;text-decoration:none">⛓️ View on Solscan ↗</a>
        </div>`;
      if (markersRef.current[n.device_id]) {
        markersRef.current[n.device_id].setIcon(icon).setPopupContent(popup);
      } else {
        markersRef.current[n.device_id] = L.marker([n.latitude, n.longitude], { icon }).addTo(map).bindPopup(popup);
      }
    });
    // 사라진 마커 제거
    Object.keys(markersRef.current).forEach((id) => {
      if (!seen.has(id)) { map.removeLayer(markersRef.current[id]); delete markersRef.current[id]; }
    });
  }, [nodes, ready, pairedDeviceId]);

  const online = nodes.filter((n) => n.latitude != null).length;

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div>
          <p className="text-[15px] font-bold text-slate-900 flex items-center gap-1.5">
            <Radio className="h-4 w-4 text-[#00B428]" /> Node Network Map
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">{online} nodes online · Live air quality</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1.5 border border-slate-200">
          <MapPin className="h-3 w-3 text-[#4a86c8]" />
          <span className="text-[11px] font-medium text-slate-900">Seoul · Incheon</span>
        </div>
      </div>
      <div ref={mapEl} style={{ height: 220, width: '100%', background: '#eef2f7' }} />
      {/* 범례 */}
      <div className="flex items-center gap-4 px-4 py-3 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: GOOD }} /> Good</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: MOD }} /> Moderate</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: BAD }} /> Unhealthy</span>
        <span className="ml-auto flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: '#3065A2', background: GOOD }} /> My node</span>
      </div>
    </div>
  );
}
