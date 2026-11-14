import {
  getBoundedInteger, getDeviceId, json, querySensorReadings,
  serializeSensorReading, withPartnerAuth,
} from '../../lib/airvent-partner.js';

export default async function handler(req, res) {
  return withPartnerAuth(req, res, async () => {
    const deviceId = getDeviceId(req, res);
    if (!deviceId) return;
    const hours = getBoundedInteger(req, res, 'hours', 24, 1, 168);
    if (hours === null) return;
    const limit = getBoundedInteger(req, res, 'limit', 500, 1, 500);
    if (limit === null) return;

    const rows = await querySensorReadings(deviceId, { hours, limit });
    return json(res, 200, {
      success: true,
      source: 'AIRVENT Supabase',
      device_id: deviceId,
      hours,
      count: rows.length,
      // Graphing clients consume chronological (oldest first) data.
      data: rows.reverse().map(serializeSensorReading),
    });
  });
}
