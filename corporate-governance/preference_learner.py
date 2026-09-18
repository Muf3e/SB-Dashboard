#!/usr/bin/env python3
"""
SB Group — RLHF Preference Learning & Virality Scoring Engine
Observes Chairperson Mustafa's approvals, rejections, and stylistic adjustments
to continuously tune the neural feature weight matrix for AI Clipped Shorts.
Zero External Dependencies (Python 3.11 Standard Library)
"""

import os
import json
import time
from datetime import datetime
from pathlib import Path

LEDGER_DIR = Path(r"C:\AI_Ecosystem\corporate-governance\ledger")
ALGO_FILE = LEDGER_DIR / "shorts_preference_algo.json"
FEEDBACK_FILE = LEDGER_DIR / "feedback_history.json"
PENDING_CLIPS_FILE = LEDGER_DIR / "pending_shorts_queue.json"

import sys
sys.path.insert(0, str(Path(r"C:\AI_Ecosystem\corporate-governance")))
try:
    import inter_agent_bus
except ImportError:
    inter_agent_bus = None


DEFAULT_ALGO_STATE = {
    "version": "2.4-RLHF",
    "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    "autopilot_enabled": False,
    "autonomy_readiness_pct": 74.0,
    "total_reviews_count": 8,
    "total_approvals": 6,
    "total_rejections": 2,
    "learning_rate": 0.12,
    "target_pacing_wpm": 168,
    "preferred_accent_color": "#FFE600",  # Neon Yellow
    "speaker_affinity": {
        "Ilya Sutskever": 0.96,
        "Jensen Huang": 0.94,
        "Sam Altman": 0.89,
        "Andrej Karpathy": 0.95,
        "Yann LeCun": 0.87,
        "Demis Hassabis": 0.91,
        "Dario Amodei": 0.84,
        "Geoffrey Hinton": 0.88,
        "Mark Zuckerberg": 0.82,
        "Dwarkesh Patel": 0.90,
        "Lex Fridman": 0.86
    },
    "topic_affinity": {
        "AGI Timelines & Singularity": 0.95,
        "Compute Scaling & GPU Wars": 0.93,
        "Synthetic Reasoning & Logic": 0.96,
        "Superintelligence Safety (SSI)": 0.91,
        "Autonomous Coding Agents": 0.88,
        "Humanoid Robotics": 0.85,
        "Open-Source vs Closed Weights": 0.89,
        "Prompt Engineering Tactics": 0.65
    },
    "hook_style_affinity": {
        "Controversial Debate": 0.94,
        "Mindblowing Revelation": 0.96,
        "Insider Truth Exposed": 0.91,
        "Future Shock Prediction": 0.89,
        "Technical Proof": 0.78
    },
    "visual_preferences": {
        "split_screen_interview": 0.92,
        "speaker_dynamic_crop": 0.88,
        "active_word_neon_pop": 0.95,
        "bottom_visualizer_wave": 0.90,
        "progress_bar_enabled": 0.94
    },
    "negative_penalties": {
        "monologue_without_hook": -0.45,
        "generic_chatgpt_prompts": -0.35,
        "boring_intro_over_4s": -0.50
    }
}


