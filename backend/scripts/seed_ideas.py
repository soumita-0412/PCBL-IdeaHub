#!/usr/bin/env python3
"""
Seed script — inserts 13 dummy idea documents into MongoDB.

Run from the backend/ directory:
    python scripts/seed_ideas.py

Requires: pymongo  (pip install pymongo)
Uses the connection string from backend/.env (falls back to localhost:27017).
"""

import os
import sys
from datetime import datetime, timezone
from pathlib import Path

# ---------------------------------------------------------------------------
# Load .env so MONGODB_URL / MONGODB_DATABASE are picked up if present
# ---------------------------------------------------------------------------
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, _, v = line.partition("=")
            os.environ.setdefault(k.strip(), v.strip())

MONGODB_URL = os.environ.get("MONGODB_URL", "mongodb://localhost:27017")
MONGODB_DATABASE = os.environ.get("MONGODB_DATABASE", "ideas_portal")

try:
    from pymongo import MongoClient
except ImportError:
    sys.exit("pymongo not installed — run: pip install pymongo")

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def now() -> datetime:
    return datetime.now(timezone.utc)


def dt(year: int, month: int, day: int, hour: int = 9, minute: int = 0) -> datetime:
    return datetime(year, month, day, hour, minute, 0, tzinfo=timezone.utc)


