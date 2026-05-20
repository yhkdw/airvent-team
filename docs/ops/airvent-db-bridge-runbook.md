# AirVent airvent-db Bridge Runbook

This runbook documents the AirVent Bridge service running on Naver Cloud `airvent-db`.
It is safe to commit because it contains operational commands and placeholders only.
Do not add secrets to this file.

## Data Flow

```text
AirVent Sensor
  -> Naver Cloud MQTT Broker
  -> airvent-db Bridge
  -> Supabase sensor_readings
  -> Dashboard
  -> Solana Devnet
```

The bridge subscribes to the MQTT broker, receives sensor telemetry, writes the latest readings into Supabase `sensor_readings`, and submits verified readings to Solana Devnet.

## Server Information

| Item | Value |
| --- | --- |
| Server name | `airvent-db` |
| OS | Ubuntu 24.04 |
| Public IP | `211.188.63.54` |
| Bridge runtime path | `/opt/airvent-team/dashboard/bridge` |
| PM2 process name | `airvent-bridge` |

SSH:

```bash
ssh root@211.188.63.54
```

## MQTT Settings

```bash
MQTT_HOST=mqtt://211.188.57.53:1883
MQTT_TOPIC=env/SML001/+/data
DEVICE_ID=5EBHA10001
```

Example topic:

```text
env/SML001/5EBHA10001/data
```

Active device ID:

```text
5EBHA10001
```

Example payload:

```json
{
  "msg_id": "uuid",
  "device_id": "5EBHA10001",
  "vendor_id": "SML001",
  "timestamp": "1779286862000",
  "fw_version": "1.0.3",
  "pm1_0": "9",
  "pm2_5": "9",
  "pm10": "11",
  "temperature": "28.26",
  "humidity": "40.80",
  "co2": "400",
  "voc": "2"
}
```

## Timestamp Policy

The bridge must use server receive time for Supabase `created_at`:

```ts
created_at: new Date().toISOString()
```

Do not use the device payload timestamp for `created_at`. Device payload timestamps can be wrong, timezone-shifted, or future-dated. Future-dated rows break dashboard latest-value ordering because `created_at desc` will keep selecting the wrong row.

## PM2 Operations

```bash
pm2 list
pm2 logs airvent-bridge
pm2 delete airvent-bridge
pm2 start ecosystem.config.cjs
pm2 save
systemctl status pm2-root
```

## Server Update Procedure

Run these commands on `airvent-db` after changes are merged to `main`:

```bash
cd /opt/airvent-team
git pull origin main
cd dashboard/bridge
npm install
pm2 restart airvent-bridge
pm2 save
pm2 logs airvent-bridge
```

If the PM2 process needs to be recreated:

```bash
cd /opt/airvent-team
git pull origin main
cd dashboard/bridge
npm install
pm2 delete airvent-bridge || true
pm2 start ecosystem.config.cjs
pm2 save
pm2 list
pm2 logs airvent-bridge
```

## Supabase Verification Query

Use this SQL in Supabase to confirm recent readings for the active device:

```sql
select
  device_id,
  created_at,
  created_at at time zone 'Asia/Seoul' as created_at_kst,
  pm1_0,
  pm2_5,
  pm10,
  temperature,
  humidity,
  co2,
  voc
from sensor_readings
where device_id = '5EBHA10001'
order by created_at desc
limit 10;
```

## Secret Safety Warning

Never commit any of the following:

- `.env`
- service role key
- MQTT password
- `/root/airvent-bridge.json`
- wallet JSON
- keypair JSON
- `dashboard/bridge/.env`
- `airvent-bridge*.json`
- `*-keypair.json`
- `id*.json`
- `wallet*.json`

Secrets must live only on the server or in local untracked files.
