'use strict';

// Library for the EXISTING Oracle ingest bridge. This module does not start
// another MQTT subscriber or write to Supabase by itself.
// Window timestamps use relay arrival time (UTC), not untrusted device clocks.
const FIELDS = ['pm1_0','pm2_5','pm10','co2','temperature','humidity','voc'];
const MINUTE_MS = 60_000;

class MinuteAggregator {
  constructor() {
    this.pending = new Map();
    this.confirmed = new Map();
  }
  add(packet, receivedAt = Date.now()) {
    const id = packet?.device_id;
    if (typeof id !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(id)) return false;
    const time = typeof receivedAt === 'number' ? receivedAt : Date.parse(receivedAt);
    if (!Number.isFinite(time) || time < 0) return false;
    const minute = Math.floor(time / MINUTE_MS) * MINUTE_MS;
    if (minute <= (this.confirmed.get(id) ?? -1)) return false;
    const values = FIELDS.map(field => {
      const value = packet[field];
      return value === null || value === undefined || value === '' ? NaN : Number(value);
    });
    if (!values.every(Number.isFinite)) return false;
    if (!this.pending.has(id)) this.pending.set(id, new Map());
    const buckets = this.pending.get(id);
    if (!buckets.has(minute)) buckets.set(minute, { count:0, sums:Object.fromEntries(FIELDS.map(f=>[f,0])) });
    const bucket = buckets.get(minute);
    bucket.count++;
    FIELDS.forEach((field, index) => { bucket.sums[field] += values[index]; });
    return true;
  }
  // Caller inserts each ready row and confirms it ONLY after DB insert success.
  // Do not run concurrent drains on the same aggregator instance.
  ready(now = Date.now()) {
    const cutoff = Math.floor(now / MINUTE_MS) * MINUTE_MS;
    const ready = [];
    for (const [deviceId, buckets] of this.pending) {
      for (const [minute, bucket] of buckets) {
        if (minute >= cutoff) continue;
        ready.push({
          device_id: deviceId,
          minute_start: new Date(minute).toISOString(),
          sample_count: bucket.count,
          row: {
            device_id: deviceId,
            ...Object.fromEntries(FIELDS.map(f => [f, Number((bucket.sums[f] / bucket.count).toFixed(3))])),
          }
        });
      }
    }
    return ready.sort((a,b)=>a.minute_start.localeCompare(b.minute_start));
  }
  confirm(deviceId, minuteStart) {
    const minute = Date.parse(minuteStart);
    const buckets = this.pending.get(deviceId);
    if (!buckets || !buckets.delete(minute)) return false;
    if (!buckets.size) this.pending.delete(deviceId);
    this.confirmed.set(deviceId, Math.max(this.confirmed.get(deviceId) ?? -1, minute));
    return true;
  }
}
module.exports={ MinuteAggregator, MINUTE_MS, FIELDS };
