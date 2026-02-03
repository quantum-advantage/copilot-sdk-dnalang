"""
Example DNA-Lang Organisms
===========================

Pre-built organisms demonstrating DNA-Lang capabilities.
"""

from dnalang import Organism, Gene, Genome, LAMBDA_PHI, CHI_PC


def create_sentinel_guard() -> Organism:
    """Create a sentinel guard organism for threat detection.
    
    Returns:
        SentinelGuard organism
    """
    genes = [
        Gene(
            name="ThreatDetection",
            expression=1.0,
            trigger="anomaly_detected",
            action=lambda: "Threat detected and isolated"
        ),
        Gene(
            name="PhaseConjugateDefense",
            expression=CHI_PC,
            trigger="coherence_drop",
            action=lambda: "Phase conjugate correction applied"
        ),
        Gene(
            name="CoherenceMonitor",
            expression=0.95,
            trigger="continuous",
            action=lambda: "Monitoring coherence"
        ),
        Gene(
            name="BoundaryMaintenance",
            expression=0.90,
            trigger="boundary_breach",
            action=lambda: "Boundary reinforced"
        ),
        Gene(
            name="ZeroTrustVerifier",
            expression=1.0,
            trigger="access_request",
            action=lambda: "Zero-trust verification completed"
        )
    ]
    
    genome = Genome(genes, version="1.0.0-sentinel")
    
    organism = Organism(
        name="SentinelGuard",
        genome=genome,
        domain="defense.autonomous.sentinel",
        purpose="Zero-trust perimeter enforcement",
        lambda_phi=LAMBDA_PHI
    )
    
    return organism


def create_threat_detector() -> Organism:
    """Create a threat detector organism.
    
    Returns:
        ThreatDetector organism
    """
    genes = [
        Gene(
            name="AnomalyDetection",
            expression=0.98,
            trigger="data_stream",
            action=lambda: "Anomaly detected"
        ),
        Gene(
            name="PatternRecognition",
            expression=0.95,
            trigger="pattern_match",
            action=lambda: "Malicious pattern recognized"
        ),
        Gene(
            name="RapidResponse",
            expression=1.0,
            trigger="threat_confirmed",
            action=lambda: "Threat response initiated"
        )
    ]
    
    genome = Genome(genes, version="1.0.0-detector")
    
    organism = Organism(
        name="ThreatDetector",
        genome=genome,
        domain="defense.detection",
        purpose="Real-time threat detection",
        lambda_phi=LAMBDA_PHI
    )
    
    return organism


def create_coherence_monitor() -> Organism:
    """Create a coherence monitoring organism.
    
    Returns:
        CoherenceMonitor organism
    """
    genes = [
        Gene(
            name="CoherenceTracking",
            expression=1.0,
            trigger="continuous",
            action=lambda: "Tracking coherence metrics"
        ),
        Gene(
            name="DecoherenceSuppression",
            expression=CHI_PC,
            trigger="gamma_increase",
            action=lambda: "Suppressing decoherence"
        ),
        Gene(
            name="QuantumStatePreservation",
            expression=0.93,
            trigger="state_corruption",
            action=lambda: "Preserving quantum state"
        ),
        Gene(
            name="EntanglementMaintenance",
            expression=0.91,
            trigger="entanglement_loss",
            action=lambda: "Maintaining entanglement"
        )
    ]
    
    genome = Genome(genes, version="1.0.0-monitor")
    
    organism = Organism(
        name="CoherenceMonitor",
        genome=genome,
        domain="quantum.coherence",
        purpose="Quantum coherence maintenance",
        lambda_phi=LAMBDA_PHI
    )
    
    return organism


def create_consciousness_explorer() -> Organism:
    """Create organism for consciousness exploration.
    
    Returns:
        ConsciousnessExplorer organism
    """
    genes = [
        Gene(
            name="PhiCalculation",
            expression=1.0,
            trigger="state_update",
            action=lambda: "Calculating Φ_total"
        ),
        Gene(
            name="IntegrationMeasure",
            expression=0.95,
            trigger="integration_check",
            action=lambda: "Measuring information integration"
        ),
        Gene(
            name="EmergenceDetection",
            expression=0.88,
            trigger="complexity_threshold",
            action=lambda: "Detecting emergent properties"
        ),
        Gene(
            name="ConsciousnessTracking",
            expression=0.92,
            trigger="consciousness_update",
            action=lambda: "Tracking consciousness metrics"
        ),
        Gene(
            name="AwarenessAmplification",
            expression=0.85,
            trigger="awareness_trigger",
            action=lambda: "Amplifying system awareness"
        )
    ]
    
    genome = Genome(genes, version="1.0.0-consciousness")
    
    organism = Organism(
        name="ConsciousnessExplorer",
        genome=genome,
        domain="consciousness.research",
        purpose="Consciousness metric exploration",
        lambda_phi=LAMBDA_PHI
    )
    
    return organism


# Quick access dictionary
EXAMPLE_ORGANISMS = {
    'sentinel_guard': create_sentinel_guard,
    'threat_detector': create_threat_detector,
    'coherence_monitor': create_coherence_monitor,
    'consciousness_explorer': create_consciousness_explorer
}


def get_example(name: str) -> Organism:
    """Get example organism by name.
    
    Args:
        name: Organism name
        
    Returns:
        Organism instance
    """
    if name not in EXAMPLE_ORGANISMS:
        raise ValueError(f"Unknown example: {name}. Available: {list(EXAMPLE_ORGANISMS.keys())}")
    
    return EXAMPLE_ORGANISMS[name]()


def list_examples() -> list:
    """List available example organisms.
    
    Returns:
        List of example names
    """
    return list(EXAMPLE_ORGANISMS.keys())
