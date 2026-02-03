#!/usr/bin/env python3
"""
HARDWARE JOB STATUS CHECKER
Checks status of 5 jobs submitted to ibm_fez (156 qubits)
"""

from qiskit_ibm_runtime import QiskitRuntimeService
import json
from datetime import datetime

print("="*70)
print("HARDWARE JOB STATUS - IBM QUANTUM ibm_fez (156 qubits)")
print("="*70)

# Load job IDs
try:
    with open('/home/devinpd/quantum_workspace/hardware_127_jobs.json', 'r') as f:
        job_data = json.load(f)
        job_ids = job_data.get('job_ids', [])
        if not job_ids:
            # Extract from jobs list
            job_ids = [job['job_id'] for job in job_data.get('jobs', [])]
except:
    job_ids = [
        'd5vonlruf71s73citjug',  # n=4
        'd5vonm2bju6s73bc3o0g',  # n=6
        'd5vonm9mvbjc73acmje0',  # n=8
        'd5vonmjuf71s73citjvg',  # n=10
        'd5vonmhmvbjc73acmjf0'   # n=12
    ]

print(f"\nChecking {len(job_ids)} jobs...\n")

# Connect to IBM Quantum
service = QiskitRuntimeService(channel="ibm_quantum_platform")

results_summary = []

for i, job_id in enumerate(job_ids):
    n_qubits = [4, 6, 8, 10, 12][i]
    
    try:
        job = service.job(job_id)
        status = job.status()
        status_str = str(status) if not hasattr(status, 'name') else status.name
        
        print(f"Job {i+1}/5: {job_id}")
        print(f"  n={n_qubits} qubits")
        print(f"  Status: {status_str}")
        
        job_info = {
            "job_id": job_id,
            "n_qubits": n_qubits,
            "status": status_str
        }
        
        if status_str == "DONE" or (hasattr(status, 'name') and status.name == "DONE"):
            print(f"  ✅ COMPLETE - Retrieving results...")
            
            try:
                result = job.result()
                
                # Handle PrimitiveResult (Sampler V2 API)
                if hasattr(result, '__len__') and len(result) > 0:
                    # PrimitiveResult returns a list-like object
                    pub_result = result[0]
                    counts = pub_result.data.meas.get_counts()
                else:
                    # Legacy API
                    counts = result.get_counts()
                
                # Compute basic statistics
                total_shots = sum(counts.values())
                print(f"  Total shots: {total_shots}")
                print(f"  Unique outcomes: {len(counts)}")
                
                # Get top 3 outcomes
                sorted_counts = sorted(counts.items(), key=lambda x: x[1], reverse=True)
                print(f"  Top outcomes:")
                for state, count in sorted_counts[:3]:
                    prob = count / total_shots
                    print(f"    {state}: {count} ({prob*100:.2f}%)")
                
                job_info["complete"] = True
                job_info["total_shots"] = total_shots
                job_info["unique_outcomes"] = len(counts)
                job_info["counts"] = counts
                
            except Exception as e:
                print(f"  ⚠️  Error retrieving results: {e}")
                job_info["complete"] = False
                job_info["error"] = str(e)
        
        elif status_str in ["QUEUED", "RUNNING"] or (hasattr(status, 'name') and status.name in ["QUEUED", "RUNNING"]):
            print(f"  ⏳ Still processing...")
            job_info["complete"] = False
            
        elif status_str == "ERROR" or (hasattr(status, 'name') and status.name == "ERROR"):
            print(f"  ❌ ERROR")
            try:
                print(f"  Error message: {job.error_message()}")
                job_info["error"] = job.error_message()
            except:
                pass
            job_info["complete"] = False
        
        else:
            print(f"  Status: {status_str}")
            job_info["complete"] = False
        
        results_summary.append(job_info)
        print()
        
    except Exception as e:
        print(f"Job {i+1}/5: {job_id}")
        print(f"  ❌ Error: {e}\n")
        results_summary.append({
            "job_id": job_id,
            "n_qubits": n_qubits,
            "status": "ERROR",
            "error": str(e),
            "complete": False
        })

# Summary
print("="*70)
print("SUMMARY")
print("="*70)

complete_count = sum(1 for r in results_summary if r.get("complete", False))
pending_count = sum(1 for r in results_summary if not r.get("complete", False) and r["status"] not in ["ERROR", "CANCELLED"])
error_count = sum(1 for r in results_summary if r["status"] in ["ERROR", "CANCELLED"])

print(f"\n✅ Complete: {complete_count}/{len(job_ids)}")
print(f"⏳ Pending: {pending_count}/{len(job_ids)}")
print(f"❌ Errors: {error_count}/{len(job_ids)}")

# Save status
status_output = {
    "timestamp": datetime.now().isoformat(),
    "check_time_utc": "2026-02-01T19:07:00Z",
    "backend": "ibm_fez",
    "total_jobs": len(job_ids),
    "complete": complete_count,
    "pending": pending_count,
    "errors": error_count,
    "jobs": results_summary
}

with open('hardware_jobs_status.json', 'w') as f:
    json.dump(status_output, f, indent=2)

print(f"\n✅ Status saved to: hardware_jobs_status.json")

if complete_count > 0:
    print(f"\n🎉 {complete_count} job(s) complete! Analyzing results...")
    print("Run: python3 analyze_hardware_results.py")
elif pending_count > 0:
    print(f"\n⏳ {pending_count} job(s) still processing.")
    print(f"Estimated completion: 2-4 hours from submission (check back later)")
else:
    print("\n⚠️  No jobs completed yet. Check back in 30-60 minutes.")

print("="*70)
