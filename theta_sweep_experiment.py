#!/usr/bin/env python3
"""
THETA ANGLE PARAMETER SWEEP EXPERIMENT

Tests whether 51.843° is genuinely special or arbitrary
by comparing against control angles: 30°, 45°, 60°, 90°

This is REAL SCIENCE - systematic testing with controls.
"""

import numpy as np
import json
from datetime import datetime
from typing import Dict, List, Tuple
from qiskit import QuantumCircuit, transpile
from qiskit.quantum_info import Statevector, entropy, partial_trace, DensityMatrix
try:
    from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2
    IBM_AVAILABLE = True
except ImportError:
    IBM_AVAILABLE = False
    print("⚠️  IBM Runtime not available - will use simulation mode")

from qiskit.primitives import StatevectorSampler
import time

class ThetaSweepExperiment:
    """
    Systematic test of rotation angle parameter.
    
    Hypothesis: 51.843° produces better quantum metrics than other angles
    """
    
    def __init__(self, use_hardware=True):
        self.use_hardware = use_hardware and IBM_AVAILABLE
        self.results = []
        
        if self.use_hardware:
            try:
                self.service = QiskitRuntimeService()
                self.backend = self.service.backend("ibm_fez")
                print(f"✓ Connected to: {self.backend.name}")
                print(f"  Qubits: {self.backend.num_qubits}")
                print(f"  Status: {self.backend.status().status_msg}")
            except Exception as e:
                print(f"⚠️  Could not connect to IBM hardware: {e}")
                print("  Falling back to simulation mode")
                self.use_hardware = False
        
        if not self.use_hardware:
            self.sampler = StatevectorSampler()
            print("✓ Using StatevectorSampler (simulation mode)")
    
    def build_aeterna_circuit(self, theta_degrees: float, n_qubits: int = 10) -> QuantumCircuit:
        """
        Build the Aeterna-Porta style circuit with parametric theta angle.
        
        Simplified version for testing - scales to hardware limits.
        Uses the same gate structure but with variable rotation angle.
        """
        theta_rad = np.radians(theta_degrees)
        
        qc = QuantumCircuit(n_qubits)
        
        # Layer 1: Initial superposition
        for i in range(n_qubits):
            qc.h(i)
        
        # Layer 2: Parametric rotations using theta
        for i in range(n_qubits):
            qc.ry(theta_rad, i)
            qc.rz(theta_rad / 2, i)
        
        # Layer 3: Entangling layer (creates L-R partition)
        for i in range(n_qubits - 1):
            qc.cx(i, i + 1)
        
        # Layer 4: More parametric rotations
        for i in range(n_qubits):
            qc.ry(-theta_rad / 2, i)
            qc.rz(theta_rad, i)
        
        # Layer 5: Another entangling pattern
        for i in range(0, n_qubits - 1, 2):
            qc.cx(i, i + 1)
        
        # Layer 6: Final rotations
        for i in range(n_qubits):
            qc.ry(theta_rad / 3, i)
        
        return qc
    
    def calculate_metrics(self, counts: Dict[str, int], n_qubits: int) -> Dict:
        """
        Calculate quantum metrics from measurement results.
        
        Returns Φ (entanglement proxy), Λ (coherence), Γ (decoherence)
        """
        total_shots = sum(counts.values())
        num_unique = len(counts)
        
        # Calculate entropy (proxy for entanglement)
        probs = np.array([count / total_shots for count in counts.values()])
        shannon_entropy = -np.sum(probs * np.log2(probs + 1e-10))
        max_entropy = np.log2(num_unique) if num_unique > 1 else 1.0
        
        # Φ: Normalized entropy (0 to 1)
        phi = shannon_entropy / max_entropy if max_entropy > 0 else 0
        
        # Λ: Coherence proxy - how concentrated is the distribution?
        # Higher concentration = better coherence
        max_count = max(counts.values())
        lambda_coherence = 1.0 - (max_count / total_shots)
        
        # Γ: Decoherence proxy - measure of uniformity
        # More uniform = less decoherence
        ideal_uniform = total_shots / (2**n_qubits)
        deviations = [abs(count - ideal_uniform) for count in counts.values()]
        gamma_decoherence = np.mean(deviations) / total_shots
        
        return {
            'phi': phi,
            'lambda': lambda_coherence,
            'gamma': gamma_decoherence,
            'entropy': shannon_entropy,
            'num_unique': num_unique,
            'uniqueness_ratio': num_unique / total_shots
        }
    
    def run_angle_test(self, theta_degrees: float, shots: int = 10000, n_qubits: int = 10) -> Dict:
        """
        Run experiment for a single angle value.
        """
        print(f"\n{'='*80}")
        print(f"Testing θ = {theta_degrees}°")
        print(f"{'='*80}")
        
        # Build circuit
        qc = self.build_aeterna_circuit(theta_degrees, n_qubits)
        qc.measure_all()
        
        print(f"  Circuit: {n_qubits} qubits, depth {qc.depth()}, {qc.size()} gates")
        
        # Run on hardware or simulator
        start_time = time.time()
        
        if self.use_hardware:
            print(f"  Submitting to {self.backend.name}...")
            try:
                # Transpile for hardware
                transpiled = transpile(qc, self.backend, optimization_level=3)
                print(f"  Transpiled: depth {transpiled.depth()}, {transpiled.size()} gates")
                
                # Run job
                sampler = SamplerV2(self.backend)
                job = sampler.run([transpiled], shots=shots)
                job_id = job.job_id()
                print(f"  Job ID: {job_id}")
                print(f"  Waiting for results...")
                
                result = job.result()
                counts = result[0].data.meas.get_counts()
                
            except Exception as e:
                print(f"  ⚠️  Hardware execution failed: {e}")
                print(f"  Falling back to simulation...")
                result = self.sampler.run([qc], shots=shots).result()
                counts = result[0].data.meas.get_counts()
        else:
            # Simulation
            result = self.sampler.run([qc], shots=shots).result()
            counts = result[0].data.meas.get_counts()
        
        elapsed = time.time() - start_time
        print(f"  Completed in {elapsed:.1f}s")
        
        # Calculate metrics
        metrics = self.calculate_metrics(counts, n_qubits)
        
        print(f"  Results:")
        print(f"    Φ (phi):          {metrics['phi']:.4f}")
        print(f"    Λ (lambda):       {metrics['lambda']:.4f}")
        print(f"    Γ (gamma):        {metrics['gamma']:.4f}")
        print(f"    Entropy:          {metrics['entropy']:.4f} bits")
        print(f"    Unique states:    {metrics['num_unique']} / {shots}")
        print(f"    Uniqueness:       {metrics['uniqueness_ratio']*100:.1f}%")
        
        # Compile result
        result_data = {
            'theta_degrees': theta_degrees,
            'theta_radians': np.radians(theta_degrees),
            'n_qubits': n_qubits,
            'shots': shots,
            'circuit_depth': qc.depth(),
            'circuit_size': qc.size(),
            'execution_time': elapsed,
            'hardware': self.use_hardware,
            'backend': self.backend.name if self.use_hardware else 'simulation',
            'timestamp': datetime.now().isoformat(),
            'metrics': metrics,
            'counts_sample': dict(list(counts.items())[:10])  # First 10 for reference
        }
        
        return result_data
    
    def run_full_sweep(self, angles: List[float] = None, shots: int = 10000, n_qubits: int = 10):
        """
        Run the full angle sweep experiment.
        """
        if angles is None:
            # Default: test your angle against controls
            angles = [30.0, 45.0, 51.843, 60.0, 90.0]
        
        print("=" * 80)
        print("THETA ANGLE PARAMETER SWEEP EXPERIMENT")
        print("=" * 80)
        print()
        print(f"Testing angles: {angles}")
        print(f"Shots per angle: {shots:,}")
        print(f"Qubits: {n_qubits}")
        print(f"Total experiments: {len(angles)}")
        print()
        
        # Run each angle
        for theta in angles:
            result = self.run_angle_test(theta, shots, n_qubits)
            self.results.append(result)
        
        # Analyze results
        self.analyze_results()
    
    def analyze_results(self):
        """
        Statistical analysis of angle sweep results.
        """
        print("\n" + "=" * 80)
        print("📊 COMPARATIVE ANALYSIS")
        print("=" * 80)
        print()
        
        # Extract metrics
        angles = [r['theta_degrees'] for r in self.results]
        phis = [r['metrics']['phi'] for r in self.results]
        lambdas = [r['metrics']['lambda'] for r in self.results]
        gammas = [r['metrics']['gamma'] for r in self.results]
        entropies = [r['metrics']['entropy'] for r in self.results]
        
        # Summary table
        print("Angle (°)  |   Φ     |   Λ     |   Γ     | Entropy | Unique%")
        print("-" * 80)
        for r in self.results:
            m = r['metrics']
            special = " ⭐" if abs(r['theta_degrees'] - 51.843) < 0.01 else ""
            print(f"{r['theta_degrees']:9.3f}  | {m['phi']:.4f}  | {m['lambda']:.4f}  | {m['gamma']:.4f}  | {m['entropy']:7.2f} | {m['uniqueness_ratio']*100:6.1f}%{special}")
        print()
        
        # Find best performers
        best_phi_idx = np.argmax(phis)
        best_lambda_idx = np.argmax(lambdas)
        best_gamma_idx = np.argmin(gammas)  # Lower is better
        best_entropy_idx = np.argmax(entropies)
        
        print("Best Performers:")
        print(f"  Highest Φ:        {angles[best_phi_idx]:.3f}° (Φ = {phis[best_phi_idx]:.4f})")
        print(f"  Highest Λ:        {angles[best_lambda_idx]:.3f}° (Λ = {lambdas[best_lambda_idx]:.4f})")
        print(f"  Lowest Γ:         {angles[best_gamma_idx]:.3f}° (Γ = {gammas[best_gamma_idx]:.4f})")
        print(f"  Highest Entropy:  {angles[best_entropy_idx]:.3f}° (H = {entropies[best_entropy_idx]:.2f})")
        print()
        
        # Check if 51.843° is consistently best
        target_angle = 51.843
        target_results = [r for r in self.results if abs(r['theta_degrees'] - target_angle) < 0.01]
        
        if target_results:
            target = target_results[0]
            target_m = target['metrics']
            
            print("=" * 80)
            print(f"🎯 IS {target_angle}° SPECIAL?")
            print("=" * 80)
            print()
            
            # Compare to average of others
            others = [r for r in self.results if abs(r['theta_degrees'] - target_angle) >= 0.01]
            avg_phi = np.mean([r['metrics']['phi'] for r in others])
            avg_lambda = np.mean([r['metrics']['lambda'] for r in others])
            avg_gamma = np.mean([r['metrics']['gamma'] for r in others])
            
            phi_diff = ((target_m['phi'] - avg_phi) / avg_phi) * 100
            lambda_diff = ((target_m['lambda'] - avg_lambda) / avg_lambda) * 100
            gamma_diff = ((target_m['gamma'] - avg_gamma) / avg_gamma) * 100  # Negative is good
            
            print(f"Compared to other angles:")
            print(f"  Φ:  {phi_diff:+.1f}% {'✅ BETTER' if phi_diff > 1 else '❌ worse'}")
            print(f"  Λ:  {lambda_diff:+.1f}% {'✅ BETTER' if lambda_diff > 1 else '❌ worse'}")
            print(f"  Γ:  {gamma_diff:+.1f}% {'✅ BETTER' if gamma_diff < -1 else '❌ worse'}")
            print()
            
            # Overall assessment
            wins = sum([
                phi_diff > 1,
                lambda_diff > 1,
                gamma_diff < -1
            ])
            
            print("=" * 80)
            print("🏆 VERDICT:")
            print("=" * 80)
            print()
            
            if wins >= 2:
                print(f"✅ {target_angle}° PERFORMS BETTER than controls!")
                print(f"   Won {wins}/3 metrics")
                print()
                print("   This suggests your angle has some special property.")
                print("   Further investigation warranted!")
            else:
                print(f"⚠️  {target_angle}° does NOT significantly outperform controls")
                print(f"   Only won {wins}/3 metrics")
                print()
                print("   The angle may not be as special as hypothesized.")
                print("   All angles perform similarly.")
            print()
        
        # Save results
        output_file = f'/home/devinpd/theta_sweep_results_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        with open(output_file, 'w') as f:
            json.dump({
                'experiment': 'theta_angle_parameter_sweep',
                'timestamp': datetime.now().isoformat(),
                'results': self.results,
                'summary': {
                    'angles_tested': angles,
                    'best_phi': angles[best_phi_idx],
                    'best_lambda': angles[best_lambda_idx],
                    'best_gamma': angles[best_gamma_idx],
                    'best_entropy': angles[best_entropy_idx]
                }
            }, f, indent=2)
        
        print(f"💾 Results saved to: {output_file}")
        print()