def load_preference_state():
    LEDGER_DIR.mkdir(parents=True, exist_ok=True)
    if not ALGO_FILE.exists():
        save_preference_state(DEFAULT_ALGO_STATE)
        return DEFAULT_ALGO_STATE

    try:
        with open(ALGO_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return DEFAULT_ALGO_STATE


def save_preference_state(state):
    LEDGER_DIR.mkdir(parents=True, exist_ok=True)
    state["last_updated"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(ALGO_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)


def calculate_virality_score(clip):
    """
    Computes a predicted virality score (0-100) using current learned weights.
    """
    state = load_preference_state()
    speaker = clip.get("speaker", "")
    topics = clip.get("topics", [])
    hook_style = clip.get("hook_style", "")

    speaker_score = state.get("speaker_affinity", {}).get(speaker, 0.75) * 100

    topic_weights = state.get("topic_affinity", {})
    topic_scores = [topic_weights.get(t, 0.70) for t in topics] if topics else [0.75]
    avg_topic_score = (sum(topic_scores) / len(topic_scores)) * 100

    hook_score = state.get("hook_style_affinity", {}).get(hook_style, 0.75) * 100

    pacing_target = state.get("target_pacing_wpm", 165)
    actual_wpm = clip.get("wpm", 165)
    pacing_diff = abs(actual_wpm - pacing_target)
    pacing_score = max(60, 100 - (pacing_diff * 1.2))

    blended = (speaker_score * 0.35) + (avg_topic_score * 0.30) + (hook_score * 0.25) + (pacing_score * 0.10)
    return round(min(99.0, max(50.0, blended)), 1)


def load_pending_clips():
    LEDGER_DIR.mkdir(parents=True, exist_ok=True)
    if not PENDING_CLIPS_FILE.exists():
        seed_pending_clips()
    try:
        with open(PENDING_CLIPS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def save_pending_clips(clips):
    LEDGER_DIR.mkdir(parents=True, exist_ok=True)
    with open(PENDING_CLIPS_FILE, "w", encoding="utf-8") as f:
        json.dump(clips, f, indent=2)


def seed_pending_clips():
    sample_clips = [
        {
            "id": "CLIP-ILYA-01",
            "title": "Why Ilya REALLY Left OpenAI (The Superintelligence Truth)",
            "hook_headline": "Why Ilya Sutskever Left OpenAI",
            "hook_style": "Insider Truth Exposed",
            "speaker": "Ilya Sutskever",
            "podcast_name": "Dwarkesh Patel Podcast",
            "source_url": "https://www.youtube.com/watch?v=1A2B3C4D5E",
            "duration_sec": 48,
            "wpm": 164,
            "topics": ["Superintelligence Safety (SSI)", "Synthetic Reasoning & Logic", "AGI Timelines & Singularity"],
            "predicted_virality": 96.4,
            "virality_badge": "VIRAL BREAKOUT 🔥",
            "target_platforms": ["YouTube Shorts", "X.com Video", "TikTok", "Instagram Reels"],
            "video_preview_url": "/assets/previews/ilya_ssi_short.mp4",
            "thumbnail_url": "/assets/avatars/lyra_vance.jpg",
            "pinned_affiliate": "⚡ Build autonomous agents with 0 cloud cost: https://sbgroup.corp/titan-pro",
            "captions_sample": "People think scaling is just adding more GPUs. That was true for GPT-4. But true synthetic reasoning requires a fundamental paradigm shift.",
            "status": "PENDING_APPROVAL",
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        },
        {
            "id": "CLIP-JENSEN-02",
            "title": "Jensen Huang: 'Every Software Engineer Needs To Hear This Now'",
            "hook_headline": "Software Engineering Is Dead?",
            "hook_style": "Controversial Debate",
            "speaker": "Jensen Huang",
            "podcast_name": "Stanford GSB View From The Top",
            "source_url": "https://www.youtube.com/watch?v=2B3C4D5E6F",
            "duration_sec": 42,
            "wpm": 172,
            "topics": ["Autonomous Coding Agents", "Compute Scaling & GPU Wars"],
            "predicted_virality": 94.8,
            "virality_badge": "TRENDING NOW 🚀",
            "target_platforms": ["YouTube Shorts", "X.com Video", "TikTok", "Instagram Reels"],
            "video_preview_url": "/assets/previews/jensen_coding_short.mp4",
            "thumbnail_url": "/assets/avatars/kaelen_cross.jpg",
            "pinned_affiliate": "🚀 Try the AI coding intelligence suite: https://sbgroup.corp/titan-pro",
            "captions_sample": "It is our job to create computing technology such that nobody has to program. The programming language of the future is human.",
            "status": "PENDING_APPROVAL",
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        },
        {
            "id": "CLIP-KARPATHY-03",
            "title": "Andrej Karpathy Explains How Autonomous Agent Swarms Actually Work",
            "hook_headline": "The LLM OS Nobody Saw Coming",
            "hook_style": "Mindblowing Revelation",
            "speaker": "Andrej Karpathy",
            "podcast_name": "No Priors AI Podcast",
            "source_url": "https://www.youtube.com/watch?v=3C4D5E6F7G",
            "duration_sec": 54,
            "wpm": 160,
            "topics": ["Autonomous Coding Agents", "Synthetic Reasoning & Logic"],
            "predicted_virality": 95.2,
            "virality_badge": "VIRAL BREAKOUT 🔥",
            "target_platforms": ["YouTube Shorts", "X.com Video", "TikTok", "Instagram Reels"],
            "video_preview_url": "/assets/previews/karpathy_os_short.mp4",
            "thumbnail_url": "/assets/avatars/orion_stark.jpg",
            "pinned_affiliate": "🤖 Deploy your sovereign local council: https://sbgroup.corp/titan-pro",
            "captions_sample": "Think of the LLM not as a chatbot, but as the CPU of a brand-new operating system. It coordinates memory, tools, and subagents.",
            "status": "PENDING_APPROVAL",
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    ]
    save_pending_clips(sample_clips)


def record_human_feedback(clip_id, action, rejection_reasons=None, custom_notes="", edited_fields=None):
    """
    Core RLHF Algorithm:
    - If action == 'APPROVE': boosts feature weights (+learning_rate), increments autonomy readiness
    - If action == 'REJECT': penalizes matched weights (-learning_rate * factor), tunes negative constraints
    - If action == 'EDIT': records user phrasing preference
    """
    state = load_preference_state()
    clips = load_pending_clips()

    target_clip = None
    target_idx = -1
    for i, c in enumerate(clips):
        if c["id"] == clip_id:
            target_clip = c
            target_idx = i
            break

    if not target_clip:
        return {"error": f"Clip {clip_id} not found in pending queue."}

    lr = state.get("learning_rate", 0.12)
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    feedback_entry = {
        "id": f"RLHF-{int(time.time()*1000)}",
        "timestamp": timestamp,
        "clip_id": clip_id,
        "action": action,
        "clip_title": target_clip.get("title"),
        "speaker": target_clip.get("speaker"),
        "topics": target_clip.get("topics", []),
        "hook_style": target_clip.get("hook_style"),
        "rejection_reasons": rejection_reasons or [],
        "custom_notes": custom_notes,
        "edited_fields": edited_fields or {},
        "weights_delta": {}
    }

    speaker = target_clip.get("speaker")
    topics = target_clip.get("topics", [])
    hook_style = target_clip.get("hook_style")

    if action == "APPROVE":
        state["total_approvals"] = state.get("total_approvals", 0) + 1
        target_clip["status"] = "APPROVED"

        # Boost speaker weight
        if speaker in state["speaker_affinity"]:
            old_w = state["speaker_affinity"][speaker]
            new_w = min(0.99, old_w + (lr * (1.0 - old_w)))
            state["speaker_affinity"][speaker] = round(new_w, 4)
            feedback_entry["weights_delta"][f"speaker:{speaker}"] = round(new_w - old_w, 4)

        # Boost topic weights
        for t in topics:
            if t in state["topic_affinity"]:
                old_w = state["topic_affinity"][t]
                new_w = min(0.99, old_w + (lr * (1.0 - old_w)))
                state["topic_affinity"][t] = round(new_w, 4)
                feedback_entry["weights_delta"][f"topic:{t}"] = round(new_w - old_w, 4)

        # Boost hook style weight
        if hook_style in state["hook_style_affinity"]:
            old_w = state["hook_style_affinity"][hook_style]
            new_w = min(0.99, old_w + (lr * (1.0 - old_w)))
            state["hook_style_affinity"][hook_style] = round(new_w, 4)
            feedback_entry["weights_delta"][f"hook:{hook_style}"] = round(new_w - old_w, 4)

        # Inter-agent dispatch: Orion tells Maya to schedule the approved clip
        if inter_agent_bus:
            inter_agent_bus.send_inter_agent_task(
                "orion_stark",
                "maya_lin",
                "SCHEDULE_DISTRIBUTION",
                {
                    "clip_id": clip_id,
                    "title": target_clip.get("title"),
                    "platforms": target_clip.get("target_platforms", []),
                    "pinned_affiliate": target_clip.get("pinned_affiliate")
                },
                f"Maya, Chairperson Mustafa APPROVED '{target_clip.get('title')}'. Feature weights boosted. Please queue for distribution across YouTube Shorts, X.com, TikTok, and IG Reels with monetization link attached."
            )

    elif action == "REJECT":
        state["total_rejections"] = state.get("total_rejections", 0) + 1
        target_clip["status"] = "REJECTED"

        reasons = rejection_reasons or ["general_disapproval"]

        # If hook was too weak
        if "hook_too_weak" in reasons or "hook_confusing" in reasons:
            if hook_style in state["hook_style_affinity"]:
                old_w = state["hook_style_affinity"][hook_style]
                new_w = max(0.20, old_w - (lr * 1.5 * old_w))
                state["hook_style_affinity"][hook_style] = round(new_w, 4)
                feedback_entry["weights_delta"][f"hook:{hook_style}"] = round(new_w - old_w, 4)

        # If speaker uninteresting
        if "speaker_uninteresting" in reasons and speaker in state["speaker_affinity"]:
            old_w = state["speaker_affinity"][speaker]
            new_w = max(0.20, old_w - (lr * 1.5 * old_w))
            state["speaker_affinity"][speaker] = round(new_w, 4)
            feedback_entry["weights_delta"][f"speaker:{speaker}"] = round(new_w - old_w, 4)

        # If topic irrelevant
        if "topic_irrelevant" in reasons:
            for t in topics:
                if t in state["topic_affinity"]:
                    old_w = state["topic_affinity"][t]
                    new_w = max(0.20, old_w - (lr * 1.5 * old_w))
                    state["topic_affinity"][t] = round(new_w, 4)
                    feedback_entry["weights_delta"][f"topic:{t}"] = round(new_w - old_w, 4)

        # If pacing too slow
        if "pacing_too_slow" in reasons:
            state["target_pacing_wpm"] = min(190, state.get("target_pacing_wpm", 168) + 8)
            feedback_entry["weights_delta"]["target_pacing_wpm"] = +8

        # If pacing too fast
        if "pacing_too_fast" in reasons:
            state["target_pacing_wpm"] = max(140, state.get("target_pacing_wpm", 168) - 8)
            feedback_entry["weights_delta"]["target_pacing_wpm"] = -8

        # Inter-agent dispatch: Orion informs Kaelen & Zuri of what to fix next time
        if inter_agent_bus:
            reasons_str = ", ".join(reasons)
            inter_agent_bus.send_inter_agent_task(
                "orion_stark",
                "kaelen_cross",
                "FEEDBACK_REJECTION_ADAPTATION",
                {
                    "clip_id": clip_id,
                    "reasons": reasons,
                    "notes": custom_notes
                },
                f"Kaelen, Chairperson Mustafa rejected '{target_clip.get('title')}' citing [{reasons_str}]. Adjusted feature weights downwards. For future cuts, prioritize higher hook intensity and tighter pacing."
            )

    # Recalculate total reviews & Autonomy Readiness Index
    total_reviews = state.get("total_reviews_count", 0) + 1
    state["total_reviews_count"] = total_reviews
    approvals = state.get("total_approvals", 0)
    rejections = state.get("total_rejections", 0)

    # Readiness climbs progressively with consistent feedback
    base_readiness = 50.0 + (total_reviews * 3.5)
    penalty = (rejections * 1.5)
    new_readiness = min(98.5, max(40.0, base_readiness - penalty))
    state["autonomy_readiness_pct"] = round(new_readiness, 1)

    # Save files
    save_preference_state(state)
    save_pending_clips(clips)

    # Append to feedback history ledger
    LEDGER_DIR.mkdir(parents=True, exist_ok=True)
    history = []
    if FEEDBACK_FILE.exists():
        try:
            with open(FEEDBACK_FILE, "r", encoding="utf-8") as f:
                history = json.load(f)
        except Exception:
            history = []
    history.append(feedback_entry)
    with open(FEEDBACK_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)

    return {
        "success": True,
        "action": action,
        "clip_id": clip_id,
        "new_autonomy_readiness": state["autonomy_readiness_pct"],
        "feedback_entry": feedback_entry
    }


def toggle_autopilot(enabled=None):
    state = load_preference_state()
    if enabled is None:
        state["autopilot_enabled"] = not state.get("autopilot_enabled", False)
    else:
        state["autopilot_enabled"] = bool(enabled)
    save_preference_state(state)
    return state["autopilot_enabled"]


if __name__ == "__main__":
    seed_pending_clips()
    st = load_preference_state()
    print(f"RLHF Engine Initialized. Autonomy Readiness: {st['autonomy_readiness_pct']}% | Total Reviews: {st['total_reviews_count']}")
