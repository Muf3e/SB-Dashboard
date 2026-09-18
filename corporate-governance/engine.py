import sys
sys.stdout.reconfigure(encoding='utf-8')
import os
import sys
import json
import argparse
import urllib.request
import urllib.error
from datetime import datetime
from pathlib import Path

GOV_ROOT = Path(r"C:\AI_Ecosystem\corporate-governance")
SUBS_DIR = GOV_ROOT / "subsidiaries"
LEDGER_FILE = GOV_ROOT / "ledger" / "board_ledger.json"
BRIEFINGS_DIR = GOV_ROOT / "briefings"
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "qwen2.5-coder:7b-instruct"

def load_ledger():
    if not LEDGER_FILE.exists():
        return {"conglomerate": "Global Enterprise AI Holdings", "directives": [], "decision_gates": []}
    with open(LEDGER_FILE, "r", encoding="utf-8-sig") as f:
        return json.load(f)

def save_ledger(data):
    with open(LEDGER_FILE, "w", encoding="utf-8-sig") as f:
        json.dump(data, f, indent=2)

def load_subsidiaries():
    subs = []
    if SUBS_DIR.exists():
        for p in SUBS_DIR.glob("*.json"):
            try:
                with open(p, "r", encoding="utf-8-sig") as f:
                    subs.append(json.load(f))
            except Exception:
                pass
    return sorted(subs, key=lambda x: x.get("id", ""))

def query_ollama(prompt: str) -> str:
    try:
        payload = json.dumps({
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False
        }).encode("utf-8")
        req = urllib.request.Request(
            OLLAMA_URL,
            data=payload,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=180) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data.get("response", "").strip()
    except Exception as e:
        return f"[Ollama Offline / Standby Notice]: {str(e)}"

def cmd_org_chart():
    print("""
========================================================================================
                      🏛️ GLOBAL ENTERPRISE AI HOLDINGS
                         CONGLOMERATE ORGANIZATIONAL CHART
========================================================================================

                            [ CHAIRPERSON OF THE BOARD ]
                                  (Executive User)
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
     [ STRATEGIC VETO & GATES ]                      [ EXECUTIVE APPOINTMENTS ]
                 │                                               │
                 └───────────────────────┬───────────────────────┘
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │      GLOBAL EXECUTIVE COMMITTEE       │
                     │  CEO • CTO • CMO • COO • CFO Agents   │
                     │  Advisory: Karpathy LLM-Council       │
                     └───────────────────┬───────────────────┘
                                         │
         ┌───────────────┬───────────────┼───────────────┬───────────────┐
         ▼               ▼               ▼               ▼               ▼
 ┌───────────────┐┌───────────────┐┌───────────────┐┌───────────────┐┌───────────────┐
 │  SUB-01       ││  SUB-02       ││  SUB-03       ││  SUB-04       ││  SUB-05       │
 │  TITAN Labs   ││  Media Agency ││ Ecosystem Hub ││  Incubator    ││ Quant/Trading │
 ├───────────────┤├───────────────┤├───────────────┤├───────────────┤├───────────────┤
 │ MD: Product   ││ MD: Creative  ││ MD: Systems   ││ MD: Venture   ││ MD: Market    │
 │ Intelligence  ││ & Motion      ││ & Tooling     ││ Innovation    ││ Intelligence  │
 │ (Consumer AI) ││ (Video/Avatar)││ (46 Repos)    ││ (New SaaS)    ││ (Quant/Bots)  │
 └───────┬───────┘└───────┬───────┘└───────┬───────┘└───────┬───────┘└───────┬───────┘
         ▼               ▼               ▼               ▼               ▼
   [Eng & RAG Pod] [Motion/HeyGen] [Plugin Curators][Fast Prototypes][Quant & Bots]
========================================================================================
""")
    subs = load_subsidiaries()
    print("ACTIVE SUBSIDIARY DIVISIONS:")
    for s in subs:
        print(f"  • [{s.get('id')}] {s.get('name')} — {s.get('focus')}")
        print(f"    Managing Director: {s.get('managing_director')} | Status: {s.get('status')}")
        print(f"    Key Assets: {', '.join(s.get('key_assets', [])[:2])}")
        print()

