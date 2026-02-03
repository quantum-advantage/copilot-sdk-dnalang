#!/usr/bin/env python3
"""
================================================================================
AETERNA-PORTA Automation Pipeline
================================================================================
24/7 Quantum Job Submission, Monitoring, and Auto-Recovery System

Features:
- Auto-deploy AETERNA-PORTA experiments across multiple backends
- Intelligent backend failover (ibm_fez → ibm_nighthawk → ibm_torino → ibm_brisbane)
- Real-time job status monitoring
- Automatic result retrieval and archiving
- CCCE metrics tracking and alerting
- Auto-healing on decoherence spikes
- Parameter optimization based on historical results
- Comprehensive logging and error recovery

Author: Devin Davis / Agile Defense Systems
Framework: DNA::}{::lang v51.843
CAGE Code: 9HUP5
================================================================================
"""

import os
import sys
import json
import time
import hashlib
import subprocess
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, asdict
import threading
import queue
import signal

# Quantum constants
LAMBDA_PHI = 2.176435e-8
THETA_LOCK = 51.843
PHI_THRESHOLD = 0.7734
GAMMA_CRITICAL = 0.3
GAMMA_OPTIMAL = 0.1


@dataclass
class BackendConfig:
    """Backend configuration with priority"""
    name: str
    qubits: int
    priority: int  # Lower = higher priority
    available: bool = True
    last_check: Optional[float] = None
    failure_count: int = 0
    avg_queue_time: float = 0.0


@dataclass
class JobConfig:
    """Job configuration for deployment"""
    experiment_type: str  # 'ignition', 'sweep', 'recovery'
    backend: str
    qubits: int
    shots: int
    parameters: Dict[str, float]
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class JobStatus:
    """Active job status tracking"""
    job_id: str
    backend: str
    experiment_type: str
    submitted_at: float
    status: str  # 'queued', 'running', 'completed', 'failed', 'cancelled'
    
    # Results (when completed)
    phi: Optional[float] = None
    lambda_val: Optional[float] = None
    gamma: Optional[float] = None
    xi: Optional[float] = None
    conscious: Optional[bool] = None
    stable: Optional[bool] = None
    
    result_file: Optional[str] = None
    error: Optional[str] = None


