#!/usr/bin/env python3
"""Compute today's PPL workout (Asia/Dubai time) and push it to ntfy.sh."""
import json
import os
import sys
import urllib.request
from datetime import datetime
from zoneinfo import ZoneInfo

TIMEZONE = "Asia/Dubai"
DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "workouts.json")


def build_message(day_data: dict) -> str:
    lines = []
    if day_data["warmup"]:
        lines.append("Warm-up:")
        lines.extend(f"  - {item}" for item in day_data["warmup"])
        lines.append("")
    lines.append("Workout:")
    lines.extend(f"  - {item}" for item in day_data["exercises"])
    if day_data["cooldown"]:
        lines.append("")
        lines.append("Cooldown:")
        lines.extend(f"  - {item}" for item in day_data["cooldown"])
    return "\n".join(lines)


def main() -> int:
    topic = os.environ.get("NTFY_TOPIC")
    if not topic:
        print("ERROR: NTFY_TOPIC environment variable is not set.", file=sys.stderr)
        return 1

    with open(DATA_FILE, encoding="utf-8") as f:
        data = json.load(f)

    weekday = datetime.now(ZoneInfo(TIMEZONE)).strftime("%A").lower()
    workout_key = data["schedule"][weekday]
    day_data = data["workouts"][workout_key]

    title = f"{weekday.capitalize()}: {day_data['title']}"
    body = build_message(day_data)

    url = f"https://ntfy.sh/{topic}"
    req = urllib.request.Request(
        url,
        data=body.encode("utf-8"),
        headers={
            "Title": title,
            "Tags": "muscle",
            "Priority": "default",
        },
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=15) as resp:
        status = resp.status
        print(f"ntfy.sh responded with status {status} for topic '{topic}'")
        if status >= 300:
            return 1

    print(f"Sent reminder: {title}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
