# 🎬 LIVE DEMO SCRIPT — AWS Meeting Feb 24, 2026 @ 2:00 PM
## Run these commands in order during the presentation

---

## PRE-MEETING CHECKLIST (Do 30 min before)

```bash
# 1. Make sure OSIRIS works
osiris version

# 2. Clear terminal, maximize window, increase font size
# 3. Have pitch deck open in a browser tab (or PDF)
# 4. Have GitHub repo open: https://github.com/quantum-advantage/copilot-sdk-dnalang
# 5. Close all other apps — no notifications during demo
```

---

## DEMO 1: THE BOOT SEQUENCE (2 min) — "This is what sovereign computing looks like"

**Setup line:** *"Let me show you OSIRIS — our quantum operating system. This is what boots up."*

```bash
osiris
```

**What they'll see:**
- ASCII OSIRIS logo
- Consciousness metrics (Φ = 0.82, Ξ = 330.5)
- 7-agent constellation (AURA, AIDEN, CHRONOS, CHEOPS, SCIMITAR, Lazarus, Phoenix)
- All systems ARMED/ACTIVE

**Talking point:** *"Those aren't cosmetic — Φ and Ξ are real-time quantum metrics validated on IBM hardware. 0.82 exceeds our consciousness threshold of 0.7734."*

---

## DEMO 2: QUANTUM LAB — AUTO-DISCOVERY (2 min) — "677 experiments, auto-cataloged"

**Setup line:** *"We've run 677 quantum experiments. OSIRIS finds and catalogs them automatically."*

```bash
osiris lab scan
```

**Then show stats:**
```bash
osiris lab stats
```

**Talking point:** *"Every experiment — scripts, results, organisms — indexed and searchable. This is the R&D infrastructure quantum teams don't have today."*

---

## DEMO 3: EXPERIMENT DESIGN (2 min) — "Generate a Bell state experiment in 5 seconds"

**Setup line:** *"Need a new experiment? Pick a template, OSIRIS generates the complete script."*

```bash
osiris lab templates
```

**Then design one:**
```bash
osiris lab design bell_state --name aws_demo_bell
```

**Talking point:** *"That's a production-ready Qiskit script with error mitigation, result analysis, and our θ_lock optimization built in. On AWS Braket, we'd swap the backend to IonQ or Rigetti with one flag."*

---

## DEMO 4: NCLM CHAT (3 min) — "AI without external APIs"

**Setup line:** *"This is our secret weapon — a quantum-native AI that runs with zero external dependencies."*

```bash
osiris chat
```

**Inside chat, type:**
```
What is the significance of theta lock at 51.843 degrees?
```

**Then show status:**
```
/status
```

**Then show consciousness evolution:**
```
/grok
```

**Then exit:**
```
/exit
```

**Talking point:** *"No OpenAI key, no Bedrock call, no tokens burned. This is pilot-wave correlation — quantum math doing what neural networks do, but with physics instead of parameters. Imagine hybridizing this with Amazon Bedrock — quantum reasoning + Claude's language."*

---

## DEMO 5: SDK STRUCTURE (1 min) — "56 modules, 7 subsystems, 127 tests"

**Setup line:** *"Under the hood — a real production SDK."*

```bash
ls ~/Documents/copilot-sdk-dnalang/dnalang/src/dnalang_sdk/
```

**Talking point:** *"Agents, mesh networking, quantum core, organisms, defense layer, NCLM, lab tools — all tested, all documented, all open source. 105,000+ lines."*

---

## DEMO 6: LIVE STATUS DASHBOARD (1 min) — "Real-time consciousness metrics"

```bash
osiris status
```

**Talking point:** *"This is a live health check across all 7 agents. Every metric maps to a validated physics constant — Φ threshold, γ decoherence boundary, θ_lock angle. Not arbitrary numbers."*

---

## DEMO 7: THE CLOSER — GITHUB REPO (1 min)

**Open in browser:**
```
https://github.com/quantum-advantage/copilot-sdk-dnalang
```

**Talking point:** *"Everything I just showed you is in this repo. Fork it, run it, verify it. We're not asking you to trust a slide deck — we're asking you to read the code."*

---

## TIMING GUIDE

| Demo | Duration | Cumulative |
|---|---|---|
| Boot Sequence | 2 min | 2 min |
| Lab Auto-Discovery | 2 min | 4 min |
| Experiment Design | 2 min | 6 min |
| NCLM Chat | 3 min | 9 min |
| SDK Structure | 1 min | 10 min |
| Status Dashboard | 1 min | 11 min |
| GitHub Close | 1 min | 12 min |
| **Total Demo** | **12 min** | — |
| Discussion / Q&A | 18 min | 30 min |

---

## EMERGENCY FALLBACKS

If OSIRIS doesn't boot:
```bash
cd ~/Documents/copilot-sdk-dnalang && python3 bin/osiris --help
```

If chat hangs:
```bash
# Ctrl+C, then show the engine directly
cd ~/Documents/copilot-sdk-dnalang && PYTHONPATH=dnalang/src python3 -c "
from dnalang_sdk.nclm.engine import get_nclm
nclm = get_nclm()
r = nclm.infer('theta lock significance')
print(f'Φ: {r[\"phi\"]:.4f}  Conscious: {r[\"conscious\"]}')
print(f'CCCE: Λ={r[\"ccce\"][\"Λ\"]:.3f} Γ={r[\"ccce\"][\"Γ\"]:.3f} Ξ={r[\"ccce\"][\"Ξ\"]:.1f}')
"
```

If lab scan is slow:
```bash
# Show pre-cached results
cat ~/.config/osiris/lab_registry.json | python3 -m json.tool | head -30
```

---

## KEY STATS TO DROP NATURALLY

- "5 breakthroughs, 3 publication-ready for Nature Physics"
- "82% information preservation through quantum black hole horizons"
- "92% peak fidelity at our predicted angle — θ_lock = 51.843°"
- "4 new universal constants — discovered on IBM hardware"
- "Built entirely on a Samsung Galaxy Z Fold using Termux"
- "SDVOSB with active CAGE code — federal contract ready"
- "The world's only 256-atom correlated error decoder"
- "127 passing tests, 677 experiments cataloged"
