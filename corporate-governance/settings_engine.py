#!/usr/bin/env python3
"""
SB Group (Saifee Burhani Group of Companies)
Executive Settings & Sovereign API Vault Engine
Zero External Dependencies (Python 3.11 Standard Library)
"""

import os
import json
import time
from datetime import datetime
from pathlib import Path

ECOSYSTEM_ROOT = Path(r"C:\AI_Ecosystem")
LEDGER_DIR = ECOSYSTEM_ROOT / "corporate-governance" / "ledger"
SETTINGS_FILE = LEDGER_DIR / "ecosystem_settings.json"
ENV_ECOSYSTEM_FILE = ECOSYSTEM_ROOT / ".env.ecosystem"
GITIGNORE_FILE = ECOSYSTEM_ROOT / ".gitignore"

LEDGER_DIR.mkdir(parents=True, exist_ok=True)

DEFAULT_SETTINGS = {
    "version": "1.0-SOVEREIGN",
    "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    "emergency_killswitch": False,
    "account": {
        "full_name": "Mustafa",
        "executive_title": "Chairperson & Supreme Commander",
        "organization": "Saifee Burhani Group of Companies (SB Group)",
        "email": "mustafa@sbgroup.corp",
        "timezone": "Asia/Kolkata (IST, UTC+05:30)",
        "primary_currency": "INR (₹)",
        "secondary_currency": "USD ($)",
        "subsidiaries": [
            "SB Fragrance",
            "TITAN Labs",
            "Alfann Art Studio",
            "AdWell Media",
            "Apex Viral Media",
            "CORTEX AI Shorts Studio"
        ]
    },
    "privacy": {
        "offline_sovereign_inference": True,
        "zero_telemetry_enforced": True,
        "anonymize_affiliate_fingerprints": True,
        "local_storage_strict": True,
        "auto_purge_temp_media_days": 7
    },
    "security": {
        "webhook_hmac_sha256_enforced": True,
        "require_session_pin": False,
        "emergency_killswitch_active": False,
        "localhost_origin_lockdown": True,
        "cors_restricted": True
    },
    "swarm": {
        "default_llm_model": "qwen2.5-coder:7b-instruct",
        "ollama_base_url": "http://localhost:11434",
        "autopilot_readiness_threshold": 90,
        "council_debate_rigor": "standard_3_rounds",
        "strict_agent_roles_enforced": True
    },
    "ui": {
        "theme": "obsidian_dark",
        "brand_logo": "sb_group_crest",
        "executive_audio_chimes": True,
        "telemetry_refresh_sec": 5
    },
    "api_keys": [
        # AI & LLM Providers
        {
            "id": "gemini_api_key",
            "name": "Google Gemini API Key",
            "env_var": "GEMINI_API_KEY",
            "category": "AI & LLM",
            "value": "",
            "description": "Multimodal reasoning, Gemini 1.5 Pro/Flash, Google AI Studio",
            "status": "NOT SET",
            "is_custom": False,
            "created_at": "2026-09-11"
        },
        {
            "id": "openai_api_key",
            "name": "OpenAI API Key",
            "env_var": "OPENAI_API_KEY",
            "category": "AI & LLM",
            "value": "",
            "description": "GPT-4o, o1, o3-mini reasoning, embeddings",
            "status": "NOT SET",
            "is_custom": False,
            "created_at": "2026-09-11"
        },
        {
            "id": "anthropic_api_key",
            "name": "Anthropic Claude API Key",
            "env_var": "ANTHROPIC_API_KEY",
            "category": "AI & LLM",
            "value": "",
            "description": "Claude 3.5 Sonnet, Claude Opus enterprise intelligence",
            "status": "NOT SET",
            "is_custom": False,
            "created_at": "2026-09-11"
        },
        {
            "id": "groq_api_key",
            "name": "Groq LPU Cloud API Key",
            "env_var": "GROQ_API_KEY",
            "category": "AI & LLM",
            "value": "",
            "description": "Sub-100ms ultra-fast inference for real-time agent hand-offs",
            "status": "NOT SET",
            "is_custom": False,
            "created_at": "2026-09-11"
        },
        {
            "id": "deepseek_api_key",
            "name": "DeepSeek API Key",
            "env_var": "DEEPSEEK_API_KEY",
            "category": "AI & LLM",
            "value": "",
            "description": "DeepSeek-R1 / V3 cost-effective reasoning token engine",
            "status": "NOT SET",
            "is_custom": False,
            "created_at": "2026-09-11"
        },
        {
            "id": "perplexity_api_key",
            "name": "Perplexity Search API Key",
            "env_var": "PERPLEXITY_API_KEY",
            "category": "AI & LLM",
            "value": "",
            "description": "Online live web grounding & real-time citation searches",
            "status": "NOT SET",
            "is_custom": False,
            "created_at": "2026-09-11"
        },
        {
            "id": "ollama_host",
            "name": "Local Ollama Endpoint",
            "env_var": "OLLAMA_HOST",
            "category": "AI & LLM",
            "value": "http://localhost:11434",
            "description": "100% sovereign offline inference runtime on Windows",
            "status": "CONFIGURED",
            "is_custom": False,
            "created_at": "2026-09-11"
        },

        # Payment & Treasury Gateways
        {
            "id": "razorpay_key_id",
            "name": "Razorpay Key ID",
            "env_var": "RAZORPAY_KEY_ID",
            "category": "Payments & Treasury",
            "value": "",
            "description": "Public Key ID for India UPI, NetBanking, and Card checkout",
            "status": "NOT SET",
            "is_custom": False,
            "created_at": "2026-09-11"
        },
        {
            "id": "razorpay_key_secret",
            "name": "Razorpay Key Secret",
            "env_var": "RAZORPAY_KEY_SECRET",
            "category": "Payments & Treasury",
            "value": "",
            "description": "Confidential merchant secret for payment link creation & settlement",
            "status": "NOT SET",
            "is_custom": False,
            "created_at": "2026-09-11"
        },
        {
            "id": "razorpay_webhook_secret",
            "name": "Razorpay Webhook Secret",
            "env_var": "RAZORPAY_WEBHOOK_SECRET",
            "category": "Payments & Treasury",
            "value": "",
            "description": "HMAC-SHA256 signature verification for instant payment webhooks",
            "status": "NOT SET",
            "is_custom": False,
            "created_at": "2026-09-11"
        },
        {
            "id": "paypal_client_id",
            "name": "PayPal Client ID",
            "env_var": "PAYPAL_CLIENT_ID",
            "category": "Payments & Treasury",
            "value": "",
            "description": "Global multi-currency merchant ID for international card checkout",
            "status": "NOT SET",
            "is_custom": False,
            "created_at": "2026-09-11"
        },
        {
            "id": "paypal_client_secret",
            "name": "PayPal Client Secret",
            "env_var": "PAYPAL_CLIENT_SECRET",
            "category": "Payments & Treasury",
            "value": "",
            "description": "OAuth 2.0 client secret for PayPal Orders v2 API capture",
            "status": "NOT SET",
            "is_custom": False,
            "created_at": "2026-09-11"
        },
        {
            "id": "gumroad_access_token",
            "name": "Gumroad API Access Token",
            "env_var": "GUMROAD_ACCESS_TOKEN",
            "category": "Payments & Treasury",
            "value": "",
            "description": "Digital product sales, Tayyār Sticker storefront sync",
            "status": "NOT SET",
            "is_custom": False,
            "created_at": "2026-09-11"
        },

        # Social & Publishing Platforms (CORTEX AI Shorts)
        {
            "id": "youtube_api_key",
            "name": "YouTube Data API v3 Key",
            "env_var": "YOUTUBE_API_KEY",
            "category": "Social & Publishing",
            "value": "",
            "description": "Automated YouTube Shorts uploads, descriptions, tags, metadata",
            "status": "NOT SET",
            "is_custom": False,
            "created_at": "2026-09-11"
        },
        {
            "id": "x_api_key",
            "name": "X.com (Twitter) API v2 Bearer Token",
            "env_var": "X_API_KEY",
            "category": "Social & Publishing",
            "value": "",
            "description": "Video tweets, threaded affiliate funnels, creator monetization",
            "status": "NOT SET",
            "is_custom": False,
            "created_at": "2026-09-11"
        },
        {
            "id": "tiktok_client_key",
            "name": "TikTok Content Posting Client Key",
            "env_var": "TIKTOK_CLIENT_KEY",
            "category": "Social & Publishing",
            "value": "",
            "description": "Direct-to-TikTok video posting, sound attribution, hashtags",
            "status": "NOT SET",
            "is_custom": False,
            "created_at": "2026-09-11"
        },
        {
            "id": "instagram_access_token",
            "name": "Instagram Graph API Token",
            "env_var": "INSTAGRAM_ACCESS_TOKEN",
            "category": "Social & Publishing",
            "value": "",
            "description": "Instagram Reels video publishing and caption container dispatch",
            "status": "NOT SET",
            "is_custom": False,
            "created_at": "2026-09-11"
        },

        # Affiliate & Sourcing Tools
        {
            "id": "amazon_associate_tag",
            "name": "Amazon Associates Tracking Tag",
            "env_var": "AMAZON_ASSOCIATE_TAG",
            "category": "Affiliate & Sourcing",
            "value": "mufee-21",
            "description": "Automated referral tag injected into all TITAN Labs electronics recommendations",
            "status": "CONFIGURED",
            "is_custom": False,
            "created_at": "2026-09-11"
        },
        {
            "id": "flipkart_affiliate_id",
            "name": "Flipkart Affiliate ID",
            "env_var": "FLIPKART_AFFILIATE_ID",
            "category": "Affiliate & Sourcing",
            "value": "",
            "description": "Secondary e-commerce affiliate tracking for India consumer electronics",
            "status": "NOT SET",
            "is_custom": False,
            "created_at": "2026-09-11"
        },
        {
            "id": "rapidapi_key",
            "name": "RapidAPI Pricing Crawler Key",
            "env_var": "RAPIDAPI_KEY",
            "category": "Affiliate & Sourcing",
            "value": "",
            "description": "Multi-retailer price scraper gateway for Amazon/Flipkart/Croma comparisons",
            "status": "NOT SET",
            "is_custom": False,
            "created_at": "2026-09-11"
        },

        # Communication & Alerts
        {
            "id": "telegram_bot_token",
            "name": "Telegram Bot Token",
            "env_var": "TELEGRAM_BOT_TOKEN",
            "category": "Communication & Alerts",
            "value": "",
            "description": "Instant executive phone alerts for sales conversions and council deadlocks",
            "status": "NOT SET",
            "is_custom": False,
            "created_at": "2026-09-11"
        },
        {
            "id": "discord_webhook_url",
            "name": "Discord Alert Webhook URL",
            "env_var": "DISCORD_WEBHOOK_URL",
            "category": "Communication & Alerts",
            "value": "",
            "description": "Broadcasts agent actions, new video renders, and financial settlements",
            "status": "NOT SET",
            "is_custom": False,
            "created_at": "2026-09-11"
        }
    ]
}


