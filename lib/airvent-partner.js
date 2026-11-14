/**
 * AIRVENT partner API (read-only).
 * Uses the same Supabase anon/RLS read path as the public AIRVENT dashboard.
 * Never place MQTT credentials or a Supabase service_role key in partner APIs.
 */
import { timingSafeEqual } from 'node:crypto';

const DEFAULT_DEVICE_ID = '5EBHA10001';
const VALID_DEVICE_ID = /^[A-Za-z0-9_-]{1,64}$/;
const SELECT_FIELDS = 'device_id,created_at,pm1_0,pm2_5,pm10,temperature,humidity,co2,voc';
const FRESHNESS_MS = 5 * 60 * 1000;

export function allowedDeviceIds() {
  const configured = process.env.AIRVENT_ALLOWED_DEVICE_IDS || DEFAULT_DEVICE_ID;
  return [...new Set(configured.split(',').map((id) => id.trim()).filter((id) => VALID_DEVICE_ID.test(id)))];
}

export function json(res, code, body) {
  return res.status(code).json(body);
}

function isValidKey(presented, configured) {
  if (typeof presented !== 'string' || typeof configured !== 'string') return false;
  const left = Buffer.from(presented);
  const right = Buffer.from(configured);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function withPartnerAuth(req, res, run) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return json(res, 405, { success: false, error: 'method_not_allowed' });
  }

  const expectedKey = process.env.AIRVENT_PARTNER_API_KEY;
  if (!expectedKey || expectedKey.length < 32) {
    console.error('[AIRVENT API] AIRVENT_PARTNER_API_KEY is not configured');
    return json(res, 503, { success: false, error: 'service_not_configured' });
  }

  const submittedKey = req.headers['x-api-key'];
  if (!isValidKey(submittedKey, expectedKey)) {
    return json(res, 401, { success: false, error: 'unauthorized' });
  }

  try {
    return await run();
  } catch (error) {
    console.error('[AIRVENT API] Read-only query failed:', error?.message || 'unknown');
    return json(res, 502, { success: false, error: 'data_source_unavailable' });
  }
}

function singleQueryValue(req, name) {
  const value = req.query?.[name];
  return typeof value === 'string' ? value : undefined;
}

export function getDeviceId(req, res) {
  const raw = req.query?.device_id;
  const deviceId = raw === undefined ? DEFAULT_DEVICE_ID : singleQueryValue(req, 'device_id');
  if (!deviceId || !VALID_DEVICE_ID.test(deviceId)) {
    json(res, 400, { success: false, error: 'invalid_device_id' });
    return null;
  }
  if (!allowedDeviceIds().includes(deviceId)) {
    json(res, 404, { success: false, error: 'device_not_available' });
    return null;
  }
  return deviceId;
}

export function getBoundedInteger(req, res, name, fallback, min, max) {
  const raw = req.query?.[name];
  if (raw === undefined) return fallback;
  if (typeof raw !== 'string' || !/^[0-9]+$/.test(raw)) {
    json(res, 400, { success: false, error: 'invalid_' + name });
    return null;
  }
  const parsed = Number(raw);
  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) {
    json(res, 400, { success: false, error: 'invalid_' + name });
    return null;
  }
  return parsed;
}

export async function querySensorReadings(deviceId, { limit = 1, hours } = {}) {
  // VITE_ variables already exist in the current AIRVENT deployment.
  // Optional AIRVENT_ variables let an operator use separate server-side values.
  const baseUrl = process.env.AIRVENT_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.AIRVENT_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!baseUrl || !anonKey) throw new Error('Supabase read-only configuration missing');

  const url = new URL(baseUrl.replace(/\/+$/, '') + '/rest/v1/sensor_readings');
  url.searchParams.set('select', SELECT_FIELDS);
  url.searchParams.set('device_id', 'eq.' + deviceId);
  url.searchParams.set('order', 'created_at.desc');
  url.searchParams.set('limit', String(limit));
  // Allow the same five-minute clock-drift grace as the AIRVENT dashboard.
  const latestAllowedTime = new Date(Date.now() + FRESHNESS_MS).toISOString();
  url.searchParams.append('created_at', 'lte.' + latestAllowedTime);
  if (hours !== undefined) {
    const earliestTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    url.searchParams.append('created_at', 'gte.' + earliestTime);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: anonKey,
        Authorization: 'Bearer ' + anonKey,
        Accept: 'application/json',
      },
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('Supabase REST HTTP ' + response.status);
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error('Unexpected Supabase response');
    return rows;
  } finally {
    clearTimeout(timer);
  }
}

function numericOrNull(value) {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function serializeSensorReading(row) {
  const parsedTime = Date.parse(row.created_at);
  const timestamp = Number.isFinite(parsedTime) ? new Date(parsedTime).toISOString() : null;
  const ageMs = Date.now() - parsedTime;
  const stale = !Number.isFinite(parsedTime) || ageMs > FRESHNESS_MS || ageMs < -FRESHNESS_MS;
  return {
    device_id: row.device_id,
    vendor_id: 'SML001',
    timestamp,
    received_at: timestamp,
    timestamp_source: 'supabase_created_at',
    stale,
    pm1_0: numericOrNull(row.pm1_0),
    pm2_5: numericOrNull(row.pm2_5),
    pm10: numericOrNull(row.pm10),
    co2: numericOrNull(row.co2),
    temperature: numericOrNull(row.temperature),
    humidity: numericOrNull(row.humidity),
    voc: numericOrNull(row.voc),
  };
}