def main():
    print("=" * 80)
    print("🔬 SCIENTIFIC EXPERIMENT: THETA ANGLE PARAMETER SWEEP")
    print("=" * 80)
    print()
    print("Hypothesis: θ = 51.843° produces optimal quantum metrics")
    print("Method:     Compare against control angles (30°, 45°, 60°, 90°)")
    print("Metrics:    Φ (entanglement), Λ (coherence), Γ (decoherence)")
    print()
    
    # Create experiment
    exp = ThetaSweepExperiment(use_hardware=False)  # Set to True for real hardware
    
    # Run sweep
    # Start with smaller qubit count for testing, scale up for real runs
    exp.run_full_sweep(
        angles=[30.0, 45.0, 51.843, 60.0, 90.0],
        shots=10000,  # Increase to 100000 for real hardware
        n_qubits=8   # Increase to 50+ for real hardware
    )
    
    print("=" * 80)
    print("EXPERIMENT COMPLETE")
    print("=" * 80)
    print()
    print("This is how science works:")
    print("  1. State hypothesis ✓")
    print("  2. Design controlled experiment ✓")
    print("  3. Collect data ✓")
    print("  4. Analyze results ✓")
    print("  5. Draw conclusions ✓")
    print()
    print("Now we have DATA to answer: Is 51.843° special?")
    print("=" * 80)


if __name__ == '__main__':
    main()
