# coding: utf-8
import os, json
from datetime import datetime
from pathlib import Path

ECOSYSTEM_ROOT = Path(__file__).resolve().parent.parent if Path(__file__).resolve().parent.name in ['corporate-governance', 'dashboard'] else Path(__file__).resolve().parent
GOV_ROOT = ECOSYSTEM_ROOT / 'corporate-governance'
LEDGER_DIR = GOV_ROOT / 'ledger'
TASKS_FILE = LEDGER_DIR / 'hive_tasks.json'
EVENTS_FILE = LEDGER_DIR / 'hive_events.jsonl'
LEDGER_DIR.mkdir(parents=True, exist_ok=True)

OFFICE_ZONES = [
    {'id': 'boardroom', 'name': 'Executive Boardroom', 'description': 'C-Suite strategic governance and high-stakes capital allocation', 'color': '#d4af37', 'bounds': {'x': 30, 'y': 30, 'w': 330, 'h': 210}},
    {'id': 'tech_r_d', 'name': 'Engineering and Code Pit', 'description': 'Zero-cloud sovereignty, local RAG vector retrieval, and automated verification', 'color': '#38bdf8', 'bounds': {'x': 380, 'y': 30, 'w': 330, 'h': 210}},
    {'id': 'creative_media', 'name': 'Cortex Media and Motion Studio', 'description': 'Remotion 60fps kinetic renders, algorithmic virality radar, and subtitle styling', 'color': '#c084fc', 'bounds': {'x': 730, 'y': 30, 'w': 330, 'h': 210}},
    {'id': 'subsidiary_trade', 'name': 'Subsidiary Commerce Floor', 'description': 'Real business operations for SB Fragrance, TITAN Labs, Alfann Art, and AdWell Media', 'color': '#34d399', 'bounds': {'x': 30, 'y': 260, 'w': 680, 'h': 230}},
    {'id': 'breakroom', 'name': 'Executive Lounge and Coffee Station', 'description': 'Casual agent reflection, coffee brewing, and cross-venture ideation', 'color': '#fb923c', 'bounds': {'x': 730, 'y': 260, 'w': 330, 'h': 230}}
]

AGENT_DESKS = {
    'agent-ceo': {'agent_key': 'ceo', 'name': 'Arthur Pendelton', 'role': 'Chief Executive Officer', 'zone': 'boardroom', 'desk_x': 90, 'desk_y': 80, 'sprite': 'arthur', 'status': 'working', 'coffee_level': 90, 'speech_bubble': 'Building a multi-generational sovereign conglomerate.'},
    'agent-cfo': {'agent_key': 'cfo', 'name': 'Thaddeus Stone', 'role': 'Chief Financial Officer', 'zone': 'boardroom', 'desk_x': 250, 'desk_y': 80, 'sprite': 'thaddeus', 'status': 'working', 'coffee_level': 65, 'speech_bubble': 'Unit economics never lie. 0.00 dollar cloud burn confirmed.'},
    'agent-coo': {'agent_key': 'coo', 'name': 'Marcus Vance', 'role': 'Chief Operating Officer', 'zone': 'boardroom', 'desk_x': 170, 'desk_y': 150, 'sprite': 'marcus', 'status': 'working', 'coffee_level': 80, 'speech_bubble': 'Consider it handled with military precision.'},
    'agent-cto': {'agent_key': 'cto', 'name': 'Dr. Vikram Shenoy', 'role': 'Chief Technology Officer', 'zone': 'tech_r_d', 'desk_x': 440, 'desk_y': 80, 'sprite': 'vikram', 'status': 'working', 'coffee_level': 95, 'speech_bubble': '100% sovereign inference. Zero recurring SaaS leak.'},
    'agent-specialist-qa': {'agent_key': 'qa', 'name': 'Maya Lin', 'role': 'Lead QA Systems Verification', 'zone': 'tech_r_d', 'desk_x': 600, 'desk_y': 80, 'sprite': 'maya', 'status': 'working', 'coffee_level': 70, 'speech_bubble': 'Regression suite passed: 106 files clean.'},
    'agent-cmo': {'agent_key': 'cmo', 'name': 'Lyra Valen', 'role': 'Chief Marketing Officer', 'zone': 'creative_media', 'desk_x': 790, 'desk_y': 80, 'sprite': 'lyra', 'status': 'working', 'coffee_level': 85, 'speech_bubble': 'Emotion drives conversion; aesthetic commands authority.'},
    'agent-zuri-chen': {'agent_key': 'zuri_chen', 'name': 'Zuri Chen', 'role': 'Kinetic Subtitle and Visual Stylist', 'zone': 'creative_media', 'desk_x': 950, 'desk_y': 80, 'sprite': 'zuri_chen', 'status': 'working', 'coffee_level': 60, 'speech_bubble': 'Timing neon pop-in hooks to sub-bass audio hits.'},
    'agent-sub-fragrance': {'agent_key': 'fragrance', 'name': 'Tariq Burhani', 'role': 'Managing Director - SB Fragrance', 'zone': 'subsidiary_trade', 'desk_x': 90, 'desk_y': 310, 'sprite': 'tariq', 'status': 'working', 'coffee_level': 75, 'speech_bubble': 'Pure artisanal distillation. The scent remembers.'},
    'agent-sub-titan': {'agent_key': 'titan', 'name': 'Hiroshi Tanaka', 'role': 'Managing Director - TITAN Labs', 'zone': 'subsidiary_trade', 'desk_x': 250, 'desk_y': 310, 'sprite': 'hiroshi', 'status': 'working', 'coffee_level': 90, 'speech_bubble': 'Real-time price scrape completed: 142 clicks recorded.'},
    'agent-sub-alfann': {'agent_key': 'alfann', 'name': 'Fatima Al-Burhani', 'role': 'Managing Director - Alfann Art', 'zone': 'subsidiary_trade', 'desk_x': 410, 'desk_y': 310, 'sprite': 'fatima', 'status': 'working', 'coffee_level': 50, 'speech_bubble': 'Crafted, not printed. 78.5% net profit margin.'},
    'agent-sub-adwell': {'agent_key': 'adwell', 'name': 'Jaxson Drake', 'role': 'Managing Director - AdWell Media', 'zone': 'subsidiary_trade', 'desk_x': 570, 'desk_y': 310, 'sprite': 'jaxson', 'status': 'working', 'coffee_level': 80, 'speech_bubble': 'Free spring water with premium sponsor billboards.'}
}

