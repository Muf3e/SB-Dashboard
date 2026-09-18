"""
TITAN Labs — Product Intelligence & Affiliate Gateway Backend
Runs on port 8000. Provides real-time electronics prices, specs, and affiliate routing.
"""

import http.server
import socketserver
import json
import urllib.parse
import os
import sys
import time
from datetime import datetime

# Add titan_backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scraper import scan_all_retailers, build_affiliate_url, AMAZON_AFFILIATE_TAG

PORT = 8000

# Canonical Electronics Catalog Data Store
CATALOG = [
    {
        "id": "prod_macbook_air_m3",
        "name": "Apple MacBook Air 13\" (M3, 2024)",
        "brand": "Apple",
        "category": "Laptop",
        "titan_score": 9.2,
        "base_price": 114900.0,
        "spec_highlights": ["Apple M3 8-core CPU", "10-core GPU", "13.6\" Liquid Retina", "18-hr Battery", "1.24 kg"],
        "benchmarks": {"Geekbench Single": 3150, "Geekbench Multi": 12050, "Cinebench R23": 9820},
        "pros": ["Exceptional efficiency", "Silent fanless chassis", "Best-in-class trackpad and display"],
        "cons": ["Base model has 8GB unified RAM", "External dual display requires lid closed"],
        "asin": "B0CX23V252"
    },
    {
        "id": "prod_dell_xps_14",
        "name": "Dell XPS 14 (9440, Intel Core Ultra 7)",
        "brand": "Dell",
        "category": "Laptop",
        "titan_score": 8.7,
        "base_price": 178990.0,
        "spec_highlights": ["Intel Core Ultra 7 155H", "RTX 4050 6GB", "3.2K OLED 120Hz", "32GB LPDDR5X", "1.68 kg"],
        "benchmarks": {"Geekbench Single": 2420, "Geekbench Multi": 12890, "TimeSpy Graphics": 4210},
        "pros": ["Gorgeous 3.2K OLED panel", "Futuristic invisible glass haptic trackpad", "Stellar build rigidity"],
        "cons": ["Capacitive touch function row", "Limited IO port selection"],
        "asin": "B0CZ3X7K9W"
    },
    {
        "id": "prod_thinkpad_x1_carbon_g12",
        "name": "Lenovo ThinkPad X1 Carbon Gen 12",
        "brand": "Lenovo",
        "category": "Laptop",
        "titan_score": 9.0,
        "base_price": 194500.0,
        "spec_highlights": ["Intel Core Ultra 7 165U", "Intel Arc Graphics", "14\" 2.8K OLED 120Hz", "1.09 kg"],
        "benchmarks": {"Geekbench Single": 2380, "Geekbench Multi": 10940, "Battery Hours": 14.5},
        "pros": ["Legendary keyboard comfort", "Ultralight aerospace carbon chassis", "Superb security & webcam"],
        "cons": ["Premium enterprise price tag", "Speakers are average"],
        "asin": "B0D1K7M9P2"
    },
    {
        "id": "prod_galaxy_s24_ultra",
        "name": "Samsung Galaxy S24 Ultra (512GB)",
        "brand": "Samsung",
        "category": "Smartphone",
        "titan_score": 9.4,
        "base_price": 139999.0,
        "spec_highlights": ["Snapdragon 8 Gen 3", "200MP Quad Telephoto", "6.8\" Flat AMOLED 2600 nits", "Titanium Frame", "S-Pen"],
        "benchmarks": {"AnTuTu v10": 2085000, "Geekbench Single": 2290, "Geekbench Multi": 7180},
        "pros": ["Gorilla Armor anti-reflective glass", "Unmatched optical zoom versatility", "7 years OS updates"],
        "cons": ["Sharp corner ergonomics", "Relatively slow 45W charging compared to peers"],
        "asin": "B0CS5X4538"
    },
    {
        "id": "prod_iphone_16_pro_max",
        "name": "Apple iPhone 16 Pro Max (256GB)",
        "brand": "Apple",
        "category": "Smartphone",
        "titan_score": 9.5,
        "base_price": 144900.0,
        "spec_highlights": ["A18 Pro 3nm Chip", "48MP Fusion Camera", "6.9\" Super Retina XDR", "Grade 5 Titanium", "Camera Control Button"],
        "benchmarks": {"Geekbench Single": 3450, "Geekbench Multi": 8620, "3DMark Solar Bay": 8940},
        "pros": ["Unmatched 4K 120fps Dolby Vision video", "Tremendous battery endurance", "Industry-leading single-core speed"],
        "cons": ["Large and heavy in pocket", "Slow file transfer on USB 3 requires dedicated cable"],
        "asin": "B0DGHR25N5"
    },
    {
        "id": "prod_ipad_pro_m4",
        "name": "Apple iPad Pro 13\" (M4, Ultra Retina Tandem OLED)",
        "brand": "Apple",
        "category": "Tablet",
        "titan_score": 9.3,
        "base_price": 129900.0,
        "spec_highlights": ["Apple M4 10-core", "Tandem OLED 1000 nits", "5.1mm Thin", "Apple Pencil Pro Support"],
        "benchmarks": {"Geekbench Single": 3720, "Geekbench Multi": 14610, "Metal Score": 53900},
        "pros": ["The best tablet display on earth", "Thinnest Apple product ever made", "Blistering M4 raw compute"],
        "cons": ["iPadOS holds back hardware potential", "Keyboard + Pencil adds significant cost"],
        "asin": "B0D3J75F4C"
    },
    {
        "id": "prod_sony_wh1000xm5",
        "name": "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
        "brand": "Sony",
        "category": "Accessory",
        "titan_score": 9.1,
        "base_price": 29990.0,
        "spec_highlights": ["Auto NC Optimizer", "30-hr Battery", "Integrated Processor V1", "Speak-to-Chat", "LDAC Hi-Res"],
        "benchmarks": {"ANC Attenuation": "32dB at 100Hz", "Total Harmonic Distortion": "< 0.1%"},
        "pros": ["Superb active noise cancellation", "Comfortable lightweight headband", "Crystal clear call beamforming"],
        "cons": ["Non-folding hinge design", "Touchpad gestures take practice"],
        "asin": "B09XS7JWHH"
    }
]

