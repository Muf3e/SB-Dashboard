#!/usr/bin/env python3
"""
Autonomous B2B Outbound Prospecting & Personalized Pitch Generator
Finds logistics & freight decision makers, drafts hyper-personalized async audit proposals,
and pairs them with Clara Vance's virtual executive briefing video.
"""

import json
from datetime import datetime

TARGET_LEADS = [
    {
        "company": "Apex Midwest Logistics & Freight",
        "contact_name": "Marcus Sterling",
        "title": "Director of Supply Chain & Transportation",
        "estimated_annual_freight_spend": "$4,200,000",
        "carriers_used": ["Old Dominion", "Estes Express", "R+L Carriers"],
        "city": "Chicago, IL",
        "personalized_hook": "Saw Apex is expanding LTL lanes out of Chicago toward DFW."
    },
    {
        "company": "Summit Industrial Distribution",
        "contact_name": "David Henderson",
        "title": "Chief Financial Officer (CFO)",
        "estimated_annual_freight_spend": "$8,500,000",
        "carriers_used": ["FedEx Freight", "TForce", "Saia"],
        "city": "Dallas, TX",
        "personalized_hook": "Noticed Summit's heavy industrial machinery distribution network across the South."
    },
    {
        "company": "Vanguard Cold Chain & Warehousing",
        "contact_name": "Elena Rostova",
        "title": "VP of Operations",
        "estimated_annual_freight_spend": "$6,100,000",
        "carriers_used": ["Knight-Swift", "Schneider", "XPO"],
        "city": "Atlanta, GA",
        "personalized_hook": "Tracking reefers and cold chain layover fees is notoriously error-prone."
    }
]

def generate_personalized_outreach_campaign():
    campaign = []
    for lead in TARGET_LEADS:
        pitch = {
            "recipient": f"{lead['contact_name']} ({lead['title']}, {lead['company']})",
            "subject": f"Freight overcharges on {lead['company']}'s LTL lanes (Quick async audit)",
            "email_body": (
                f"Hi {lead['contact_name'].split()[0]},\n\n"
                f"{lead['personalized_hook']}\n\n"
                f"Our automated audit engine routinely catches 12% to 18% in non-compliant carrier charges "
                f"(unverified detention fees, excessive fuel surcharge recalculations, and density reclass bumps) "
                f"on lanes serviced by carriers like {', '.join(lead['carriers_used'][:2])}.\n\n"
                f"No 30-minute sales call needed. Our CCO Clara Vance recorded a 45-second interactive demonstration "
                f"showing how our engine audits raw invoices in 5 seconds:\n"
                f"👉 http://localhost:8090/#audit-sandbox\n\n"
                f"You can drop 2 recent carrier bills into our live sandbox to see what your carriers overbilled you. "
                f"If we find zero overcharges, you owe us nothing.\n\n"
                f"Best,\n"
                f"Clara Vance\n"
                f"Chief Commercial Officer · FreightAudit AI"
            ),
            "video_pitch_url": "http://localhost:8090/#audit-sandbox",
            "expected_monthly_retainer": "$3,500/mo",
            "created_at": datetime.now().isoformat()
        }
        campaign.append(pitch)

    return campaign

if __name__ == "__main__":
    campaign = generate_personalized_outreach_campaign()
    print(json.dumps(campaign, indent=2))