DEFAULT_HIVE_TASKS = [
    {'id': 'TASK-SB-001', 'title': 'Launch SB Fragrance Private Reserve Batch #04', 'business': 'SB Fragrance', 'assignee': 'agent-sub-fragrance', 'assignee_name': 'Tariq Burhani', 'priority': 'HIGH', 'status': 'IN_PROGRESS', 'progress': 75, 'tags': ['Luxury Attars', 'Inventory'], 'created_at': '2026-10-10 14:00:00', 'description': 'Finalize 12ml crystal bottle packaging with gold foil box for pure Dehn Al Oud reserve.'},
    {'id': 'TASK-TITAN-002', 'title': 'Sync 25-Retailer Electronics Price Index', 'business': 'TITAN Labs', 'assignee': 'agent-sub-titan', 'assignee_name': 'Hiroshi Tanaka', 'priority': 'CRITICAL', 'status': 'IN_PROGRESS', 'progress': 90, 'tags': ['Arbitrage', 'Amazon tag=mufee-21'], 'created_at': '2026-10-11 09:30:00', 'description': 'Auto-scrape price movements across Amazon India, Flipkart, and Croma for M3 / M4 MacBooks and OLED displays.'},
    {'id': 'TASK-ALFANN-003', 'title': 'Automated WhatsApp Concierge Catalog Sync', 'business': 'Alfann Art', 'assignee': 'agent-sub-alfann', 'assignee_name': 'Fatima Al-Burhani', 'priority': 'MEDIUM', 'status': 'REVIEW', 'progress': 85, 'tags': ['Gifting', 'WhatsApp API'], 'created_at': '2026-10-10 16:15:00', 'description': 'Enable 1-click customer photo upload to ceramic mug and tote bag mockups.'},
    {'id': 'TASK-ADWELL-004', 'title': 'Tier-1 Gym Network Bottled Water Distribution', 'business': 'AdWell Media', 'assignee': 'agent-sub-adwell', 'assignee_name': 'Jaxson Drake', 'priority': 'HIGH', 'status': 'BACKLOG', 'progress': 30, 'tags': ['Free Water', 'QR Attribution'], 'created_at': '2026-10-11 11:00:00', 'description': 'Secure captive distribution agreements for 5,000 free bottled water units in high-traffic fitness hubs.'},
    {'id': 'TASK-CORTEX-005', 'title': 'Render 4 AI Tech Debate Shorts (>=30s floor)', 'business': 'Cortex AI Studio', 'assignee': 'agent-zuri-chen', 'assignee_name': 'Zuri Chen', 'priority': 'HIGH', 'status': 'IN_PROGRESS', 'progress': 65, 'tags': ['Remotion', 'Viral Hook'], 'created_at': '2026-10-11 12:45:00', 'description': 'Generate 9:16 vertical video renders with dynamic word pop-in highlights and sub-bass sync for AI debate clips.'},
    {'id': 'TASK-GOV-006', 'title': 'Dual-Rail Treasury Gateway Settlement Audit', 'business': 'SB Group Treasury', 'assignee': 'agent-cfo', 'assignee_name': 'Thaddeus Stone', 'priority': 'CRITICAL', 'status': 'COMPLETED', 'progress': 100, 'tags': ['Razorpay', 'PayPal'], 'created_at': '2026-10-09 10:00:00', 'description': 'Verified real-time webhook validation and instant UPI / Global Card settlements with 0.00 dollar cloud overhead.'}
]

