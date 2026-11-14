import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { AirPoint } from '../types/air';

export type StreamState = 'disabled' | 'connecting' | 'live' | 'reconnecting';
type LiveReading = AirPoint & { source: 'sse' };
const ENABLED = import.meta.env.VITE_AIRVENT_SSE_ENABLED === 'true';
const MAX_SILENCE_MS = 180_000; // Sensor currently publishes approximately once per minute.

function readNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function mapStreamReading(raw: any, deviceId: string): LiveReading | null {
  if (!raw || raw.device_id !== deviceId || raw.stale) return null;
  const time = Date.parse(raw.received_at || raw.timestamp);
  if (!Number.isFinite(time) || time > Date.now() + 300_000) return null;
  const values = [raw.pm1_0, raw.pm2_5, raw.pm10, raw.co2, raw.temperature, raw.humidity, raw.voc].map(readNumber);
  // Don't treat malformed / incomplete packets as zero-valued valid measurements.
  if (values.some(value => value === null)) return null;
  return {
    ts: new Date(time).toISOString(),
    pm1: values[0]!, pm25: values[1]!, pm10: values[2]!,
    co2: values[3]!, temp: values[4]!, hum: values[5]!, voc: values[6]!,
    source: 'sse',
  };
}

/**
 * A real MQTT reading appears as soon as the Oracle relay publishes it.
 * This hook never writes measurements to Supabase. Database/history paths
 * remain independent so realtime UI can't increase persisted row counts.
 */
export function useAirventStream(deviceId: string) {
  const [reading, setReading] = useState<LiveReading | null>(null);
  const [connection, setConnection] = useState<StreamState>(ENABLED ? 'connecting' : 'disabled');
  const [lastReceivedAt, setLastReceivedAt] = useState<string | null>(null);
  const [clock, setClock] = useState(Date.now());

  useEffect(() => {
    if (!ENABLED) return;
    let stopped = false;
    let stream: EventSource | null = null;
    let retryTimer: number | undefined;
    let failures = 0;
    const heartbeat = window.setInterval(() => setClock(Date.now()), 15_000);

    const cleanup = () => {
      stream?.close();
      stream = null;
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
      retryTimer = undefined;
    };
    const scheduleRetry = () => {
      if (stopped) return;
      cleanup();
      setConnection('reconnecting');
      const delay = Math.min(30_000, 3_000 * Math.pow(2, Math.min(failures++, 4)));
      retryTimer = window.setTimeout(connect, delay);
    };
    const connect = async () => {
      if (stopped) return;
      cleanup();
      setConnection(failures ? 'reconnecting' : 'connecting');
      try {
        // Supabase SDK refreshes expired sessions as needed.
        const { data: { session }, error } = await supabase.auth.getSession();
        if (stopped) return;
        if (error || !session?.access_token) return scheduleRetry();
        const response = await fetch('/api/airvent/dashboard-stream-token?device_id=' + encodeURIComponent(deviceId), {
          headers: { Authorization: 'Bearer ' + session.access_token },
          cache: 'no-store',
        });
        if (stopped) return;
        if (!response.ok) return scheduleRetry();
        const payload = await response.json();
        if (stopped || payload.success !== true || typeof payload.url !== 'string') return scheduleRetry();
        const parsed = new URL(payload.url);
        if (parsed.origin !== 'https://mqtt.airvent.ai' || parsed.pathname !== '/v1/air-quality/stream') {
          return scheduleRetry();
        }
        const next = new EventSource(payload.url);
        stream = next;
        next.addEventListener('reading', (event) => {
          if (stopped || next !== stream) return;
          try {
            const raw = JSON.parse((event as MessageEvent).data);
            const point = mapStreamReading(raw, deviceId);
            if (!point) return;
            setReading(point);
            setLastReceivedAt(point.ts);
            setClock(Date.now());
            failures = 0;
            setConnection('live');
          } catch {
            // Ignore malformed messages, never replace valid readings with zeroes.
          }
        });
        next.addEventListener('status', (event) => {
          if (stopped || next !== stream) return;
          try {
            const { mqtt_connected } = JSON.parse((event as MessageEvent).data);
            if (!mqtt_connected) setConnection('reconnecting');
          } catch { /* Ignore invalid status packets. */ }
        });
        next.onerror = () => {
          if (!stopped && next === stream) scheduleRetry();
        };
      } catch {
        scheduleRetry();
      }
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible' && !stopped && !stream) {
        if (retryTimer !== undefined) window.clearTimeout(retryTimer);
        retryTimer = undefined;
        void connect();
      }
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        cleanup();
        setConnection('reconnecting');
        setReading(null);
      }
    });
    document.addEventListener('visibilitychange', onVisible);
    void connect();

    return () => {
      stopped = true;
      cleanup();
      subscription.unsubscribe();
      window.clearInterval(heartbeat);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [deviceId]);

  const isFresh = !!lastReceivedAt && clock - Date.parse(lastReceivedAt) <= MAX_SILENCE_MS;
  return {
    latest: ENABLED && isFresh && connection === 'live' ? reading : null,
    connection: ENABLED && connection === 'live' && !isFresh ? 'reconnecting' as StreamState : connection,
    lastReceivedAt,
  };
}
