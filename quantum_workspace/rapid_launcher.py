#!/usr/bin/env python3
"""
RAPID EXPERIMENT LAUNCHER - PARALLEL EXECUTION
Launches multiple experiments simultaneously
"""

import subprocess
import time
import os
from datetime import datetime

experiments = [
    {
        'name': 'Black Hole Statistical Validation',
        'script': 'suite_a_black_hole_validation.py',
        'duration': 75,
        'priority': 1
    },
    {
        'name': 'Geometric Resonance Sweep',
        'script': 'suite_a_resonance_sweep.py',
        'duration': 20,
        'priority': 1
    },
    {
        'name': 'Golden Ratio Resonance',
        'script': 'suite_b_golden_ratio.py',
        'duration': 20,
        'priority': 2
    },
    {
        'name': 'Consciousness Scaling',
        'script': 'suite_a_consciousness_scaling.py',
        'duration': 25,
        'priority': 1
    },
]

print("╔═══════════════════════════════════════════════════════════════╗")
print("║   RAPID EXPERIMENT LAUNCHER - PARALLEL MODE                   ║")
print("╚═══════════════════════════════════════════════════════════════╝\n")

workspace = '/home/devinpd/quantum_workspace'
os.chdir(workspace)

processes = []

for exp in experiments:
    script_path = os.path.join(workspace, exp['script'])
    if not os.path.exists(script_path):
        print(f"⚠️  Skipping {exp['name']}: Script not found")
        continue
    
    log_file = f"{exp['script'].replace('.py', '')}.log"
    
    print(f"🚀 Launching: {exp['name']}")
    print(f"   Script: {exp['script']}")
    print(f"   Duration: ~{exp['duration']} min")
    print(f"   Log: {log_file}")
    
    # Launch in background
    cmd = f"source ~/qenv_mitiq310/bin/activate && python {script_path} > {log_file} 2>&1"
    proc = subprocess.Popen(cmd, shell=True, executable='/bin/bash')
    
    processes.append({
        'name': exp['name'],
        'pid': proc.pid,
        'log': log_file,
        'duration': exp['duration']
    })
    
    print(f"   PID: {proc.pid} ✓\n")
    time.sleep(2)  # Stagger starts

print("="*70)
print(f"LAUNCHED {len(processes)} EXPERIMENTS")
print("="*70)

for p in processes:
    print(f"  [{p['pid']}] {p['name']} → {p['log']}")

print(f"\nMonitor progress: tail -f {workspace}/*.log")
print(f"Time: {datetime.now().strftime('%H:%M:%S')}")
print("\nFramework: DNA::}{::lang v51.843")
