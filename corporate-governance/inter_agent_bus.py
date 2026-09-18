#!/usr/bin/env python3
"""
SB Group — Inter-Agent Peer Communication & Task Delegation Bus
Enforces strict single-responsibility roles for CORTEX AI Shorts Studio:
  - Lyra Vance: AI Trend Radar & Sourcing ONLY
  - Kaelen Cross: Viral Hook & Audio Clipping ONLY
  - Zuri Chen: Kinetic Subtitling & Visual 9:16 Styling ONLY
  - Orion Stark: RLHF Preference Learning & Quality Gate ONLY
  - Maya Lin: Omni-Channel Distribution & Monetization ONLY

When an agent needs another capability, they send a direct inter-agent dispatch.
All collaboration transcripts are persisted to ledger/inter_agent_collab.json.
"""

import os
import json
import time
from datetime import datetime
from pathlib import Path

LEDGER_DIR = Path(r"C:\AI_Ecosystem\corporate-governance\ledger")
COLLAB_LEDGER_FILE = LEDGER_DIR / "inter_agent_collab.json"

STUDIO_AGENT_DEFINITIONS = {
    "lyra_vance": {
        "id": "agent-lyra-vance",
        "key": "lyra_vance",
        "name": "Lyra Vance",
        "title": "Lead AI Trend Radar & Sourcing Scout",
        "avatar_img": "/assets/avatars/lyra_vance.jpg",
        "strict_role": "Sourcing and trend discovery ONLY. Discovers high-velocity AI podcasts, keynote moments, and viral debates across YouTube and X.",
        "allowed_capabilities": ["source_podcast", "analyze_trend_velocity", "hand_off_candidate"],
        "assigned_partner": "kaelen_cross",
        "status": "ONLINE",
        "current_task": "Monitoring Dwarkesh Patel, Lex Fridman, No Priors, and OpenAI/Anthropic keynotes for viral hooks"
    },
    "kaelen_cross": {
        "id": "agent-kaelen-cross",
        "key": "kaelen_cross",
        "name": "Kaelen Cross",
        "title": "Lead Viral Hook & Audio Clipper",
        "avatar_img": "/assets/avatars/kaelen_cross.jpg",
        "strict_role": "Audio/video extraction and precision hook clipping ONLY. Parses speech transcripts to find the golden 30-60s retention hook.",
        "allowed_capabilities": ["download_stream", "extract_transcript", "detect_hook", "trim_timestamps"],
        "assigned_partner": "zuri_chen",
        "status": "ONLINE",
        "current_task": "Evaluating speech retention curves and 0-5s scroll-stopping hooks"
    },
    "zuri_chen": {
        "id": "agent-zuri-chen",
        "key": "zuri_chen",
        "name": "Zuri Chen",
        "title": "Kinetic Subtitler & Visual Stylist",
        "avatar_img": "/assets/avatars/zuri_chen.jpg",
        "strict_role": "9:16 vertical reformatting and kinetic caption animation ONLY. Styles active pop-in words, emojis, progress bar, and renders 1080x1920 MP4 via Remotion.",
        "allowed_capabilities": ["format_vertical_916", "animate_kinetic_subtitles", "render_remotion_mp4"],
        "assigned_partner": "orion_stark",
        "status": "ONLINE",
        "current_task": "Styling dynamic neon word highlights and split-screen interview crops"
    },
    "orion_stark": {
        "id": "agent-orion-stark",
        "key": "orion_stark",
        "name": "Orion Stark",
        "title": "RLHF Preference Learner & Quality Guardian",
        "avatar_img": "/assets/avatars/orion_stark.jpg",
        "strict_role": "Virality scoring, human feedback capture, and Bayesian preference weight tuning ONLY. Observes Mustafa's approvals/rejections and adapts future clipping.",
        "allowed_capabilities": ["score_virality", "stage_approval_queue", "record_human_feedback", "update_weights"],
        "assigned_partner": "maya_lin",
        "status": "ONLINE",
        "current_task": "Maintaining human preference weight vectors and autonomy readiness index"
    },
    "maya_lin": {
        "id": "agent-maya-lin",
        "key": "maya_lin",
        "name": "Maya Lin",
        "title": "Omni-Channel Distribution & Monetization Director",
        "avatar_img": "/assets/avatars/maya_lin.jpg",
        "strict_role": "Cross-platform scheduling and monetization packaging ONLY. Formulates SEO titles, viral hashtags, pinned affiliate links, and manages YouTube/X/TikTok/IG queue.",
        "allowed_capabilities": ["package_metadata", "inject_monetization", "schedule_post", "dispatch_to_platforms"],
        "assigned_partner": "lyra_vance",
        "status": "ONLINE",
        "current_task": "Scheduling approved 9:16 shorts across YouTube Shorts, X.com, TikTok, and Instagram Reels"
    }
}


def load_collab_ledger():
    LEDGER_DIR.mkdir(parents=True, exist_ok=True)
    if not COLLAB_LEDGER_FILE.exists():
        initial_ledger = {
            "version": "1.0",
            "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "active_tasks": [],
            "completed_tasks": [],
            "dialogues": []
        }
        with open(COLLAB_LEDGER_FILE, "w", encoding="utf-8") as f:
            json.dump(initial_ledger, f, indent=2)
        return initial_ledger

    try:
        with open(COLLAB_LEDGER_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"active_tasks": [], "completed_tasks": [], "dialogues": []}