def ensure_gitignore():
    """Ensure all sovereign environment and credential files are gitignored."""
    try:
        content = ""
        if GITIGNORE_FILE.exists():
            content = GITIGNORE_FILE.read_text(encoding="utf-8")
        
        required = [".env*", "*.env", ".env.treasury", ".env.shorts", ".env.ecosystem"]
        modified = False
        for req in required:
            if req not in content:
                content += f"\n{req}"
                modified = True
        
        if modified:
            GITIGNORE_FILE.write_text(content.strip() + "\n", encoding="utf-8")
    except Exception as e:
        print(f"Warning: could not update .gitignore: {e}")


def load_settings():
    ensure_gitignore()
    if not SETTINGS_FILE.exists():
        save_settings(DEFAULT_SETTINGS)
        return DEFAULT_SETTINGS
    try:
        data = json.loads(SETTINGS_FILE.read_text(encoding="utf-8"))
        for k, v in DEFAULT_SETTINGS.items():
            if k not in data:
                data[k] = v
        return data
    except Exception:
        return DEFAULT_SETTINGS


def save_settings(data):
    ensure_gitignore()
    data["last_updated"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    SETTINGS_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")
    sync_to_env(data)
    return data


def sync_to_env(data):
    """Write active API keys to .env.ecosystem for sovereign consumption."""
    try:
        lines = [
            f"# SB Group Sovereign Ecosystem Environment",
            f"# Auto-generated at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"# Strictly gitignored. Do not commit.",
            ""
        ]
        for item in data.get("api_keys", []):
            var_name = item.get("env_var", "").strip()
            val = item.get("value", "").strip()
            if var_name:
                lines.append(f"{var_name}={val}")
        ENV_ECOSYSTEM_FILE.write_text("\n".join(lines) + "\n", encoding="utf-8")
    except Exception as e:
        print(f"Error syncing to .env.ecosystem: {e}")


def mask_secret(val):
    if not val:
        return ""
    if len(val) <= 8:
        return "••••••••"
    return val[:3] + "••••••••••••" + val[-4:]


def get_masked_settings():
    """Returns settings with masked secrets safe for dashboard UI delivery."""
    settings = load_settings()
    masked = json.loads(json.dumps(settings))
    for item in masked.get("api_keys", []):
        raw_val = item.get("value", "")
        item["is_set"] = bool(raw_val and raw_val.strip())
        item["status"] = "CONFIGURED" if item["is_set"] else "NOT SET"
        item["masked_value"] = mask_secret(raw_val)
        item["raw_length"] = len(raw_val)
        del item["value"]
    return masked


def reveal_key_value(key_id):
    """Returns the unmasked secret value for copying or editing."""
    settings = load_settings()
    for item in settings.get("api_keys", []):
        if item.get("id") == key_id or item.get("env_var") == key_id:
            return {
                "id": item.get("id"),
                "name": item.get("name"),
                "env_var": item.get("env_var"),
                "value": item.get("value", ""),
                "status": "CONFIGURED" if item.get("value") else "NOT SET"
            }
    return None


def save_or_update_api_key(key_id, name, env_var, value, category="Custom Tools", description=""):
    """Saves or updates an existing or custom API key in the vault."""
    settings = load_settings()
    keys = settings.get("api_keys", [])
    
    found = False
    for item in keys:
        if item.get("id") == key_id or item.get("env_var") == env_var:
            if name: item["name"] = name
            if value is not None: item["value"] = value.strip()
            if category: item["category"] = category
            if description: item["description"] = description
            item["status"] = "CONFIGURED" if item["value"] else "NOT SET"
            found = True
            break
            
    if not found:
        new_entry = {
            "id": key_id or env_var.lower().replace(" ", "_"),
            "name": name or env_var,
            "env_var": env_var.upper().replace(" ", "_"),
            "category": category or "Custom Tools",
            "value": value.strip() if value else "",
            "description": description or f"Custom API integration for {name}",
            "status": "CONFIGURED" if value else "NOT SET",
            "is_custom": True,
            "created_at": datetime.now().strftime("%Y-%m-%d")
        }
        keys.append(new_entry)
        
    settings["api_keys"] = keys
    save_settings(settings)
    return {"status": "SUCCESS", "id": key_id or env_var}


def delete_api_key(key_id):
    """Deletes a custom API key from the vault."""
    settings = load_settings()
    keys = settings.get("api_keys", [])
    new_keys = []
    deleted = False
    for item in keys:
        if (item.get("id") == key_id or item.get("env_var") == key_id) and item.get("is_custom", False):
            deleted = True
            continue
        new_keys.append(item)
    settings["api_keys"] = new_keys
    save_settings(settings)
    return {"status": "DELETED" if deleted else "NOT_FOUND"}


def update_section(section_name, values):
    """Updates a specific section of settings (account, privacy, security, swarm, ui)."""
    settings = load_settings()
    if section_name in settings and isinstance(settings[section_name], dict):
        settings[section_name].update(values)
        save_settings(settings)
        return {"status": "SUCCESS", "section": section_name, "data": settings[section_name]}
    return {"status": "ERROR", "message": f"Section '{section_name}' not found"}


def toggle_emergency_killswitch(active=None):
    """Toggles or sets the global emergency killswitch."""
    settings = load_settings()
    if active is None:
        current = settings.get("emergency_killswitch", False)
        settings["emergency_killswitch"] = not current
    else:
        settings["emergency_killswitch"] = bool(active)
    settings.setdefault("security", {})["emergency_killswitch_active"] = settings["emergency_killswitch"]
    save_settings(settings)
    return {"status": "SUCCESS", "emergency_killswitch": settings["emergency_killswitch"]}


if __name__ == "__main__":
    ensure_gitignore()
    st = load_settings()
    print(f"Settings loaded: {len(st.get('api_keys', []))} API keys managed. Killswitch: {st.get('emergency_killswitch')}")