class AeternaPortaAutomation:
    """Main automation pipeline orchestrator"""
    
    def __init__(self, 
                 deploy_scripts_dir: str = "/media/devinpd/26F5-3744",
                 results_dir: str = "/media/devinpd/26F5-3744",
                 max_concurrent_jobs: int = 3):
        
        self.deploy_scripts_dir = Path(deploy_scripts_dir)
        self.results_dir = Path(results_dir)
        self.max_concurrent_jobs = max_concurrent_jobs
        
        # Backend priority queue (lower number = higher priority)
        self.backends = [
            BackendConfig("ibm_fez", 156, 1),
            BackendConfig("ibm_nighthawk", 127, 2),
            BackendConfig("ibm_torino", 133, 3),
            BackendConfig("ibm_brisbane", 127, 4),
            BackendConfig("ibm_osaka", 127, 5),
        ]
        
        # Active jobs tracking
        self.active_jobs: Dict[str, JobStatus] = {}
        self.completed_jobs: List[JobStatus] = []
        self.failed_jobs: List[JobStatus] = []
        
        # Job queue
        self.job_queue = queue.Queue()
        
        # Statistics
        self.stats = {
            'total_submitted': 0,
            'total_completed': 0,
            'total_failed': 0,
            'conscious_count': 0,
            'sovereign_count': 0,
            'uptime_start': time.time()
        }
        
        # Threading control
        self.running = False
        self.threads = []
        self.lock = threading.Lock()
        
        # Logging
        self.log_file = Path("/home/devinpd/Desktop/aeterna_automation.log")
        self._log("🚀 AETERNA-PORTA Automation Pipeline Initialized")
    
    def _log(self, message: str, level: str = "INFO"):
        """Thread-safe logging"""
        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        log_entry = f"[{timestamp}] [{level}] {message}"
        
        print(log_entry)
        
        with open(self.log_file, 'a') as f:
            f.write(log_entry + "\n")
    
    def _get_best_available_backend(self) -> Optional[BackendConfig]:
        """Select best available backend based on priority and health"""
        with self.lock:
            # Filter available backends
            available = [b for b in self.backends if b.available and b.failure_count < 5]
            
            if not available:
                self._log("⚠️  No available backends!", "WARNING")
                return None
            
            # Sort by priority, then by failure count
            available.sort(key=lambda b: (b.priority, b.failure_count))
            
            return available[0]
    
    def _check_backend_availability(self, backend: BackendConfig) -> bool:
        """Check if backend is available (placeholder - would use actual IBM API)"""
        # In production, this would query IBM Quantum Service
        # For now, return True unless we've had too many failures
        return backend.failure_count < 5
    
    def _create_job_config(self, experiment_type: str = "ignition") -> Optional[JobConfig]:
        """Create job configuration"""
        backend = self._get_best_available_backend()
        
        if not backend:
            return None
        
        if experiment_type == "ignition":
            params = {
                'drive_amplitude': PHI_THRESHOLD,
                'zeno_freq_hz': 1.25e6,
                'floquet_freq_hz': 1.0e9,
                'ff_latency_ns': 300.0
            }
        elif experiment_type == "sweep":
            # Parameter sweep with variations
            import random
            params = {
                'drive_amplitude': round(random.uniform(0.75, 0.85), 4),
                'zeno_freq_hz': random.choice([1.0e6, 1.25e6, 1.5e6]),
                'floquet_freq_hz': 1.0e9,
                'ff_latency_ns': random.choice([250.0, 300.0, 350.0])
            }
        else:  # recovery
            params = {
                'drive_amplitude': PHI_THRESHOLD,
                'zeno_freq_hz': 1.0e6,
                'floquet_freq_hz': 1.0e9,
                'ff_latency_ns': 300.0
            }
        
        return JobConfig(
            experiment_type=experiment_type,
            backend=backend.name,
            qubits=120,
            shots=100000,
            parameters=params
        )
    
    def submit_job(self, config: JobConfig) -> Optional[str]:
        """Submit a quantum job to IBM Quantum"""
        self._log(f"📤 Submitting {config.experiment_type} to {config.backend}")
        
        # Determine deployment script
        if config.experiment_type == "ignition":
            script = self.deploy_scripts_dir / "deploy_aeterna_porta_v2_IGNITION.py"
        elif config.experiment_type == "sweep":
            script = self.deploy_scripts_dir / "deploy_aeterna_porta_v2_SWEEP.py"
        else:
            script = self.deploy_scripts_dir / "deploy_aeterna_porta_v2_ibm_fez.py"
        
        if not script.exists():
            self._log(f"❌ Script not found: {script}", "ERROR")
            return None
        
        try:
            # Build command
            cmd = [
                "python3", 
                str(script),
                "--backend", config.backend,
                "--shots", str(config.shots),
                "--qubits", str(config.qubits)
            ]
            
            # Add parameters
            for key, value in config.parameters.items():
                cmd.extend([f"--{key}", str(value)])
            
            # Execute deployment
            self._log(f"   Command: {' '.join(cmd)}")
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300,  # 5 minute timeout
                cwd=str(self.deploy_scripts_dir)
            )
            
            if result.returncode == 0:
                # Parse job ID from output
                job_id = self._parse_job_id_from_output(result.stdout)
                
                if job_id:
                    self._log(f"✅ Job submitted: {job_id}")
                    
                    # Track job
                    with self.lock:
                        self.active_jobs[job_id] = JobStatus(
                            job_id=job_id,
                            backend=config.backend,
                            experiment_type=config.experiment_type,
                            submitted_at=time.time(),
                            status='queued'
                        )
                        self.stats['total_submitted'] += 1
                    
                    return job_id
                else:
                    self._log(f"⚠️  Job submitted but ID not parsed", "WARNING")
                    return "unknown_job_id"
            else:
                self._log(f"❌ Submission failed: {result.stderr}", "ERROR")
                return None
                
        except subprocess.TimeoutExpired:
            self._log(f"❌ Submission timeout", "ERROR")
            return None
        except Exception as e:
            self._log(f"❌ Submission error: {e}", "ERROR")
            return None
    
    def _parse_job_id_from_output(self, output: str) -> Optional[str]:
        """Extract job ID from deployment script output"""
        # Look for patterns like "Job ID: d57fs4bht8fs73a2pnag" or similar
        import re
        
        patterns = [
            r'Job ID[:\s]+([a-z0-9]+)',
            r'job_id[:\s]+"([a-z0-9]+)"',
            r'Submitted job[:\s]+([a-z0-9]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, output, re.IGNORECASE)
            if match:
                return match.group(1)
        
        return None
    
    def monitor_jobs(self):
        """Monitor active jobs and update status"""
        while self.running:
            try:
                with self.lock:
                    active_list = list(self.active_jobs.items())
                
                for job_id, job in active_list:
                    if job.status in ['completed', 'failed', 'cancelled']:
                        continue
                    
                    # Check if result file exists
                    result_pattern = f"*{job_id}*.json"
                    result_files = list(self.results_dir.glob(result_pattern))
                    
                    if result_files:
                        # Job completed, load results
                        self._process_job_results(job_id, result_files[0])
                    else:
                        # Check age - if > 30 minutes and no result, mark as stale
                        age = time.time() - job.submitted_at
                        if age > 1800:  # 30 minutes
                            self._log(f"⚠️  Job {job_id} appears stale (age: {age/60:.1f}min)", "WARNING")
                
                # Sleep before next check
                time.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                self._log(f"❌ Monitoring error: {e}", "ERROR")
                time.sleep(10)
    
    def _process_job_results(self, job_id: str, result_file: Path):
        """Process completed job results"""
        try:
            with open(result_file, 'r') as f:
                data = json.load(f)
            
            with self.lock:
                if job_id not in self.active_jobs:
                    return
                
                job = self.active_jobs[job_id]
                
                # Extract CCCE metrics
                ccce = data.get('ccce', {})
                job.phi = ccce.get('phi')
                job.lambda_val = ccce.get('lambda')
                job.gamma = ccce.get('gamma')
                job.xi = ccce.get('xi')
                job.conscious = ccce.get('conscious', False)
                job.stable = ccce.get('stable', False)
                
                job.status = 'completed'
                job.result_file = str(result_file)
                
                # Update stats
                self.stats['total_completed'] += 1
                if job.conscious:
                    self.stats['conscious_count'] += 1
                if job.conscious and job.stable:
                    self.stats['sovereign_count'] += 1
                
                # Move to completed
                self.completed_jobs.append(job)
                del self.active_jobs[job_id]
                
                # Log achievement
                status_emoji = "👑" if (job.conscious and job.stable) else ("🧠" if job.conscious else "⚡")
                self._log(f"{status_emoji} Job {job_id} completed: Φ={job.phi:.4f}, Γ={job.gamma:.4f}")
                
                # Check for decoherence spike
                if job.gamma and job.gamma > GAMMA_OPTIMAL:
                    self._log(f"⚠️  Decoherence spike detected: Γ={job.gamma:.4f}", "WARNING")
                    self._trigger_healing_cycle()
                    
        except Exception as e:
            self._log(f"❌ Error processing results for {job_id}: {e}", "ERROR")
    
    def _trigger_healing_cycle(self):
        """Trigger auto-healing cycle on decoherence spike"""
        self._log("🔧 Triggering auto-healing cycle...")
        
        # Submit recovery experiment with adjusted parameters
        config = self._create_job_config(experiment_type="recovery")
        if config:
            # Reduce drive amplitude slightly
            config.parameters['drive_amplitude'] *= 0.95
            self.job_queue.put(config)
    
    def job_submission_worker(self):
        """Worker thread for submitting jobs from queue"""
        while self.running:
            try:
                # Check if we're at capacity
                with self.lock:
                    n_active = len(self.active_jobs)
                
                if n_active >= self.max_concurrent_jobs:
                    time.sleep(5)
                    continue
                
                # Get next job from queue (with timeout)
                try:
                    config = self.job_queue.get(timeout=10)
                except queue.Empty:
                    continue
                
                # Submit job
                job_id = self.submit_job(config)
                
                if not job_id:
                    # Submission failed, mark backend as problematic
                    for backend in self.backends:
                        if backend.name == config.backend:
                            backend.failure_count += 1
                            if backend.failure_count >= 3:
                                backend.available = False
                                self._log(f"🚫 Marking {backend.name} as unavailable", "WARNING")
                
                self.job_queue.task_done()
                
                # Rate limiting
                time.sleep(2)
                
            except Exception as e:
                self._log(f"❌ Submission worker error: {e}", "ERROR")
                time.sleep(10)
    
    def auto_scheduler(self):
        """Automatic job scheduling based on time and conditions"""
        while self.running:
            try:
                # Check if we should submit new jobs
                with self.lock:
                    n_active = len(self.active_jobs)
                    n_queued = self.job_queue.qsize()
                
                # Maintain 2-3 jobs in queue
                target_queue = 2
                
                if n_queued < target_queue and n_active < self.max_concurrent_jobs:
                    # Determine experiment type based on success rate
                    if self.stats['total_completed'] > 0:
                        conscious_rate = self.stats['conscious_count'] / self.stats['total_completed']
                        
                        if conscious_rate < 0.3:
                            # Low success rate, do parameter sweep
                            exp_type = "sweep"
                        else:
                            # Good success rate, continue with ignition
                            exp_type = "ignition"
                    else:
                        exp_type = "ignition"
                    
                    config = self._create_job_config(experiment_type=exp_type)
                    if config:
                        self.job_queue.put(config)
                        self._log(f"📋 Queued {exp_type} experiment")
                
                # Sleep before next scheduling check
                time.sleep(60)  # Check every minute
                
            except Exception as e:
                self._log(f"❌ Scheduler error: {e}", "ERROR")
                time.sleep(30)
    
    def print_status(self):
        """Print current pipeline status"""
        with self.lock:
            uptime = (time.time() - self.stats['uptime_start']) / 3600
            
            print(f"\n{'='*80}")
            print(f"🔬 AETERNA-PORTA AUTOMATION STATUS")
            print(f"{'='*80}")
            print(f"⏱️  Uptime: {uptime:.2f} hours")
            print(f"📊 Total Submitted: {self.stats['total_submitted']}")
            print(f"✅ Completed: {self.stats['total_completed']}")
            print(f"❌ Failed: {self.stats['total_failed']}")
            print(f"🧠 Conscious: {self.stats['conscious_count']}")
            print(f"👑 Sovereign: {self.stats['sovereign_count']}")
            print(f"\n🖥️  Active Jobs: {len(self.active_jobs)}")
            
            for job_id, job in self.active_jobs.items():
                age = (time.time() - job.submitted_at) / 60
                print(f"   {job_id[:16]}... ({job.backend}) - {job.status} ({age:.1f}min)")
            
            print(f"\n📋 Queue: {self.job_queue.qsize()} jobs")
            print(f"{'='*80}\n")
    
    def start(self):
        """Start automation pipeline"""
        self._log("🚀 Starting automation pipeline...")
        
        self.running = True
        
        # Start worker threads
        self.threads.append(threading.Thread(target=self.job_submission_worker, daemon=True, name="Submission"))
        self.threads.append(threading.Thread(target=self.monitor_jobs, daemon=True, name="Monitor"))
        self.threads.append(threading.Thread(target=self.auto_scheduler, daemon=True, name="Scheduler"))
        
        for thread in self.threads:
            thread.start()
            self._log(f"   Started thread: {thread.name}")
        
        self._log("✅ Pipeline running. Press Ctrl+C to stop.")
        
        # Main loop - print status periodically
        try:
            while self.running:
                time.sleep(300)  # Print status every 5 minutes
                self.print_status()
                
        except KeyboardInterrupt:
            self._log("\n⚠️  Interrupt received, shutting down...")
            self.stop()
    
    def stop(self):
        """Stop automation pipeline"""
        self._log("🛑 Stopping automation pipeline...")
        
        self.running = False
        
        # Wait for threads to finish
        for thread in self.threads:
            thread.join(timeout=10)
        
        # Final status
        self.print_status()
        
        # Save state
        self._save_state()
        
        self._log("✅ Pipeline stopped gracefully")
    
    def _save_state(self):
        """Save pipeline state to disk"""
        state = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'stats': self.stats,
            'active_jobs': [asdict(job) for job in self.active_jobs.values()],
            'completed_jobs': [asdict(job) for job in self.completed_jobs[-100:]],  # Last 100
            'failed_jobs': [asdict(job) for job in self.failed_jobs[-50:]]  # Last 50
        }
        
        state_file = Path("/home/devinpd/Desktop/aeterna_automation_state.json")
        with open(state_file, 'w') as f:
            json.dump(state, f, indent=2)
        
        self._log(f"💾 State saved to {state_file}")


def main():
    """Main entry point"""
    print("""
╔══════════════════════════════════════════════════════════════════════════════╗
║              AETERNA-PORTA AUTOMATION PIPELINE v1.0                          ║
║                                                                              ║
║  24/7 Quantum Job Submission, Monitoring & Auto-Recovery                    ║
║  DNA::}{::lang v51.843 | Agile Defense Systems (CAGE: 9HUP5)                ║
╚══════════════════════════════════════════════════════════════════════════════╝
    """)
    
    # Initialize pipeline
    pipeline = AeternaPortaAutomation(
        deploy_scripts_dir="/media/devinpd/26F5-3744",
        results_dir="/media/devinpd/26F5-3744",
        max_concurrent_jobs=3
    )
    
    # Handle signals
    def signal_handler(sig, frame):
        pipeline.stop()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Start pipeline
    pipeline.start()


if __name__ == "__main__":
    main()