def cmd_briefing():
    subs = load_subsidiaries()
    ledger = load_ledger()
    print(f"\n[C-Suite Engine] Compiling intelligence from all {len(subs)} subsidiary divisions...")
    
    context = f"""
Conglomerate: {ledger.get('conglomerate')}
Chairperson: {ledger.get('chairperson')}
Active Subsidiaries ({len(subs)}):
"""
    for s in subs:
        context += f"- {s.get('name')} ({s.get('id')}): {s.get('focus')}. Status: {s.get('status')}\n"
    
    context += f"\nActive Directives: {len(ledger.get('directives', []))}\n"
    for d in ledger.get('directives', []):
        context += f"- [{d.get('directive_id')}] {d.get('title')} ({d.get('target')}): {d.get('status')}\n"
        
    context += f"\nPending Decision Gates: {len([g for g in ledger.get('decision_gates', []) if 'PENDING' in g.get('status', '')])}\n"
    for g in ledger.get('decision_gates', []):
        if "PENDING" in g.get("status", ""):
            context += f"- [{g.get('gate_id')}] {g.get('title')} ({g.get('urgency')}): {g.get('description')}\n"
            
    sub_names = ", ".join(s.get('name', '') for s in subs)
    prompt = f"""You are the Chief Executive Officer (CEO) of Global Enterprise AI Holdings, presenting a concise, high-level executive briefing to the Chairperson of the Board (the user).
Context:
{context}

Format your briefing with:
1. EXECUTIVE SUMMARY (State of the Conglomerate)
2. SUBSIDIARY HIGHLIGHTS ({sub_names})
3. PENDING CHAIRPERSON DECISION GATES (Items requiring Board approval)
4. C-SUITE RECOMMENDATIONS FOR TODAY

Tone: Ultra-professional, concise, strategic, commanding. Direct address to 'Madam/Mister Chairperson'.
"""
    print("[C-Suite Engine] Synthesizing executive briefing via local Ollama (qwen2.5-coder:7b-instruct)...")
    response = query_ollama(prompt)
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    file_ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    full_output = f"""
========================================================================================
             🏛️ CHAIRPERSON EXECUTIVE BRIEFING — {timestamp}
========================================================================================

{response}

========================================================================================
"""
    print(full_output)
    
    # Save to briefings
    save_path = BRIEFINGS_DIR / f"briefing_{file_ts}.md"
    with open(save_path, "w", encoding="utf-8-sig") as f:
        f.write(full_output)
    print(f"📁 Archived briefing to: {save_path}\n")

def cmd_direct(venture: str, title: str, mandate: str):
    ledger = load_ledger()
    dir_id = f"DIR-{len(ledger.get('directives', [])) + 1:03d}"
    new_dir = {
        "directive_id": dir_id,
        "timestamp": datetime.now().isoformat(),
        "target": venture,
        "title": title,
        "mandate": mandate,
        "status": "ISSUED",
        "signed_by": "Chairperson"
    }
    ledger["directives"].append(new_dir)
    save_ledger(ledger)
    print(f"\n✔ Chairperson Strategic Directive [{dir_id}] successfully issued!")
    print(f"  Target:  {venture}")
    print(f"  Title:   {title}")
    print(f"  Mandate: {mandate}")
    print(f"  Status:  LOGGED & DISPATCHED TO C-SUITE\n")

def cmd_gates():
    ledger = load_ledger()
    gates = ledger.get("decision_gates", [])
    print(f"\n=== 🏛️ Conglomerate Decision Gates ({len(gates)} Total) ===")
    for g in gates:
        status_color = "⏳" if "PENDING" in g.get("status", "") else "✔"
        print(f"{status_color} [{g.get('gate_id')}] {g.get('title')}")
        print(f"    Proposer:    {g.get('proposer')} ({g.get('business_unit')})")
        print(f"    Urgency:     {g.get('urgency')}")
        print(f"    Status:      {g.get('status')}")
        print(f"    Description: {g.get('description')}\n")

def cmd_approve(gate_id: str):
    ledger = load_ledger()
    found = False
    for g in ledger.get("decision_gates", []):
        if g.get("gate_id").upper() == gate_id.upper():
            g["status"] = "APPROVED_BY_CHAIRPERSON"
            g["approved_at"] = datetime.now().isoformat()
            found = True
            print(f"\n✔ Decision Gate [{gate_id}] APPROVED by Chairperson of the Board.")
            print(f"  Notification dispatched to {g.get('proposer')}.\n")
            break
    if not found:
        print(f"\n✖ Error: Gate [{gate_id}] not found in ledger.")
    else:
        save_ledger(ledger)

def cmd_status():
    subs = load_subsidiaries()
    ledger = load_ledger()
    print(f"\n=================================================================")
    print(f"  🏛️ {ledger.get('conglomerate').upper()} — EXECUTIVE STATUS")
    print(f"=================================================================")
    print(f"  Chairperson:             {ledger.get('chairperson')}")
    print(f"  Active Subsidiaries:     {len(subs)}")
    print(f"  Total Directives Issued: {len(ledger.get('directives', []))}")
    pending_gates = sum(1 for g in ledger.get('decision_gates', []) if 'PENDING' in g.get('status', ''))
    print(f"  Pending Decision Gates:  {pending_gates}")
    print(f"-----------------------------------------------------------------")
    for s in subs:
        print(f"  [{s.get('id')}] {s.get('name'):<32} | {s.get('status')}")
    print(f"=================================================================\n")

def main():
    parser = argparse.ArgumentParser(description="Corporate Governance Engine for AI Holdings")
    parser.add_argument("--org-chart", action="store_true", help="Display corporate hierarchy")
    parser.add_argument("--briefing", action="store_true", help="Generate C-Suite executive briefing")
    parser.add_argument("--status", action="store_true", help="Display overall conglomerate status")
    parser.add_argument("--gates", action="store_true", help="List decision gates awaiting approval")
    parser.add_argument("--direct", nargs=3, metavar=("VENTURE", "TITLE", "MANDATE"), help="Issue strategic directive")
    parser.add_argument("--approve", metavar="GATE_ID", help="Approve a decision gate")
    args = parser.parse_args()

    if args.org_chart:
        cmd_org_chart()
    elif args.briefing:
        cmd_briefing()
    elif args.status:
        cmd_status()
    elif args.gates:
        cmd_gates()
    elif args.direct:
        cmd_direct(args.direct[0], args.direct[1], args.direct[2])
    elif args.approve:
        cmd_approve(args.approve)
    else:
        cmd_status()

if __name__ == "__main__":
    main()