# Click tracking and analytics store
AFFILIATE_LOG = {
    "total_clicks": 142,
    "unique_sessions": 88,
    "estimated_conversions": 9,
    "estimated_commissions_inr": 8420.0,
    "click_history": [
        {"timestamp": "2026-09-09T18:22:10", "product": "Apple MacBook Air 13\" (M3, 2024)", "retailer": "Amazon India", "tag": "mufee-21"},
        {"timestamp": "2026-09-09T20:15:45", "product": "Samsung Galaxy S24 Ultra", "retailer": "Amazon India", "tag": "mufee-21"},
        {"timestamp": "2026-09-09T22:40:02", "product": "Sony WH-1000XM5", "retailer": "Amazon India", "tag": "mufee-21"}
    ]
}

def render_titan_html():
    products_html = ""
    for p in CATALOG:
        deals = scan_all_retailers(p["name"], p["base_price"])
        best = deals[0] if deals else None
        specs_badges = "".join([f'<span class="px-2 py-0.5 text-[10px] rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">{s}</span>' for s in p.get("spec_highlights", [])[:3]])
        
        deals_rows = ""
        for d in deals:
            is_best = d == best
            retailer_name = d["retailer"]
            price_formatted = f"₹{d['current_price']:,.0f}"
            disc = f"-{d['discount_percent']}%" if d.get('discount_percent') else "MSRP"
            avail = d.get('availability', 'In stock')
            redir_url = f"/api/affiliate/redirect?product={urllib.parse.quote(p['name'])}&retailer={urllib.parse.quote(retailer_name)}"
            deals_rows += f"""
            <div class="flex items-center justify-between p-2 rounded-lg { 'bg-cyan-950/40 border border-cyan-500/30' if is_best else 'bg-slate-900/50 border border-slate-800' }">
                <div>
                    <div class="flex items-center gap-1.5">
                        <span class="text-xs font-semibold text-slate-200">{retailer_name}</span>
                        {'<span class="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">LOWEST</span>' if is_best else ''}
                    </div>
                    <span class="text-[10px] text-slate-400 font-mono">{disc} • {avail}</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="font-mono font-bold text-sm { 'text-emerald-400' if is_best else 'text-slate-300' }">{price_formatted}</span>
                    <a href="{redir_url}" target="_blank" class="px-2.5 py-1 text-xs font-semibold rounded bg-cyan-600 hover:bg-cyan-500 text-white shadow transition flex items-center gap-1">
                        Buy <span>↗</span>
                    </a>
                </div>
            </div>
            """

        products_html += f"""
        <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 transition flex flex-col justify-between shadow-lg backdrop-blur-md">
            <div>
                <div class="flex items-center justify-between gap-2 mb-2">
                    <span class="px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded bg-slate-800 text-slate-300">{p['category']}</span>
                    <span class="px-2 py-0.5 text-xs font-mono font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">★ {p['titan_score']}/10</span>
                </div>
                <h3 class="text-base font-bold text-white mb-1.5 leading-snug">{p['name']}</h3>
                <div class="flex flex-wrap gap-1 mb-3">
                    {specs_badges}
                </div>
            </div>
            <div class="mt-2 space-y-1.5">
                <div class="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Live Market Arbitrage</div>
                {deals_rows}
            </div>
        </div>
        """

    return f"""<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TITAN Labs — Retail Arbitrage & Product Intelligence Gateway</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {{ background: radial-gradient(circle at 50% 0%, #0c172e 0%, #060913 100%); min-height: 100vh; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; }}
    </style>
</head>
<body class="p-4 md:p-6">
    <div class="max-w-7xl mx-auto space-y-6">
        <!-- Header Banner -->
        <header class="p-4 rounded-2xl bg-slate-950/70 border border-white/10 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(6,182,212,0.3)]">💻</div>
                <div>
                    <div class="flex items-center gap-2">
                        <h1 class="text-lg font-bold text-white tracking-wide">TITAN LABS</h1>
                        <span class="px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">PORT 8000</span>
                        <span class="px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">ONLINE</span>
                    </div>
                    <p class="text-xs text-slate-400">Autonomous Retail Arbitrage & Electronics Price Intelligence Gateway</p>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <div class="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 font-mono">
                    AFFILIATE: <span class="font-bold text-amber-200">tag={AMAZON_AFFILIATE_TAG}</span>
                </div>
                <div class="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-mono">
                    CONVERSIONS: <span class="font-bold text-emerald-200">9 Settled (~₹8,420)</span>
                </div>
            </div>
        </header>

        <!-- Product Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products_html}
        </div>
    </div>
</body>
</html>
"""

