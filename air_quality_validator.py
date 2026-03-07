import argparse
import hashlib
import hmac
import json
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict, Iterable, List


@dataclass
class ValidationResult:
    index: int
    status: str
    reason: str


def canonical_payload(record: Dict[str, Any]) -> bytes:
    payload = {
        "sensor_id": record["sensor_id"],
        "timestamp": record["timestamp"],
        "pm25": record["pm25"],
        "pm10": record["pm10"],
        "co2": record["co2"],
    }
    return json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")


def sign_record(record: Dict[str, Any], secret: str) -> str:
    return hmac.new(secret.encode("utf-8"), canonical_payload(record), hashlib.sha256).hexdigest()


def _parse_ts(ts: str) -> datetime:
    return datetime.fromisoformat(ts.replace("Z", "+00:00")).astimezone(timezone.utc)


def validate_records(records: Iterable[Dict[str, Any]], secret: str) -> List[ValidationResult]:
    results: List[ValidationResult] = []
    previous_by_sensor: Dict[str, Dict[str, Any]] = {}

    for idx, record in enumerate(records):
        try:
            expected = sign_record(record, secret)
            if expected != record.get("signature", ""):
                results.append(ValidationResult(idx, "tampered", "HMAC signature mismatch"))
                continue

            prev = previous_by_sensor.get(record["sensor_id"])
            if prev:
                dt = (_parse_ts(record["timestamp"]) - _parse_ts(prev["timestamp"])).total_seconds()
                if dt <= 0:
                    results.append(ValidationResult(idx, "tampered", "timestamp is not monotonic"))
                    continue

                pm25_delta = abs(record["pm25"] - prev["pm25"])
                pm10_delta = abs(record["pm10"] - prev["pm10"])
                co2_delta = abs(record["co2"] - prev["co2"])
                if pm25_delta > 120 or pm10_delta > 180 or co2_delta > 800:
                    results.append(
                        ValidationResult(
                            idx,
                            "suspicious",
                            "abnormal jump detected (send this row to ChatGPT reviewer)",
                        )
                    )
                    previous_by_sensor[record["sensor_id"]] = record
                    continue

            previous_by_sensor[record["sensor_id"]] = record
            results.append(ValidationResult(idx, "ok", "signature and continuity checks passed"))
        except Exception as exc:  # pragma: no cover - defensive for malformed rows
            results.append(ValidationResult(idx, "invalid", f"parse error: {exc}"))

    return results


def load_jsonl(path: str) -> List[Dict[str, Any]]:
    with open(path, "r", encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def main() -> None:
    parser = argparse.ArgumentParser(description="Air-quality tamper validator")
    parser.add_argument("--input", required=True, help="JSONL records with signature field")
    parser.add_argument("--secret", required=True, help="HMAC shared secret")
    args = parser.parse_args()

    rows = load_jsonl(args.input)
    results = validate_records(rows, args.secret)

    summary = {"ok": 0, "tampered": 0, "suspicious": 0, "invalid": 0}
    for item in results:
        summary[item.status] += 1
        print(f"#{item.index:03d} [{item.status}] {item.reason}")

    print("\\nSummary:")
    for key in ["ok", "tampered", "suspicious", "invalid"]:
        print(f"- {key}: {summary[key]}")


if __name__ == "__main__":
    main()
