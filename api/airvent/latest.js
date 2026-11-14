import {
  getDeviceId, json, querySensorReadings, serializeSensorReading, withPartnerAuth,
} from '../../lib/airvent-partner.js';

export default async function handler(req, res) {
  return withPartnerAuth(req, res, async () => {
    const deviceId = getDeviceId(req, res);
    if (!deviceId) return;
    const rows = await querySensorReadings(deviceId, { limit: 1 });
    return json(res, 200, {
      success: true,
      source: 'AIRVENT Supabase',
      data: rows.length ? serializeSensorReading(rows[0]) : null,
    });
  });
}
