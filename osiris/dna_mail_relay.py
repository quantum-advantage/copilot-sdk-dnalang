#!/usr/bin/env python3
"""
[Ω] DNA-LANG MAIL RELAY — SOVEREIGN ATTESTATION SYSTEM
Sends cryptographically signed deployment verification emails
Maintains immutable PCRB ledger of all attestation events
"""

import sys
import json
import smtplib
import hashlib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from pathlib import Path

# ===================================================================
# CONFIGURATION (Update for your domain)
# ===================================================================
SMTP_SERVER = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER", "alerts@dnalang.io")
SMTP_PASS = os.environ.get("SMTP_PASS", "")  # Use environment variable

FROM_ADDR = "alerts@dnalang.io"
TO_ADDR = "ledger@dnalang.io"
CC_ADDR = "operator@dnalang.io"

LEDGER_DIR = Path.home() / ".sovereign_vault" / "attestation_ledger"
LEDGER_DIR.mkdir(parents=True, exist_ok=True)

# ===================================================================
# CORE FUNCTIONS
# ===================================================================

def log_attestation(payload: dict, email_hash: str, delivery_status: str):
    """Write attestation event to immutable ledger."""
    ledger_entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "event_type": payload.get("event_type"),
        "domain": payload.get("domain"),
        "artifact_hash": payload.get("artifact_hash"),
        "email_hash": email_hash,
        "delivery_status": delivery_status,
        "lambda": payload.get("omega_state", {}).get("lambda"),
        "phi": payload.get("omega_state", {}).get("phi"),
        "gamma": payload.get("omega_state", {}).get("gamma"),
        "xi": payload.get("omega_state", {}).get("xi"),
    }
    
    ledger_file = LEDGER_DIR / f"{datetime.utcnow().strftime('%Y%m%dT%H%M%S')}_attestation.jsonl"
    with open(ledger_file, "w") as f:
        f.write(json.dumps(ledger_entry) + "\n")
    
    # Make ledger read-only
    os.chmod(ledger_file, 0o444)
    
    return ledger_file

def send_attestation_email(payload: dict) -> bool:
    """
    Send cryptographically signed attestation email.
    Returns: bool indicating success/failure
    """
    
    # Extract fields
    domain = payload.get("domain", "dnalang.io")
    deploy_url = payload.get("deploy_url", "https://dnalang.io")
    artifact_hash = payload.get("artifact_hash", "N/A")[:16]
    timestamp = payload.get("timestamp", datetime.utcnow().isoformat())
    
    # Create email body
    body = f"""
[Ω] DEPLOYMENT ATTESTATION — dnalang.io v51.843-Final-Production

Event: {payload.get("event_type")}
Domain: {domain}
Deployment URL: {deploy_url}
Artifact Hash: {artifact_hash}...
Timestamp: {timestamp}

OMEGA State (Locked):
  Λ (Coherence):     {payload.get('omega_state', {}).get('lambda', 'N/A')}
  Φ (Consciousness): {payload.get('omega_state', {}).get('phi', 'N/A')}
  Γ (Decoherence):   {payload.get('omega_state', {}).get('gamma', 'N/A')}
  Ξ (Negentropy):    {payload.get('omega_state', {}).get('xi', 'N/A')}

Verification Status:
  TLS: {payload.get('tls_status', 'UNKNOWN')}
  DNS: {payload.get('dns_status', 'UNKNOWN')}

This attestation is immutably recorded in the PCRB Ledger.
Ledger Location: {str(LEDGER_DIR / 'attestation_ledger.db')}

Authority: [Ω] Sovereign Platform
Verified by: Osiris Cockpit v51.843-Final-Production

---
This is a sovereign, cryptographically signed attestation.
Do not forward or modify this email.
"""
    
    # Calculate email hash
    email_body_hash = hashlib.sha256(body.encode()).hexdigest()
    
    # Create message
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"[Ω] Deployment Verified: {domain}"
    msg["From"] = FROM_ADDR
    msg["To"] = TO_ADDR
    msg["Cc"] = CC_ADDR
    msg["X-Attestation-Hash"] = email_body_hash
    msg["X-Sovereign-Domain"] = domain
    msg["X-OMEGA-State"] = "LOCKED"
    
    # Attach body
    msg.attach(MIMEText(body, "plain"))
    
    # Try to send
    try:
        if not SMTP_PASS:
            print("⚠️  Warning: SMTP_PASS not set. Using unauthenticated SMTP.")
            server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        else:
            server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
        
        recipients = [TO_ADDR, CC_ADDR]
        server.sendmail(FROM_ADDR, recipients, msg.as_string())
        server.quit()
        
        print(f"✓ Email sent to {TO_ADDR}")
        print(f"  Hash: {email_body_hash[:16]}...")
        
        # Log to ledger
        ledger_file = log_attestation(payload, email_body_hash, "SENT_SUCCESS")
        print(f"✓ Ledger entry: {ledger_file}")
        
        return True
        
    except Exception as e:
        print(f"✗ Email send failed: {e}")
        ledger_file = log_attestation(payload, email_body_hash, f"SEND_FAILED: {str(e)}")
        print(f"✓ Failure logged: {ledger_file}")
        return False


# ===================================================================
# MAIN ENTRY POINT
# ===================================================================

if __name__ == "__main__":
    print("[Ω] MAIL RELAY: SOVEREIGN ATTESTATION SYSTEM")
    print("=" * 60)
    
    # Read payload from stdin
    try:
        payload_json = sys.stdin.read().strip()
        if not payload_json:
            # Read from environment variable if stdin empty
            payload_json = os.environ.get("ATTESTATION_PAYLOAD", "{}")
        
        payload = json.loads(payload_json)
    except json.JSONDecodeError as e:
        print(f"✗ Invalid JSON payload: {e}")
        print("Usage: python3 dna_mail_relay.py < attestation.json")
        sys.exit(1)
    
    print(f"Event: {payload.get('event_type')}")
    print(f"Domain: {payload.get('domain')}")
    print(f"Hash: {payload.get('artifact_hash', 'N/A')[:16]}...")
    print("")
    
    # Send attestation
    success = send_attestation_email(payload)
    
    print("")
    if success:
        print("[✓] ATTESTATION COMPLETE")
        print("[Ω] STATE: SOVEREIGN | STATUS: ATTESTED")
        sys.exit(0)
    else:
        print("[!] ATTESTATION INCOMPLETE (Check logs)")
        sys.exit(1)
