"""
SB Group Media Generation Engine — Automated Viral Reels & Shorts Producer
Renders 1080x1920 9:16 vertical videos with kinetic typography, synced audio, and dynamic overlays using Remotion.
"""

import os
import sys
import json
import subprocess
import argparse
from datetime import datetime

# Ensure UTF-8 output on Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

REMOTION_PROJECT_DIR = r"C:\Users\Mustafa\OneDrive\Documents\Businesses\AI\Testing Remotion Video\my-video"
OUTPUT_DIR = r"c:\AI_Ecosystem\media-generation\output"
LEDGER_PATH = r"c:\AI_Ecosystem\corporate-governance\ledger\rendered_reels.json"

def render_reel(topic: str, hook: str, badge: str = "TITAN PRODUCT INTELLIGENCE", frames: int = 150, out_name: str = None):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(LEDGER_PATH), exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    if not out_name:
        sanitized = "".join(c for c in topic if c.isalnum() or c in (' ', '_', '-')).rstrip().replace(' ', '_')
        out_name = f"reel_{sanitized}_{timestamp}.mp4"

    out_path = os.path.join(OUTPUT_DIR, out_name)
    props = json.dumps({
        "hookText": hook,
        "badgeText": badge,
        "topic": topic,
        "accentColor": "#FFE600"
    })

    print(f"[*] Launching Remotion rendering engine...")
    print(f"    Topic: {topic}")
    print(f"    Hook:  {hook}")
    print(f"    Target: {out_path}")
    print(f"    Frames: 0-{frames} (Duration: {frames/30:.1f}s at 30 fps)")

    cmd = [
        "npx.cmd", "remotion", "render",
        "ViralShort",
        out_path,
        f"--frames=0-{frames}",
        f"--props={props}",
        "--gl=angle"
    ]

    start_time = datetime.now()
    try:
        proc = subprocess.run(
            cmd,
            cwd=REMOTION_PROJECT_DIR,
            capture_output=True,
            text=True,
            timeout=180
        )
        if proc.returncode != 0:
            print(f"[-] Remotion render failed with exit code {proc.returncode}")
            print(proc.stderr[:800])
            return None
    except Exception as e:
        print(f"[-] Render execution error: {e}")
        return None

    elapsed = (datetime.now() - start_time).total_seconds()
    if os.path.exists(out_path):
        size_mb = os.path.getsize(out_path) / (1024 * 1024)
        print(f"[+] SUCCESS: Reel rendered in {elapsed:.1f}s ({size_mb:.2f} MB)")
        print(f"    File: {out_path}")

        # Update production ledger
        ledger = []
        if os.path.exists(LEDGER_PATH):
            try:
                with open(LEDGER_PATH, "r", encoding="utf-8") as f:
                    ledger = json.load(f)
            except Exception:
                ledger = []

        entry = {
            "id": f"reel_{timestamp}",
            "topic": topic,
            "hook": hook,
            "badge": badge,
            "duration_seconds": round(frames / 30, 1),
            "file_path": out_path,
            "size_mb": round(size_mb, 2),
            "rendered_at": datetime.now().isoformat(),
            "status": "READY_FOR_UPLOAD",
            "platforms": ["Instagram Reels", "YouTube Shorts", "TikTok"]
        }
        ledger.insert(0, entry)
        with open(LEDGER_PATH, "w", encoding="utf-8") as f:
            json.dump(ledger, f, indent=2)

        return entry
    else:
        print("[-] Render finished but output file not found.")
        return None

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Render viral short reel")
    parser.add_argument("--topic", default="MacBook Air M3 vs Dell XPS 14")
    parser.add_argument("--hook", default="STOP BUYING THE WRONG LAPTOP IN 2026!")
    parser.add_argument("--badge", default="TITAN PRODUCT INTELLIGENCE")
    parser.add_argument("--frames", type=int, default=90) # 3 seconds test render
    parser.add_argument("--out", default=None)

    args = parser.parse_args()
    render_reel(args.topic, args.hook, args.badge, args.frames, args.out)