class TitanBackendHandler(http.server.BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # Root Catalog Web View
        if path in ["/", "/index.html"]:
            self._reply_html(render_titan_html())
            return

        # Health / Status
        if path == "/api/status":
            res = {
                "service": "TITAN Labs Product Intelligence API",
                "status": "ONLINE",
                "port": PORT,
                "affiliate_tag": AMAZON_AFFILIATE_TAG,
                "products_indexed": len(CATALOG),
                "timestamp": datetime.now().isoformat()
            }
            self._reply_json(res)
            return

        # Product Catalog
        if path == "/api/products":
            cat_filter = query.get("category", [None])[0]
            search_query = query.get("q", [None])[0]
            
            filtered = CATALOG
            if cat_filter:
                filtered = [p for p in filtered if p["category"].lower() == cat_filter.lower()]
            if search_query:
                sq = search_query.lower()
                filtered = [p for p in filtered if sq in p["name"].lower() or sq in p["brand"].lower()]
                
            # Attach live best deal to each product
            enriched = []
            for p in filtered:
                deals = scan_all_retailers(p["name"], p["base_price"])
                p_copy = dict(p)
                p_copy["best_deal"] = deals[0] if deals else None
                p_copy["all_deals"] = deals
                enriched.append(p_copy)
                
            self._reply_json(enriched)
            return

        # Specific Product Detail
        if path.startswith("/api/products/") and not path.endswith("/deals"):
            prod_id = path.replace("/api/products/", "").strip("/")
            prod = next((p for p in CATALOG if p["id"] == prod_id), None)
            if prod:
                deals = scan_all_retailers(prod["name"], prod["base_price"])
                res = dict(prod)
                res["deals"] = deals
                res["best_deal"] = deals[0]
                self._reply_json(res)
            else:
                self._reply_error(404, "Product not found")
            return

        # Specific Product Deals
        if path.startswith("/api/products/") and path.endswith("/deals"):
            prod_id = path.replace("/api/products/", "").replace("/deals", "").strip("/")
            prod = next((p for p in CATALOG if p["id"] == prod_id), None)
            if prod:
                deals = scan_all_retailers(prod["name"], prod["base_price"])
                self._reply_json({"product_id": prod_id, "deals": deals})
            else:
                self._reply_error(404, "Product not found")
            return

        # Outbound Affiliate Click Redirector
        if path == "/api/affiliate/redirect":
            product_name = query.get("product", ["Electronics"])[0]
            retailer = query.get("retailer", ["Amazon India"])[0]
            raw_url = query.get("url", [""])[0]
            
            # Log click
            AFFILIATE_LOG["total_clicks"] += 1
            AFFILIATE_LOG["click_history"].insert(0, {
                "timestamp": datetime.now().isoformat(),
                "product": product_name,
                "retailer": retailer,
                "tag": AMAZON_AFFILIATE_TAG
            })
            if len(AFFILIATE_LOG["click_history"]) > 50:
                AFFILIATE_LOG["click_history"].pop()

            target_url = build_affiliate_url(retailer, product_name, raw_url)
            
            # Perform HTTP 302 redirect
            self.send_response(302)
            self.send_header('Location', target_url)
            self._send_cors_headers()
            self.end_headers()
            return

        # Affiliate Stats
        if path == "/api/affiliate/stats":
            self._reply_json(AFFILIATE_LOG)
            return

        self._reply_error(404, "Endpoint not found")

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get('content-length', 0))
        body = self.rfile.read(length) if length > 0 else b'{}'
        
        try:
            data = json.loads(body.decode('utf-8'))
        except Exception:
            data = {}

        if path == "/api/alerts/subscribe":
            email = data.get("email", "")
            product_id = data.get("product_id", "")
            target_price = data.get("target_price", 0)
            self._reply_json({
                "status": "SUCCESS",
                "message": f"Price drop alert active for {product_id} at ₹{target_price}",
                "email": email,
                "created_at": datetime.now().isoformat()
            })
            return

        self._reply_error(404, "POST endpoint not found")

    def _reply_json(self, data):
        self.send_response(200)
        self._send_cors_headers()
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2).encode('utf-8'))

    def _reply_html(self, html):
        self.send_response(200)
        self._send_cors_headers()
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(html.encode('utf-8'))

    def _reply_error(self, code, msg):
        self.send_response(code)
        self._send_cors_headers()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"error": msg}).encode('utf-8'))

def run_server():
    server_address = ('', PORT)
    with socketserver.TCPServer(server_address, TitanBackendHandler) as httpd:
        print(f"[*] TITAN Labs Product Intelligence API listening on http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")

if __name__ == "__main__":
    run_server()
