import { allowedDeviceIds, json, withPartnerAuth } from '../../lib/airvent-partner.js';

export default async function handler(req, res) {
  return withPartnerAuth(req, res, async () => {
    return json(res, 200, {
      success: true,
      source: 'AIRVENT',
      data: allowedDeviceIds().map((deviceId) => ({
        device_id: deviceId,
        vendor_id: 'SML001',
        sensor_type: 'indoor_air_quality',
        expected_interval_seconds: 60,
      })),
    });
  });
}
