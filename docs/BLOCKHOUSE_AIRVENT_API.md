# AIRVENT → Blockhouse (Aero Fire) read-only API

**Status:** Code prepared in PR, not production-ready until merged and the Vercel environment variable is set and tested.

## Architecture

AIRVENT sensor → Mosquitto :1883 → existing AIRVENT Bridge → Supabase sensor_readings → **AIRVENT Vercel API** → Blockhouse backend → Blockhouse dashboard.

This is a read-only adapter. It does **not** change MQTT, PM2, ingestion, device firmware or Supabase schema. The older SQLite collector from the November 9 README is **not necessary**.

## Deployment requirements

In the AIRVENT Vercel project, open Settings → Environment Variables, add:

| Name | Value | Notes |
|---|---|---|
| AIRVENT_PARTNER_API_KEY | 64-character random hexadecimal secret | **Required**, generate with openssl rand -hex 32; use Production and optionally Preview |
| AIRVENT_ALLOWED_DEVICE_IDS | 5EBHA10001 | Optional; restrict to approved sensor IDs |
| AIRVENT_SUPABASE_URL | existing Supabase project URL | Optional; falls back to existing VITE_SUPABASE_URL |
| AIRVENT_SUPABASE_ANON_KEY | existing **anon/public** key | Optional; falls back to existing VITE_SUPABASE_ANON_KEY |

Do not use a Supabase service_role key, MQTT credentials, or user passwords. The API relies on the same read/RLS permission as the existing AIRVENT dashboard.

Confirm Vercel's Root Directory is the **repository root** (same location as vercel.json). After merging, redeploy Production so functions receive the configured key.

### Requests (server-side only)

Send a dedicated API key via HTTP header **X-API-Key**. Never embed this key in the Antigravity client, browser code, NEXT_PUBLIC_*, VITE_*, or public GitHub files.

GET https://airvent.ai/api/airvent/latest?device_id=5EBHA10001

GET https://airvent.ai/api/airvent/history?device_id=5EBHA10001&hours=24&limit=500

GET https://airvent.ai/api/airvent/devices

Example test **from a trusted terminal**, with the secret populated securely:

    curl -i -H "X-API-Key: $AIRVENT_PARTNER_API_KEY" \
      "https://airvent.ai/api/airvent/latest?device_id=5EBHA10001"

Do not paste the API key or request header containing it into a public chat, screenshot, log, or GitHub issue.

### Response

Latest:

    {
      "success": true,
      "source": "AIRVENT Supabase",
      "data": {
        "device_id": "5EBHA10001",
        "vendor_id": "SML001",
        "timestamp": "2026-11-09T08:24:17.000Z",
        "received_at": "2026-11-09T08:24:17.000Z",
        "timestamp_source": "supabase_created_at",
        "stale": false,
        "pm1_0": 23, "pm2_5": 24, "pm10": 27,
        "co2": 400, "temperature": 23.99, "humidity": 32.23, "voc": null
      }
    }

The values above are **illustrative historical examples**, not live readings. If no row exists, data is null. History data is oldest-to-newest. The timestamp represents Supabase's created_at; it is **not** an authoritative on-device clock.

The stale flag is true for measurements older than five minutes or implausibly future-dated. The API does not issue a claim about device uptime solely based on a successful HTTP response.

### Query limits / errors

- device_id defaults to 5EBHA10001 and must be allowlisted. Other devices return 404.
- hours is an integer 1..168 (default 24).
- limit is an integer 1..500 (default 500).
- 401: missing/incorrect X-API-Key.
- 400: invalid request parameters.
- 404: device not enabled for partner access.
- 405: only GET is permitted.
- 502: Supabase unavailable or RLS denies the read.
- 503: AIRVENT_PARTNER_API_KEY not configured.

Responses disable caching. No browser CORS allowance is sent intentionally: partner sites should call this API from **their backend or serverless API route**, not directly from the browser. Configure per-partner server-side rate limiting / Vercel Firewall ahead of public release.

## Blockhouse backend integration example

Their Vercel server-side route should call the AIRVENT API using a **private** environment variable. Example inside a Node runtime:

    const upstream = await fetch(
      'https://airvent.ai/api/airvent/latest?device_id=5EBHA10001',
      { headers: { 'X-API-Key': process.env.AIRVENT_PARTNER_API_KEY } }
    );
    if (!upstream.ok) throw new Error('AIRVENT upstream HTTP ' + upstream.status);
    const payload = await upstream.json();

Blockhouse's browser reads only its own backend. The two organizations must coordinate secure one-time delivery of the dedicated partner key.

## Operational validation

1. From an unauthenticated browser, endpoint should return 401 (after key setup).
2. From a trusted terminal with the key, latest returns HTTP 200 and a sensor row.
3. Confirm the row's timestamp changes when the sensor sends its next MQTT message.
4. Test history chronological order, stale flag, unauthorized device, bad query and wrong key.
5. Verify the existing https://airvent.ai/dashboard/air-quality still updates.
6. Do not share the API key or any telemetry until the partner agrees to authorized data use and the intended public/private scope.
