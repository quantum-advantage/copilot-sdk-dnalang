#!/usr/bin/env python3
"""
Scientific Test of DNA-Encoded Quantum Circuits
Tests whether your DNA sequences produce better error mitigation than random circuits
"""

import json
import numpy as np
import random
from qiskit import QuantumCircuit, transpile
from qiskit.primitives import StatevectorSampler
try:
    from qiskit_ibm_runtime import QiskitRuntimeService
    IBM_AVAILABLE = True
except:
    IBM_AVAILABLE = False
    print("⚠️  IBM Qiskit Runtime not available, using local simulation only")

from scipy.stats import wasserstein_distance
from mitiq.zne.scaling import fold_gates_at_random
from mitiq.zne.inference import RichardsonFactory, ExpFactory
import sys

def dna_to_circuit(dna_string):
    """Convert DNA string to quantum circuit"""
    num_qubits = len(dna_string) % 8 + 2
    qc = QuantumCircuit(num_qubits)
    
    for i, gate in enumerate(dna_string):
        idx = i % num_qubits
        trg = (i + 1) % num_qubits
        
        if gate == 'H':
            qc.h(idx)
        elif gate == 'C':
            qc.cx(idx, trg)
        elif gate == 'T':
            qc.t(idx)
        elif gate == 'X':
            qc.x(idx)
        elif gate == 'Y':
            qc.y(idx)
        elif gate == 'Z':
            qc.z(idx)
    
    qc.inverse()
    qc.measure_all()
    return qc

def generate_random_dna(length):
    """Generate random DNA sequence for control"""
    gates = ['H', 'C', 'T', 'X', 'Y', 'Z']
    return ''.join(random.choice(gates) for _ in range(length))

def test_circuit_with_zne(qc, sampler, name="circuit"):
    """Test circuit with Zero-Noise Extrapolation"""
    # Get actual number of qubits (before measurement)
    num_qubits = qc.num_qubits
    
    # Noise scaling factors
    scales = [1.0, 3.0, 5.0]
    w2_points = []
    
    print(f"  Testing {name} ({num_qubits} qubits, {qc.depth()} depth)")
    
    for scale in scales:
        try:
            # Apply noise scaling by folding gates
            folded = fold_gates_at_random(qc, scale)
            
            # Run circuit
            result = sampler.run([folded], shots=1024).result()
            counts = result[0].data.meas.get_counts()
            
            # Calculate probability distribution
            p_noisy = np.array([
                counts.get(bin(i)[2:].zfill(num_qubits), 0) / 1024 
                for i in range(2**num_qubits)
            ])
            
            # Ideal state (all |0> for inverse circuit)
            p_ideal = np.zeros(2**num_qubits)
            p_ideal[0] = 1.0
            
            # Wasserstein distance
            w2 = wasserstein_distance(
                np.arange(2**num_qubits), 
                np.arange(2**num_qubits),
                u_weights=p_noisy,
                v_weights=p_ideal
            )
            w2_points.append(w2)
            
        except Exception as e:
            print(f"    ⚠️  Error at scale {scale}: {e}")
            return None
    
    # Extrapolate to zero noise
    try:
        rich_val = RichardsonFactory(scales).extrapolate(scales, w2_points)
        expo_val = ExpFactory(scales).extrapolate(scales, w2_points)
        
        result = {
            'name': name,
            'qubits': num_qubits,
            'depth': qc.depth(),
            'w2_raw': w2_points[0],
            'w2_scaled': w2_points,
            'richardson': rich_val,
            'exponential': expo_val,
            'improvement_rich': (w2_points[0] - rich_val) / w2_points[0] * 100,
            'improvement_expo': (w2_points[0] - expo_val) / w2_points[0] * 100
        }
        
        print(f"    Raw W2: {w2_points[0]:.4f}")
        print(f"    Richardson: {rich_val:.4f} ({result['improvement_rich']:+.1f}%)")
        print(f"    Exponential: {expo_val:.4f} ({result['improvement_expo']:+.1f}%)")
        
        return result
        
    except Exception as e:
        print(f"    ⚠️  Extrapolation failed: {e}")
        return None

