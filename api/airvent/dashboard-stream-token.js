import { json } from '../../lib/airvent-partner.js';
import tokenAuth from '../../airvent-realtime/token.cjs';

// First-party AIRVENT dashboard only. Other devices require an ownership check
// before this endpoint can be expanded beyond the public demo device.
const DEMO_DEVICE_ID = '5EBHA10001';
const ID = /^[A-Za-z0-9_-]{1,64}$/;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return json(res, 405, { success: false, error: 'method_not_allowed' });
  }
  const deviceId = req.query?.device_id ?? DEMO_DEVICE_ID;
  if (typeof deviceId !== 'string' || !ID.test(deviceId)) {
    return json(res, 400, { success: false, error: 'invalid_device_id' });
  }
  if (deviceId !== DEMO_DEVICE_ID) {
    return json(res, 403, { success: false, error: 'device_access_denied' });
  }

  const auth = req.headers.authorization;
  if (typeof auth !== 'string' || !/^Bearer\s+\S+$/i.test(auth)) {
    return json(res, 401, { success: false, error: 'unauthorized' });
  }
  const supabaseUrl = process.env.AIRVENT_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.AIRVENT_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey || !process.env.AIRVENT_STREAM_SIGNING_KEY) {
    return json(res, 503, { success: false, error: 'service_not_configured' });
  }

  // Verify the bearer token with Supabase Auth on every issuance. An unverified
  // JWT (or the partner's long-lived X-API-Key) is never accepted here.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  let user;
  try {
    const response = await fetch(supabaseUrl.replace(/\/+$/, '') + '/auth/v1/user', {
      headers: { apikey: anonKey, Authorization: auth },
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!response.ok) return json(res, 401, { success: false, error: 'unauthorized' });
    user = await response.json();
    if (!user?.id) return json(res, 401, { success: false, error: 'unauthorized' });
  } catch {
    return json(res, 502, { success: false, error: 'identity_provider_unavailable' });
  } finally {
    clearTimeout(timeout);
  }

  try {
    const issued = tokenAuth.issue({
      key: process.env.AIRVENT_STREAM_SIGNING_KEY,
      deviceId,
      ttl: 60,
    });
    const url = new URL('https://mqtt.airvent.ai/v1/air-quality/stream');
    url.searchParams.set('device_id', deviceId);
    url.searchParams.set('token', issued.token);
    return json(res, 200, {
      success: true,
      device_id: deviceId,
      expires_at: new Date(issued.expiresAt * 1000).toISOString(),
      url: url.toString(),
      reconnect_after_seconds: 600,
    });
  } catch {
    return json(res, 503, { success: false, error: 'stream_not_configured' });
  }
}