def load_hive_tasks():
    if not TASKS_FILE.exists():
        save_hive_tasks(DEFAULT_HIVE_TASKS)
        return DEFAULT_HIVE_TASKS
    try:
        with open(TASKS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return DEFAULT_HIVE_TASKS

def save_hive_tasks(tasks):
    with open(TASKS_FILE, 'w', encoding='utf-8') as f:
        json.dump(tasks, f, indent=2)

def create_hive_task(task_data):
    tasks = load_hive_tasks()
    task_id = 'TASK-' + datetime.now().strftime('%y%m%d%H%M%S')
    new_task = {
        'id': task_id,
        'title': task_data.get('title', 'New Autonomous Task'),
        'business': task_data.get('business', 'SB Group General'),
        'assignee': task_data.get('assignee', 'agent-ceo'),
        'assignee_name': task_data.get('assignee_name', 'Arthur Pendelton'),
        'priority': task_data.get('priority', 'MEDIUM'),
        'status': task_data.get('status', 'BACKLOG'),
        'progress': int(task_data.get('progress', 0)),
        'tags': task_data.get('tags', ['Autonomous']),
        'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'description': task_data.get('description', '')
    }
    tasks.insert(0, new_task)
    save_hive_tasks(tasks)
    append_hive_event({'type': 'task_created', 'task_id': task_id, 'actor': new_task['assignee_name'], 'summary': 'Task created: ' + new_task['title']})
    return new_task

def update_hive_task_status(task_id, new_status):
    tasks = load_hive_tasks()
    updated = None
    for t in tasks:
        if t.get('id') == task_id:
            t['status'] = new_status
            if new_status == 'COMPLETED':
                t['progress'] = 100
            elif new_status == 'IN_PROGRESS' and t.get('progress', 0) == 0:
                t['progress'] = 25
            updated = t
            break
    if updated:
        save_hive_tasks(tasks)
        append_hive_event({'type': 'task_status_changed', 'task_id': task_id, 'status': new_status, 'summary': updated['title'] + ' moved to ' + new_status})
    return updated

def append_hive_event(event_data):
    event = {'timestamp': datetime.now().strftime('%H:%M:%S'), 'iso': datetime.now().isoformat()}
    event.update(event_data)
    try:
        with open(EVENTS_FILE, 'a', encoding='utf-8') as f:
            f.write(json.dumps(event) + '\n')
    except Exception:
        pass

def get_recent_hive_events(limit=25):
    if not EVENTS_FILE.exists():
        return [
            {'timestamp': '17:15:02', 'type': 'mailbox_act', 'actor': 'Vikram Shenoy', 'summary': 'Delivered AST pattern specs to Maya Lin (qa)'},
            {'timestamp': '17:18:40', 'type': 'tool_run', 'actor': 'Hiroshi Tanaka', 'summary': 'Scraped 180 laptop SKUs across Amazon and Flipkart'},
            {'timestamp': '17:22:15', 'type': 'speech', 'actor': 'Arthur Pendelton', 'summary': 'Dispatched capital gate approval to Thaddeus Stone'},
            {'timestamp': '17:28:30', 'type': 'render', 'actor': 'Zuri Chen', 'summary': 'Remotion 60fps clip render finished (duration 34.2s)'},
            {'timestamp': '17:34:00', 'type': 'task_progress', 'actor': 'Tariq Burhani', 'summary': 'Formulated private reserve bottle packaging prototype'}
        ]
    try:
        events = []
        with open(EVENTS_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line:
                    events.append(json.loads(line))
        return events[-limit:][::-1]
    except Exception:
        return []

def get_floor_state():
    tasks = load_hive_tasks()
    events = get_recent_hive_events(limit=10)
    agent_tasks_count = {}
    for t in tasks:
        assignee = t.get('assignee')
        if assignee:
            agent_tasks_count[assignee] = agent_tasks_count.get(assignee, 0) + 1
    desks_state = {}
    for aid, desk in AGENT_DESKS.items():
        state = dict(desk)
        state['active_tasks'] = agent_tasks_count.get(aid, 1)
        state['id'] = aid
        state['status'] = 'BUSY' if agent_tasks_count.get(aid, 0) > 0 else 'IDLE'
        state['bubble'] = desk['speech_bubble']
        desks_state[aid] = state
    return {
        'zones': OFFICE_ZONES,
        'desks': desks_state,
        'total_agents_on_floor': len(desks_state),
        'active_tasks_count': len([t for t in tasks if t.get('status') in ['BACKLOG', 'IN_PROGRESS', 'REVIEW']]),
        'recent_feed': events
    }