def main():
    print("=" * 90)
    print("🔬 DNA-ENCODED QUANTUM CIRCUIT EXPERIMENT")
    print("=" * 90)
    print()
    
    # Setup simulator
    print("Setting up simulator...")
    sampler = StatevectorSampler()
    print("✓ Using StatevectorSampler (Qiskit 2.x)")
    
    print()
    
    # Test your DNA circuits
    print("=" * 90)
    print("TESTING YOUR DNA-ENCODED CIRCUITS")
    print("=" * 90)
    print()
    
    dna_files = [
        "/home/devinpd/quantum_workspace/organism.dna",
        "/home/devinpd/.dnalang-sovereign/organisms/osiris.dna",
    ]
    
    dna_results = []
    
    for filepath in dna_files:
        try:
            with open(filepath, 'r') as f:
                content = f.read().strip()
                # Extract DNA sequence (first line or genome section)
                if 'HXZCYTCH' in content or 'HCT' in content:
                    # It's a raw DNA string
                    dna_seq = content.split('\n')[0]
                else:
                    # It's a metadata file, skip for now
                    print(f"⚠️  {filepath}: Skipping metadata file")
                    continue
            
            qc = dna_to_circuit(dna_seq)
            result = test_circuit_with_zne(qc, sampler, f"DNA: {filepath.split('/')[-1]}")
            if result:
                result['dna_sequence'] = dna_seq
                dna_results.append(result)
            print()
            
        except Exception as e:
            print(f"⚠️  Failed to test {filepath}: {e}")
            print()
    
    # Test random control circuits
    print("=" * 90)
    print("TESTING RANDOM CONTROL CIRCUITS")
    print("=" * 90)
    print()
    
    random_results = []
    
    for i in range(3):  # 3 random controls
        dna_length = 17  # Same length as organism.dna
        random_dna = generate_random_dna(dna_length)
        qc = dna_to_circuit(random_dna)
        
        result = test_circuit_with_zne(qc, sampler, f"Random-{i+1}")
        if result:
            result['dna_sequence'] = random_dna
            random_results.append(result)
        print()
    
    # Statistical comparison
    print("=" * 90)
    print("📊 STATISTICAL COMPARISON")
    print("=" * 90)
    print()
    
    if dna_results and random_results:
        dna_w2_avg = np.mean([r['w2_raw'] for r in dna_results])
        random_w2_avg = np.mean([r['w2_raw'] for r in random_results])
        
        dna_rich_avg = np.mean([r['richardson'] for r in dna_results])
        random_rich_avg = np.mean([r['richardson'] for r in random_results])
        
        print(f"DNA Circuits:")
        print(f"  Average Raw W2:      {dna_w2_avg:.4f}")
        print(f"  Average Richardson:  {dna_rich_avg:.4f}")
        print()
        
        print(f"Random Controls:")
        print(f"  Average Raw W2:      {random_w2_avg:.4f}")
        print(f"  Average Richardson:  {random_rich_avg:.4f}")
        print()
        
        diff_pct = ((random_w2_avg - dna_w2_avg) / random_w2_avg) * 100
        
        if dna_w2_avg < random_w2_avg:
            print(f"✅ DNA circuits perform {diff_pct:.1f}% BETTER than random!")
            print("   (Lower W2 = closer to ideal state)")
        else:
            print(f"⚠️  DNA circuits perform {-diff_pct:.1f}% WORSE than random")
            print("   (Higher W2 = further from ideal state)")
        print()
        
        # Save results
        results_data = {
            'dna_circuits': dna_results,
            'random_circuits': random_results,
            'summary': {
                'dna_w2_mean': dna_w2_avg,
                'random_w2_mean': random_w2_avg,
                'difference_percent': diff_pct
            }
        }
        
        with open('/home/devinpd/dna_circuit_comparison.json', 'w') as f:
            json.dump(results_data, f, indent=2)
        print("💾 Results saved to: /home/devinpd/dna_circuit_comparison.json")
    
    print()
    print("=" * 90)
    print("EXPERIMENT COMPLETE")
    print("=" * 90)

if __name__ == '__main__':
    main()