# ---------------------------------------------------------------------------
# Idea documents
# ---------------------------------------------------------------------------
IDEAS = [
    {
        "submission_number": "IDEA-00001",
        "submitter_id": "EMP_SOUMITA",
        "submitter_name": "Soumita Biswas",
        "submitter_email": "soumita.biswas@rpsg.in",
        "category": "Cost Optimization",
        "idea_title": "Automated Procurement Approval Workflow",
        "problem": "Manual purchase order approvals take 3-5 business days, causing supply chain delays and increasing expedited shipping costs by approx. 18% annually.",
        "idea_description": "Implement a rules-based digital approval workflow that auto-approves POs below ₹50,000 and routes higher-value orders to the right approver tier in real time. Integration with SAP would eliminate paper-based steps and email back-and-forth, reducing cycle time to under 4 hours for 80% of orders.",
        "benefit": "Estimated annual saving of ₹12 lakh in expedited freight costs. Frees up ~6 man-hours per week across the procurement team and improves vendor on-time delivery score by targeting a 15% uplift.",
        "patent_search_done": True,
        "patent_link": "https://patents.google.com/?q=procurement+workflow+automation",
        "pcbl_function": "Operations",
        "pcbl_function_other": None,
        "annual_estimate": 1200000.0,
        "additional_info": "Pilot feasible with SAP Fiori in Q3. IT has confirmed API availability.",
        "status": "approved_l2",
        "reviewer_comment": "Strong business case. Approved for implementation planning.",
        "l2_scores": {"feasibility": 4, "impact": 5, "innovation": 3, "alignment": 5},
        "l2_comment": "Excellent ROI. Prioritise SAP integration track.",
        "l2_weighted_score": 4.3,
        "l2_next_step": "Assign project sponsor and kick off detailed design by Oct 2026.",
        "created_at": dt(2026, 1, 10),
        "updated_at": dt(2026, 3, 5),
        "created_by": "EMP_SOUMITA",
        "updated_by": "ADM001",
    },
    {
        "submission_number": "IDEA-00002",
        "submitter_id": "EMP_SOUMITA",
        "submitter_name": "Soumita Biswas",
        "submitter_email": "soumita.biswas@rpsg.in",
        "category": "Cyber Security",
        "idea_title": "Zero-Trust Network Access for Remote Workforce",
        "problem": "Current VPN-based access grants broad network access once authenticated, creating a large blast radius if credentials are compromised. Three phishing incidents in FY25 exposed internal tools.",
        "idea_description": "Replace the legacy VPN with a Zero-Trust Network Access (ZTNA) solution that verifies device health, user identity, and context before granting per-application access. Implement continuous session evaluation with micro-segmentation so lateral movement is blocked even on compromised endpoints.",
        "benefit": "Reduces attack surface by ~70%. Expected to cut incident response cost by ₹8 lakh/year and reduce audit findings related to excessive access. Supports ISO 27001 recertification requirements.",
        "patent_search_done": False,
        "patent_link": None,
        "pcbl_function": "IT",
        "pcbl_function_other": None,
        "annual_estimate": 800000.0,
        "additional_info": "Evaluated Zscaler and Cloudflare Access. Cloudflare preferred for cost.",
        "status": "under_review_l2",
        "reviewer_comment": "Approved at L1. Escalated for L2 strategic review.",
        "l2_scores": None,
        "l2_comment": None,
        "l2_weighted_score": None,
        "l2_next_step": None,
        "created_at": dt(2026, 2, 14),
        "updated_at": dt(2026, 4, 1),
        "created_by": "EMP_SOUMITA",
        "updated_by": "MGR002",
    },
    {
        "submission_number": "IDEA-00003",
        "submitter_id": "EMP_SOUMITA",
        "submitter_name": "Soumita Biswas",
        "submitter_email": "soumita.biswas@rpsg.in",
        "category": "Employee Experience",
        "idea_title": "AI-Powered Onboarding Buddy Chatbot",
        "problem": "New hires spend 40% of their first two weeks hunting for policies, IT setup guides, and HR FAQs across SharePoint, email, and word-of-mouth. Average time-to-productivity is 6 weeks.",
        "idea_description": "Deploy an LLM-based internal chatbot trained on HR policies, IT setup docs, and FAQs. The bot answers onboarding questions 24/7, auto-raises IT tickets, and nudges new hires through a structured 30-60-90 day checklist integrated with the HRMS.",
        "benefit": "Target reduction of time-to-productivity from 6 to 4 weeks (saving ₹1.5 lakh per new hire in lost productivity). HR helpdesk tickets expected to drop 30%, freeing 5 hours/week for strategic HR work.",
        "patent_search_done": True,
        "patent_link": "https://patents.google.com/?q=AI+onboarding+chatbot+employee",
        "pcbl_function": "Human Resources",
        "pcbl_function_other": None,
        "annual_estimate": 600000.0,
        "additional_info": "Pilot group: 20 new hires joining in Oct 2026 batch.",
        "status": "approved_l1",
        "reviewer_comment": "Innovative use of AI for HR. Recommended for L2 review.",
        "l2_scores": None,
        "l2_comment": None,
        "l2_weighted_score": None,
        "l2_next_step": None,
        "created_at": dt(2026, 3, 1),
        "updated_at": dt(2026, 3, 20),
        "created_by": "EMP_SOUMITA",
        "updated_by": "MGR001",
    },
    {
        "submission_number": "IDEA-00004",
        "submitter_id": "EMP_SOUMITA",
        "submitter_name": "Soumita Biswas",
        "submitter_email": "soumita.biswas@rpsg.in",
        "category": "Finance",
        "idea_title": "Real-Time Treasury Dashboard for Cash Visibility",
        "problem": "The finance team reconciles cash positions manually each morning using data from 12 bank accounts across 4 currencies. This takes 2 hours daily and errors have caused two overdraft incidents in the past year.",
        "idea_description": "Build a real-time treasury dashboard that aggregates balances via bank APIs (SFTP/SWIFT MT940), applies FX rates, and displays net liquidity position, 7-day rolling forecast, and threshold alerts. Integrate with SAP Cash Management for seamless posting.",
        "benefit": "Eliminates 2 hours of daily manual reconciliation (saving ~₹3.6 lakh/year in finance staff time). Overdraft risk reduced to near-zero. Faster surplus deployment decisions expected to improve interest income by ₹2 lakh/year.",
        "patent_search_done": False,
        "patent_link": None,
        "pcbl_function": "Finance",
        "pcbl_function_other": None,
        "annual_estimate": 560000.0,
        "additional_info": "SAP treasury module licence already owned. Only integration work needed.",
        "status": "implemented",
        "reviewer_comment": "Approved and fast-tracked. Live since Aug 2026.",
        "l2_scores": {"feasibility": 5, "impact": 4, "innovation": 3, "alignment": 5},
        "l2_comment": "Existing SAP licence makes this a low-cost, high-value win.",
        "l2_weighted_score": 4.2,
        "l2_next_step": "Deployed. Monitor adoption and incident rate for 90 days.",
        "created_at": dt(2026, 1, 20),
        "updated_at": dt(2026, 8, 15),
        "created_by": "EMP_SOUMITA",
        "updated_by": "ADM001",
    },
    {
        "submission_number": "IDEA-00005",
        "submitter_id": "EMP_SOUMITA",
        "submitter_name": "Soumita Biswas",
        "submitter_email": "soumita.biswas@rpsg.in",
        "category": "Operations",
        "idea_title": "Predictive Maintenance for Conveyor Belt Systems",
        "problem": "Unplanned conveyor belt failures cause an average of 14 hours of production downtime per quarter, costing ₹9 lakh in lost output and emergency repair costs.",
        "idea_description": "Install IoT vibration and temperature sensors on the 8 critical conveyor belts and feed data into an ML model that predicts bearing failures 72 hours in advance. Maintenance orders are auto-generated in the CMMS so preventive work is scheduled during planned stoppages.",
        "benefit": "Reduce unplanned downtime by 80%, saving approx. ₹7.2 lakh/year. Extend belt component life by 20%, reducing spare parts spend by ₹1.8 lakh/year. Sensor + cloud cost estimated at ₹2.5 lakh one-time.",
        "patent_search_done": True,
        "patent_link": "https://patents.google.com/?q=predictive+maintenance+conveyor+IoT",
        "pcbl_function": "Manufacturing",
        "pcbl_function_other": None,
        "annual_estimate": 900000.0,
        "additional_info": "Vendor shortlisted: Siemens MindSphere and AWS IoT Greengrass. POC needed.",
        "status": "under_review_l1",
        "reviewer_comment": None,
        "l2_scores": None,
        "l2_comment": None,
        "l2_weighted_score": None,
        "l2_next_step": None,
        "created_at": dt(2026, 5, 3),
        "updated_at": dt(2026, 5, 3),
        "created_by": "EMP_SOUMITA",
        "updated_by": "EMP001",
    },
    {
        "submission_number": "IDEA-00006",
        "submitter_id": "EMP_SOUMITA",
        "submitter_name": "Soumita Biswas",
        "submitter_email": "soumita.biswas@rpsg.in",
        "category": "IT",
        "idea_title": "Self-Service Password Reset via WhatsApp OTP",
        "problem": "The IT helpdesk handles 120+ password reset requests per month. Each call takes 8-10 minutes, consuming ~16 man-hours/month that could be used for higher-value work.",
        "idea_description": "Integrate Active Directory with a WhatsApp Business API flow: the employee initiates a reset via the intranet portal, receives a 6-digit OTP on their registered WhatsApp number, verifies identity, and sets a new password without any agent involvement. Audit log written to SIEM.",
        "benefit": "Eliminates ~16 man-hours/month of L1 support effort (saving ₹1.2 lakh/year). Faster resolution improves employee satisfaction score. Extends self-service capabilities to after-hours use without on-call burden.",
        "patent_search_done": False,
        "patent_link": None,
        "pcbl_function": "IT",
        "pcbl_function_other": None,
        "annual_estimate": 120000.0,
        "additional_info": "WhatsApp Business API account already provisioned for HR communications.",
        "status": "submitted",
        "reviewer_comment": None,
        "l2_scores": None,
        "l2_comment": None,
        "l2_weighted_score": None,
        "l2_next_step": None,
        "created_at": dt(2026, 6, 10),
        "updated_at": dt(2026, 6, 10),
        "created_by": "EMP_SOUMITA",
        "updated_by": "EMP002",
    },
    {
        "submission_number": "IDEA-00007",
        "submitter_id": "EMP_SOUMITA",
        "submitter_name": "Soumita Biswas",
        "submitter_email": "soumita.biswas@rpsg.in",
        "category": "HR",
        "idea_title": "Competency-Mapped Internal Job Board",
        "problem": "Internal mobility is low (< 5% of vacancies filled internally). Employees are unaware of open roles that match their skills, and managers rely only on HR to source internal candidates.",
        "idea_description": "Create an internal job board in the employee portal where all open positions display required competencies mapped to individual skill profiles. The system surfaces matching roles proactively, allows one-click expression of interest, and notifies hiring managers. Skills profiles are maintained by employees and validated by managers during appraisals.",
        "benefit": "Target 20% of vacancies filled internally within 12 months, reducing external recruitment spend by ₹15 lakh/year. Improves retention by providing visible career pathways. Reduces average time-to-fill from 45 to 30 days.",
        "patent_search_done": False,
        "patent_link": None,
        "pcbl_function": "Human Resources",
        "pcbl_function_other": None,
        "annual_estimate": 1500000.0,
        "additional_info": "SuccessFactors module available but unused. Configuration effort only.",
        "status": "rejected_l1",
        "reviewer_comment": "Duplicate initiative — HR digital team already working on this in SuccessFactors. Please coordinate before resubmitting.",
        "l2_scores": None,
        "l2_comment": None,
        "l2_weighted_score": None,
        "l2_next_step": None,
        "created_at": dt(2026, 4, 15),
        "updated_at": dt(2026, 4, 28),
        "created_by": "EMP_SOUMITA",
        "updated_by": "MGR001",
    },
    {
        "submission_number": "IDEA-00008",
        "submitter_id": "EMP_SOUMITA",
        "submitter_name": "Soumita Biswas",
        "submitter_email": "soumita.biswas@rpsg.in",
        "category": "Rubber Business",
        "idea_title": "Silica Dust Monitoring with AI Vision Cameras",
        "problem": "Manual silica dust sampling in the rubber mixing area is done fortnightly, missing transient high-exposure events that occur during batch changes. Two occupational health incidents were reported in FY25.",
        "idea_description": "Deploy AI-powered optical particle counters and ceiling-mounted cameras in the mixing hall. Real-time PM2.5 and PM10 readings are displayed on floor-level dashboards and trigger automated ventilation boost and supervisor alerts when thresholds are breached. Data feeds into the EHS compliance module.",
        "benefit": "Continuous monitoring vs. fortnightly sampling eliminates blind-spot exposure risk. Estimated reduction in occupational health incident cost: ₹20 lakh/year. Supports statutory CPCB compliance and improves EHS audit score.",
        "patent_search_done": True,
        "patent_link": "https://patents.google.com/?q=silica+dust+AI+monitoring+industrial",
        "pcbl_function": "Quality",
        "pcbl_function_other": None,
        "annual_estimate": 2000000.0,
        "additional_info": "ATEX-rated camera models identified. EHS head has provided written support.",
        "status": "approved_l2",
        "reviewer_comment": "Critical safety improvement. Fast-track approved.",
        "l2_scores": {"feasibility": 4, "impact": 5, "innovation": 4, "alignment": 5},
        "l2_comment": "Safety and compliance impact justifies investment. Zero negotiation on timeline.",
        "l2_weighted_score": 4.6,
        "l2_next_step": "Procurement to issue RFQ within 2 weeks. Deployment by Dec 2026.",
        "created_at": dt(2026, 2, 25),
        "updated_at": dt(2026, 5, 10),
        "created_by": "EMP_SOUMITA",
        "updated_by": "ADM001",
    },
    {
        "submission_number": "IDEA-00009",
        "submitter_id": "EMP_SOUMITA",
        "submitter_name": "Soumita Biswas",
        "submitter_email": "soumita.biswas@rpsg.in",
        "category": "Battery Business",
        "idea_title": "Closed-Loop Electrolyte Solvent Recovery System",
        "problem": "NMP solvent used in electrode coating is currently recovered at ~82% efficiency. The remaining 18% is incinerated, costing ₹35 lakh/year in NMP purchases and waste disposal fees.",
        "idea_description": "Install a molecular sieve-based distillation column downstream of the existing condenser to capture residual NMP vapour before the exhaust stream. Recovered solvent is redistilled to battery-grade purity and reinjected into the coating line. A PLC-controlled flow management system maintains recovery targets automatically.",
        "benefit": "Target recovery efficiency of 96%, reducing annual NMP purchases by ₹25 lakh and cutting hazardous waste disposal costs by ₹6 lakh/year. Payback period estimated at 14 months. Carbon footprint reduced by ~40 tCO₂e/year.",
        "patent_search_done": True,
        "patent_link": "https://patents.google.com/?q=NMP+solvent+recovery+battery+electrode",
        "pcbl_function": "Process Technology",
        "pcbl_function_other": None,
        "annual_estimate": 3100000.0,
        "additional_info": "Distillation column vendor: UOP Honeywell. Detailed P&ID available on request.",
        "status": "under_review_l2",
        "reviewer_comment": "Strong technical proposal. Escalated to L2 for capex approval.",
        "l2_scores": {"feasibility": 4, "impact": 5, "innovation": 4, "alignment": 4},
        "l2_comment": "Excellent payback period. Pending CFO sign-off on capex.",
        "l2_weighted_score": 4.3,
        "l2_next_step": "Awaiting CFO approval. Target decision by end of Q3 FY27.",
        "created_at": dt(2026, 3, 18),
        "updated_at": dt(2026, 7, 1),
        "created_by": "EMP_SOUMITA",
        "updated_by": "GRP001",
    },
    {
        "submission_number": "IDEA-00010",
        "submitter_id": "EMP_SOUMITA",
        "submitter_name": "Soumita Biswas",
        "submitter_email": "soumita.biswas@rpsg.in",
        "category": "Specialty Business",
        "idea_title": "Digital Product Passport for Specialty Carbon Black Grades",
        "problem": "Customers in the EU require material traceability under the upcoming Carbon Border Adjustment Mechanism (CBAM). Manually compiling batch certificates, test reports, and CoAs for each shipment takes 3-4 days and causes invoice delays.",
        "idea_description": "Build a digital product passport (DPP) system that auto-generates a QR-coded document bundle per batch — pulling data from the LIMS, ERP, and ESG carbon accounting tool — and makes it available to customers via a secure web portal. Integrates with EDI for customs submission.",
        "benefit": "Reduces shipment documentation turnaround from 3-4 days to under 4 hours. Enables compliance with CBAM requirements from Jan 2027, protecting ₹80 crore of EU export revenue. Improves customer satisfaction NPS by an estimated 12 points.",
        "patent_search_done": False,
        "patent_link": None,
        "pcbl_function": "Legal",
        "pcbl_function_other": None,
        "annual_estimate": 500000.0,
        "additional_info": "EU CBAM reporting mandated from Jan 2027. This is a compliance must-have.",
        "status": "approved_l1",
        "reviewer_comment": "Compliance-driven. High urgency. Escalated to L2 immediately.",
        "l2_scores": None,
        "l2_comment": None,
        "l2_weighted_score": None,
        "l2_next_step": None,
        "created_at": dt(2026, 5, 20),
        "updated_at": dt(2026, 6, 5),
        "created_by": "EMP_SOUMITA",
        "updated_by": "MGR001",
    },
    {
        "submission_number": "IDEA-00011",
        "submitter_id": "EMP_SOUMITA",
        "submitter_name": "Soumita Biswas",
        "submitter_email": "soumita.biswas@rpsg.in",
        "category": "Cost Optimization",
        "idea_title": "Solar Carport Installation at Corporate Campus",
        "problem": "The corporate campus parking lot (350 bays) is unshaded and unused for energy generation. Grid electricity cost has risen 14% YoY and the campus has no on-site renewable capacity.",
        "idea_description": "Install a 500 kWp solar carport structure over the main employee parking area using bifacial panels on a raised steel canopy. The energy feeds into the campus MV grid via a string inverter array with net metering. EV charging points (24 units) are integrated under the canopy.",
        "benefit": "Expected annual generation of 6.5 lakh kWh, offsetting ₹52 lakh in grid electricity cost. EV charging income projected at ₹4 lakh/year. ROI in 6 years; 25-year panel life. Carbon offset: ~520 tCO₂e/year aligned with ESG targets.",
        "patent_search_done": False,
        "patent_link": None,
        "pcbl_function": "Facilities",
        "pcbl_function_other": None,
        "annual_estimate": 5600000.0,
        "additional_info": "DISCOM net metering approval timeline: ~3 months. Structural survey completed.",
        "status": "submitted",
        "reviewer_comment": None,
        "l2_scores": None,
        "l2_comment": None,
        "l2_weighted_score": None,
        "l2_next_step": None,
        "created_at": dt(2026, 7, 8),
        "updated_at": dt(2026, 7, 8),
        "created_by": "EMP_SOUMITA",
        "updated_by": "EMP001",
    },
    {
        "submission_number": "IDEA-00012",
        "submitter_id": "EMP_SOUMITA",
        "submitter_name": "Soumita Biswas",
        "submitter_email": "soumita.biswas@rpsg.in",
        "category": "Employee Experience",
        "idea_title": "Flexible Benefits Wallet — Employee-Directed Perks",
        "problem": "The current benefits package is one-size-fits-all. An engagement survey showed 38% of employees would prefer different benefits than what is provided, reducing perceived value of the total compensation package.",
        "idea_description": "Replace the fixed perks list with a digital benefits wallet. Each employee receives an annual credit allowance to spend across a marketplace of options: health top-ups, gym memberships, childcare vouchers, learning subscriptions, commute allowances, and extra leave buy-back. Unused credits roll over 50% to the next cycle.",
        "benefit": "Improves benefits satisfaction score by a target of 25 percentage points. Retention impact estimated at reducing attrition by 2 percentage points, saving ₹18 lakh/year in recruitment and training costs. Net cost neutral — same total budget, better allocation.",
        "patent_search_done": False,
        "patent_link": None,
        "pcbl_function": "Human Resources",
        "pcbl_function_other": None,
        "annual_estimate": 0.0,
        "additional_info": "FlexBen platform shortlisted: Zeta and Vantage Circle. Legal review of tax implications pending.",
        "status": "under_review_l1",
        "reviewer_comment": None,
        "l2_scores": None,
        "l2_comment": None,
        "l2_weighted_score": None,
        "l2_next_step": None,
        "created_at": dt(2026, 8, 2),
        "updated_at": dt(2026, 8, 2),
        "created_by": "EMP_SOUMITA",
        "updated_by": "EMP002",
    },
    {
        "submission_number": "IDEA-00013",
        "submitter_id": "EMP_SOUMITA",
        "submitter_name": "Soumita Biswas",
        "submitter_email": "soumita.biswas@rpsg.in",
        "category": "Cyber Security",
        "idea_title": "Automated Vulnerability Patch Orchestration Pipeline",
        "problem": "The current patch process is manual and quarterly, leaving critical CVEs open for 60-90 days on average. Two pen-test engagements in FY25 flagged unpatched OS vulnerabilities as critical findings.",
        "idea_description": "Deploy a patch orchestration platform (Ansible + Ivanti) that ingests CVE feeds, scores criticality via CVSS, groups assets by risk tier, and automatically deploys patches to Tier-1 assets within 7 days of release and Tier-2 within 30 days. A staging ring tests patches before production rollout. Dashboards track SLA compliance.",
        "benefit": "Reduces mean-time-to-patch from 75 days to under 7 days for critical CVEs. Eliminates manual effort of 12 hours/month. Expected to clear all critical pen-test findings at next engagement, reducing cyber insurance premium by an estimated ₹6 lakh/year.",
        "patent_search_done": False,
        "patent_link": None,
        "pcbl_function": "IT",
        "pcbl_function_other": None,
        "annual_estimate": 700000.0,
        "additional_info": "Ansible licences already owned. Ivanti POC approved by CISO.",
        "status": "rejected_l2",
        "reviewer_comment": "Approved at L1. Rejected at L2 due to budget freeze in FY26 IT capex.",
        "l2_scores": {"feasibility": 5, "impact": 4, "innovation": 3, "alignment": 3},
        "l2_comment": "Good idea but budget freeze prevents approval this cycle. Resubmit in FY27.",
        "l2_weighted_score": 3.5,
        "l2_next_step": "Submitter advised to resubmit in FY27 budget cycle (April 2027).",
        "created_at": dt(2026, 4, 5),
        "updated_at": dt(2026, 6, 22),
        "created_by": "EMP_SOUMITA",
        "updated_by": "GRP002",
    },
]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> None:
    client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
    try:
        client.admin.command("ping")
    except Exception as exc:
        sys.exit(f"Cannot connect to MongoDB at {MONGODB_URL}: {exc}")

    db = client[MONGODB_DATABASE]
    col = db["ideas"]

    existing = col.count_documents({})
    if existing > 0:
        print(f"Collection already has {existing} document(s).")
        ans = input("Clear and reseed? [y/N] ").strip().lower()
        if ans == "y":
            col.delete_many({})
            print("Cleared existing ideas.")
        else:
            print("Aborted — no changes made.")
            return

    result = col.insert_many(IDEAS)
    print(f"\nInserted {len(result.inserted_ids)} ideas into '{MONGODB_DATABASE}.ideas':\n")
    for idea in IDEAS:
        print(f"  {idea['submission_number']}  [{idea['status']:20s}]  {idea['idea_title']}")
    print()


if __name__ == "__main__":
    main()