def save_collab_ledger(data):
    LEDGER_DIR.mkdir(parents=True, exist_ok=True)
    data["last_updated"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(COLLAB_LEDGER_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def send_inter_agent_task(sender_key, recipient_key, task_type, payload, dialogue_message):
    if sender_key not in STUDIO_AGENT_DEFINITIONS:
        raise ValueError(f"Unknown sender agent: {sender_key}")
    if recipient_key not in STUDIO_AGENT_DEFINITIONS:
        raise ValueError(f"Unknown recipient agent: {recipient_key}")

    sender = STUDIO_AGENT_DEFINITIONS[sender_key]
    recipient = STUDIO_AGENT_DEFINITIONS[recipient_key]

    task_id = f"TASK-{int(time.time())}-{sender_key[:3].upper()}2{recipient_key[:3].upper()}"
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    collab = load_collab_ledger()

    task_record = {
        "task_id": task_id,
        "timestamp": timestamp,
        "sender": {
            "key": sender_key,
            "name": sender["name"],
            "title": sender["title"],
            "avatar": sender["avatar_img"]
        },
        "recipient": {
            "key": recipient_key,
            "name": recipient["name"],
            "title": recipient["title"],
            "avatar": recipient["avatar_img"]
        },
        "task_type": task_type,
        "payload": payload,
        "status": "IN_PROGRESS",
        "message": dialogue_message
    }

    dialogue_entry = {
        "id": f"MSG-{int(time.time()*1000)}",
        "timestamp": timestamp,
        "from": sender["name"],
        "from_avatar": sender["avatar_img"],
        "to": recipient["name"],
        "to_avatar": recipient["avatar_img"],
        "task_id": task_id,
        "content": dialogue_message,
        "task_type": task_type
    }

    collab.setdefault("active_tasks", []).append(task_record)
    collab.setdefault("dialogues", []).append(dialogue_entry)
    save_collab_ledger(collab)

    return task_record


def complete_inter_agent_task(task_id, completion_message, result_payload=None):
    collab = load_collab_ledger()
    active = collab.get("active_tasks", [])
    found = None

    for i, t in enumerate(active):
        if t["task_id"] == task_id:
            found = active.pop(i)
            break

    if not found:
        return None

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    found["status"] = "COMPLETED"
    found["completed_at"] = timestamp
    found["completion_message"] = completion_message
    if result_payload:
        found["result_payload"] = result_payload

    collab.setdefault("completed_tasks", []).append(found)

    dialogue_reply = {
        "id": f"MSG-{int(time.time()*1000)}",
        "timestamp": timestamp,
        "from": found["recipient"]["name"],
        "from_avatar": found["recipient"]["avatar"],
        "to": found["sender"]["name"],
        "to_avatar": found["sender"]["avatar"],
        "task_id": task_id,
        "content": completion_message,
        "task_type": f"REPLY_{found['task_type']}"
    }
    collab.setdefault("dialogues", []).append(dialogue_reply)
    save_collab_ledger(collab)
    return found


def seed_studio_history_if_empty():
    collab = load_collab_ledger()
    if collab.get("dialogues"):
        return

    d1 = send_inter_agent_task(
        "lyra_vance",
        "kaelen_cross",
        "REQUEST_CLIP_EXTRACTION",
        {
            "source_url": "https://www.youtube.com/watch?v=1A2B3C4D5E",
            "podcast": "Dwarkesh Patel Podcast",
            "episode_title": "Ilya Sutskever on Safe Superintelligence (SSI), Consciousness & Reasoning",
            "speaker": "Ilya Sutskever",
            "target_window": "00:14:10 - 00:15:05"
        },
        "Kaelen, our trend radar flagged a viral spike on Ilya's explanation of why scaling compute isn't enough without synthetic reasoning. Retention velocity is 9.8/10. Please pull the audio stream, transcribe, and find the 45-second retention sweet spot."
    )
    complete_inter_agent_task(
        d1["task_id"],
        "Got it, Lyra. Stream downloaded via yt-dlp. I analyzed the speech curve and locked the hook: 'Why Ilya Sutskever left OpenAI to build SSI'. Extracted clean 48-second cut [14:12 - 15:00] with word-level timestamps."
    )

    d2 = send_inter_agent_task(
        "kaelen_cross",
        "zuri_chen",
        "REQUEST_KINETIC_RENDER",
        {
            "clip_id": "CLIP-ILYA-SSI-01",
            "hook": "Why Ilya REALLY Left OpenAI",
            "speaker": "Ilya Sutskever",
            "duration": 48
        },
        "Zuri, raw cut and word-level JSON timings are ready. Please apply 9:16 vertical split-screen centering on Ilya, animate word-by-word kinetic pop-in subtitles with neon yellow emphasis on keywords, and add the bottom visualizer wave."
    )
    complete_inter_agent_task(
        d2["task_id"],
        "Render complete, Kaelen! Remotion output generated in 1080x1920 60fps (`short_ilya_ssi_01.mp4`). Active word bounces and bold emojis synced perfectly to his voice cadence."
    )

    d3 = send_inter_agent_task(
        "zuri_chen",
        "orion_stark",
        "SUBMIT_FOR_QUALITY_AND_APPROVAL",
        {
            "clip_id": "CLIP-ILYA-SSI-01",
            "file": "short_ilya_ssi_01.mp4",
            "predicted_virality": 94
        },
        "Orion, finalized 9:16 MP4 is staged in output. Please evaluate against the virality matrix, calculate RLHF feature weights, and queue for Chairperson Mustafa's approval."
    )
    complete_inter_agent_task(
        d3["task_id"],
        "Evaluated, Zuri. Hook Score: 95/100, Speaker Retention: 98/100, Pacing: 162 WPM. Total Virality Index: 96/100. Staged in Mustafa's Executive Approval Queue with live preview."
    )


if __name__ == "__main__":
    seed_studio_history_if_empty()
    print("Inter-Agent Bus Initialized with 5 specialized agents.")
