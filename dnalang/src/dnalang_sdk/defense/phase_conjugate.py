"""
Phase Conjugate Correction
==========================

Time-reversal error correction for quantum state preservation (E → E⁻¹).
"""

from typing import Optional, Dict, Any
import numpy as np
from ..organisms.organism import Organism
from ..quantum_core.constants import THETA_PC_RAD, CHI_PC


class PhaseConjugate:
    """Phase conjugate error correction system.
    
    Implements E → E⁻¹ time-reversal correction to restore coherence.
    """
    
    def __init__(self, chi_pc: float = CHI_PC):
        """Initialize phase conjugate system.
        
        Args:
            chi_pc: Phase conjugate chi parameter
        """
        self.chi_pc = chi_pc
        self.theta_pc = THETA_PC_RAD
        self.corrections: List[Dict] = []
    
    def apply_correction(
        self,
        organism: Organism,
        error_type: str = "decoherence"
    ) -> bool:
        """Apply phase conjugate correction to organism.
        
        Args:
            organism: Organism to correct
            error_type: Type of error to correct
            
        Returns:
            True if correction successful
        """
        # Store pre-correction state
        pre_state = self._capture_state(organism)
        
        # Apply E → E⁻¹ transformation
        self._apply_conjugate_transformation(organism)
        
        # Verify correction
        post_state = self._capture_state(organism)
        fidelity = self._calculate_fidelity(pre_state, post_state)
        
        correction_info = {
            'error_type': error_type,
            'chi_pc': self.chi_pc,
            'theta_pc': self.theta_pc,
            'fidelity': fidelity,
            'success': fidelity > 0.9
        }
        
        self.corrections.append(correction_info)
        
        organism._log_event("phase_conjugate_correction", correction_info)
        
        return correction_info['success']
    
    def _capture_state(self, organism: Organism) -> Dict[str, Any]:
        """Capture current organism state.
        
        Args:
            organism: Organism to capture
            
        Returns:
            State snapshot
        """
        return {
            'expressions': [g.expression for g in organism.genome],
            'state': organism.state,
            'generation': organism.generation
        }
    
    def _apply_conjugate_transformation(self, organism: Organism):
        """Apply phase conjugate transformation E → E⁻¹.
        
        Args:
            organism: Organism to transform
        """
        for gene in organism.genome.genes:
            # Apply phase rotation
            phase_shift = np.cos(self.theta_pc * gene.expression)
            new_expression = np.clip(
                gene.expression * self.chi_pc * phase_shift,
                0.0,
                1.0
            )
            gene.expression = new_expression
    
    def _calculate_fidelity(
        self,
        state1: Dict[str, Any],
        state2: Dict[str, Any]
    ) -> float:
        """Calculate fidelity between two states.
        
        Args:
            state1: First state
            state2: Second state
            
        Returns:
            Fidelity [0, 1]
        """
        expr1 = np.array(state1['expressions'])
        expr2 = np.array(state2['expressions'])
        
        # Quantum fidelity approximation
        overlap = np.dot(expr1, expr2) / (np.linalg.norm(expr1) * np.linalg.norm(expr2) + 1e-10)
        return float(np.abs(overlap))
    
    def suppress_gamma(
        self,
        organism: Organism,
        target_gamma: float = 0.1
    ) -> float:
        """Suppress decoherence (gamma).
        
        Args:
            organism: Organism to stabilize
            target_gamma: Target gamma value
            
        Returns:
            Final gamma value
        """
        # Iteratively apply corrections
        max_iterations = 10
        current_gamma = 1.0
        
        for i in range(max_iterations):
            if current_gamma <= target_gamma:
                break
            
            self.apply_correction(organism, error_type="gamma_suppression")
            
            # Estimate gamma from expression variance
            expressions = [g.expression for g in organism.genome]
            current_gamma = float(np.std(expressions))
        
        organism._log_event("gamma_suppression", {
            'initial_gamma': 1.0,
            'final_gamma': current_gamma,
            'target_gamma': target_gamma,
            'iterations': i + 1
        })
        
        return current_gamma
    
    def restore_coherence(
        self,
        organism: Organism,
        target_coherence: float = 0.95
    ) -> float:
        """Restore quantum coherence.
        
        Args:
            organism: Organism to restore
            target_coherence: Target coherence level
            
        Returns:
            Final coherence value
        """
        # Apply correction
        success = self.apply_correction(organism, error_type="coherence_restoration")
        
        # Calculate coherence from expression uniformity
        expressions = np.array([g.expression for g in organism.genome])
        coherence = 1.0 - np.std(expressions) / (np.mean(expressions) + 1e-10)
        coherence = float(np.clip(coherence, 0.0, 1.0))
        
        return coherence
    
    def get_correction_summary(self) -> Dict[str, Any]:
        """Get summary of all corrections.
        
        Returns:
            Correction summary
        """
        if not self.corrections:
            return {
                'total_corrections': 0,
                'success_rate': 0.0
            }
        
        successes = sum(1 for c in self.corrections if c['success'])
        fidelities = [c['fidelity'] for c in self.corrections]
        
        return {
            'total_corrections': len(self.corrections),
            'successes': successes,
            'success_rate': successes / len(self.corrections),
            'avg_fidelity': np.mean(fidelities),
            'chi_pc': self.chi_pc,
            'theta_pc': self.theta_pc
        }
    
    def __repr__(self) -> str:
        return f"PhaseConjugate(chi_pc={self.chi_pc:.3f}, corrections={len(self.corrections)})"
