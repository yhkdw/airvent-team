/**
 * AIRVENT MQTT -> Supabase ingestion-only bridge.
 * Runs independently of Solana wallet/RPC and stores durable disk spool entries
 * before attempting a Supabase upload.
 */
import mqtt from "mqtt";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import * as os from "os";

dotenv.config({ path: path.resolve(__dirname, ".env") });
const required = (key: string): string => {
  const value = process.env[key]?.trim();
  if (!value) throw new Error("Missing required environment variable: " + key);
  return value;
};

const brokerUrl = process.env.MQTT_HOST || "mqtt://127.0.0.1:1883";
const topicFilter = process.env.MQTT_TOPIC || "env/SML001/+/data";
const deviceFilter = process.env.DEVICE_ID?.trim() || "5EBHA10001";
const queueDir = path.resolve(__dirname, "spool");
const MAX_SPOOL_FILES = 5000;
const RETRY_INTERVAL_MS = 5000;
const supabase = createClient(required("SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { autoRefreshToken: false, persistSession: false },
});

type Reading = {
  device_id: string;
  pm1_0: number;
  pm2_5: number;
  pm10: number;
  temperature: number;
  humidity: number;
  co2: number;
  voc: number;
  created_at: string;
};

function metric(data: Record<string, unknown>, name: string): number {
  const raw = data[name];
  if (raw === null || raw === undefined || raw === "") throw new Error("Missing metric " + name);
  const value = Number(raw);
  if (!Number.isFinite(value)) throw new Error("Invalid metric " + name);
  return value;
}

function parseReading(topic: string, raw: Buffer): { id: string; row: Reading } {
  const parts = topic.split("/");
  if (parts.length !== 4 || parts[0] !== "env" || parts[1] !== "SML001" || parts[3] !== "data") {
    throw new Error("Unexpected MQTT topic");
  }
  if (!raw.length) throw new Error("Empty MQTT payload");
  const payload = JSON.parse(raw.toString("utf8")) as Record<string, unknown>;
  const deviceId = String(payload.device_id || "");
  if (!deviceId || deviceId !== parts[2]) throw new Error("Device ID and MQTT topic mismatch");
  if (deviceFilter !== "*" && deviceId !== deviceFilter) throw new Error("Unexpected device_id " + deviceId);
  const messageId = typeof payload.msg_id === "string" && payload.msg_id.length > 0
    ? payload.msg_id
    : crypto.randomUUID();

  // Sensor timestamp can be future-shifted. Use server receive time as created_at.
  return {
    id: crypto.createHash("sha256").update(deviceId + ":" + messageId).digest("hex"),
    row: {
      device_id: deviceId,
      pm1_0: metric(payload, "pm1_0"),
      pm2_5: metric(payload, "pm2_5"),
      pm10: metric(payload, "pm10"),
      temperature: metric(payload, "temperature"),
      humidity: metric(payload, "humidity"),
      co2: metric(payload, "co2"),
      voc: metric(payload, "voc"),
      created_at: new Date().toISOString(),
    },
  };
}

let flushing = false;

async function flushQueue(): Promise<void> {
  if (flushing) return;
  flushing = true;
  try {
    const files = (await fs.promises.readdir(queueDir)).filter(f => f.endsWith(".json")).sort();
    for (const file of files) {
      const fullPath = path.join(queueDir, file);
      let row: Reading;
      try {
        row = JSON.parse(await fs.promises.readFile(fullPath, "utf8")) as Reading;
      } catch (e) {
        console.error("[INGEST] Invalid spool file, retained for inspection:", file, e);
        continue;
      }
      const { error } = await supabase.from("sensor_readings").insert(row);
      if (error) {
        console.error("[INGEST] Supabase upload failed; keeping queued readings:", error.message);
        break;
      }
      await fs.promises.unlink(fullPath);
      console.log("[INGEST] Stored device=" + row.device_id + " at " + row.created_at);
    }
  } catch (error) {
    console.error("[INGEST] Flush failed:", error);
  } finally {
    flushing = false;
  }
}

async function enqueue(topic: string, message: Buffer): Promise<void> {
  let parsed: { id: string; row: Reading };
  try {
    parsed = parseReading(topic, message);
  } catch (error) {
    console.error("[INGEST] Rejected payload:", error instanceof Error ? error.message : error);
    return;
  }
  try {
    const pending = (await fs.promises.readdir(queueDir)).filter(f => f.endsWith(".json"));
    if (pending.length >= MAX_SPOOL_FILES) {
      console.error("[INGEST] Spool is full. Check Supabase connection immediately.");
      return;
    }
    // Spool first so a transient Supabase outage does not discard measurements.
    const filepath = path.join(queueDir, parsed.id + ".json");
    await fs.promises.writeFile(filepath, JSON.stringify(parsed.row), { flag: "wx", mode: 0o600 });
    void flushQueue();
  } catch (error: any) {
    if (error?.code !== "EEXIST") console.error("[INGEST] Unable to queue reading:", error);
  }
}

async function main(): Promise<void> {
  await fs.promises.mkdir(queueDir, { recursive: true, mode: 0o700 });
  console.log("[INGEST] MQTT broker=" + brokerUrl + " topic=" + topicFilter + " device=" + deviceFilter);
  const client = mqtt.connect(brokerUrl, {
    clientId: "airvent-ingest-" + os.hostname(),
    username: required("MQTT_USERNAME"),
    password: required("MQTT_PASSWORD"),
    clean: true,
    reconnectPeriod: 5000,
    connectTimeout: 10000,
    keepalive: 60,
  });

  client.on("connect", () => {
    console.log("[INGEST] MQTT connected");
    client.subscribe(topicFilter, { qos: 1 }, (error) => {
      if (error) console.error("[INGEST] Subscription failed:", error.message);
      else console.log("[INGEST] Subscribed to " + topicFilter);
    });
  });
  client.on("message", (topic, message) => { void enqueue(topic, message); });
  client.on("error", (error) => console.error("[INGEST] MQTT connection:", error.message));
  client.on("offline", () => console.warn("[INGEST] MQTT offline, reconnecting"));
  setInterval(() => { void flushQueue(); }, RETRY_INTERVAL_MS);
  await flushQueue();
}
main().catch(error => { console.error("[INGEST] Fatal:", error); process.exit(1); });
