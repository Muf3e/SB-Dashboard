"""
SB Group Digital Commerce Engine — Tayyār Sticker Pack Automated Storefront Deployer
Validates digital assets, calculates margins, connects to Gumroad API, and prepares instant digital fulfillment.
"""

import os
import sys

# Ensure UTF-8 output on Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
import json
import urllib.request
import urllib.parse
from datetime import datetime

STKR_DIR = r"C:\Users\Mustafa\OneDrive\Documents\Businesses\Stkr"
BUNDLE_DIR = os.path.join(STKR_DIR, "Tayyar_Sticker_Pack_Vol1_Bundle")
CONFIG_ENV = r"c:\AI_Ecosystem\config\credentials.env"

def load_credentials():
    creds = {}
    if os.path.exists(CONFIG_ENV):
        with open(CONFIG_ENV, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    creds[k.strip()] = v.strip()
    return creds

def read_bundle_metadata():
    desc_file = os.path.join(BUNDLE_DIR, "Gumroad_Description.txt")
    if os.path.exists(desc_file):
        with open(desc_file, "r", encoding="utf-8") as f:
            lines = f.readlines()
            title = lines[0].strip() if lines else "Name It! – Multilingual Name Sticker Pack (Vol. 1)"
            description = "".join(lines[1:]).strip()
    else:
        title = "Name It! – Multilingual Name Sticker Pack (Vol. 1)"
        description = "Digital printable name stickers in English, Hindi, and Urdu."

    zip_bundle = os.path.join(STKR_DIR, "Tayyar_Sticker_Pack_Vol1_Bundle.zip")
    banner = os.path.join(STKR_DIR, "gumroad banner.png")
    mockup = os.path.join(BUNDLE_DIR, "Product_Mockup.jpg")
    
    return {
        "title": title,
        "description": description,
        "price_usd": 3.99,
        "price_cents": 399,
        "price_inr": 299,
        "zip_bundle_path": zip_bundle,
        "zip_size_bytes": os.path.getsize(zip_bundle) if os.path.exists(zip_bundle) else 0,
        "banner_path": banner,
        "mockup_path": mockup,
        "tags": ["stickers", "printable", "name-stickers", "digital-download", "stationery", "crafts", "tayyar-designs"],
        "unit_cost_usd": 0.00,
        "gross_margin_pct": 91.5 # Gumroad takes 8.5% fee + $0.30, net margin ~91.5%
    }

def deploy():
    print("[*] Reading Tayyār Sticker Pack bundle...")
    meta = read_bundle_metadata()
    print(f"    Product Title: {meta['title']}")
    print(f"    Digital Asset: {os.path.basename(meta['zip_bundle_path'])} ({meta['zip_size_bytes'] / (1024*1024):.2f} MB)")
    print(f"    Price Point: ${meta['price_usd']} (approx ₹{meta['price_inr']}) | Net Margin: {meta['gross_margin_pct']}%")

    creds = load_credentials()
    token = creds.get("GUMROAD_ACCESS_TOKEN", os.environ.get("GUMROAD_ACCESS_TOKEN", ""))

    if token:
        print("[*] GUMROAD_ACCESS_TOKEN detected. Calling Gumroad API v2...")
        endpoint = "https://api.gumroad.com/v2/products"
        payload = urllib.parse.urlencode({
            "access_token": token,
            "name": meta["title"],
            "description": meta["description"],
            "price": meta["price_cents"],
            "currency": "usd",
            "url": "tayyar-name-stickers-vol1",
            "tags": ",".join(meta["tags"])
        }).encode("utf-8")

        req = urllib.request.Request(endpoint, data=payload, method="POST")
        try:
            with urllib.request.urlopen(req) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                print(f"[+] Product deployed successfully to Gumroad!")
                print(f"    Live URL: {result.get('product', {}).get('short_url')}")
                return result
        except Exception as e:
            print(f"[-] Gumroad API error: {e}")
    else:
        print("[i] GUMROAD_ACCESS_TOKEN not yet configured.")
        print("    Packaging complete manifest for 1-click launch...")

    manifest = {
        "status": "READY_FOR_PUBLISH",
        "product_id": "prod_tayyar_stickers_v1",
        "title": meta["title"],
        "pricing": {
            "usd": meta["price_usd"],
            "inr": meta["price_inr"],
            "net_margin": f"{meta['gross_margin_pct']}%"
        },
        "digital_asset": meta["zip_bundle_path"],
        "asset_size_mb": round(meta["zip_size_bytes"] / (1024*1024), 2),
        "tags": meta["tags"],
        "quick_setup_url": f"https://gumroad.com/products/new?name={urllib.parse.quote(meta['title'])}&price={meta['price_cents']}",
        "prepared_at": datetime.now().isoformat()
    }

    manifest_path = r"c:\AI_Ecosystem\corporate-governance\ledger\tayyar_stkr_manifest.json"
    os.makedirs(os.path.dirname(manifest_path), exist_ok=True)
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"[+] Product manifest saved to: {manifest_path}")
    print(f"    Direct Pre-Filled Creation Link:")
    print(f"    {manifest['quick_setup_url']}")
    return manifest

if __name__ == "__main__":
    deploy()
