"""
Unit tests for quantum engine (AeternaPorta, LambdaPhiEngine)
"""
import pytest
from copilot_quantum.quantum_engine import (
    AeternaPorta,
    LambdaPhiEngine,
    QuantumMetrics,
    THETA_LOCK_DEG,
    PHI_THRESHOLD_FIDELITY,
    GAMMA_CRITICAL_RATE,
    LAMBDA_PHI_M
)


class TestQuantumConstants:
    """Test immutable physical constants"""
    
    def test_theta_lock_value(self):
        """Verify THETA_LOCK_DEG is correct"""
        assert THETA_LOCK_DEG == 51.843
    
    def test_phi_threshold_value(self):
        """Verify PHI_THRESHOLD_FIDELITY is correct"""
        assert PHI_THRESHOLD_FIDELITY == 0.7734
    
    def test_gamma_critical_value(self):
        """Verify GAMMA_CRITICAL_RATE is correct"""
        assert GAMMA_CRITICAL_RATE == 0.3
    
    def test_lambda_phi_value(self):
        """Verify LAMBDA_PHI_M is correct"""
        assert LAMBDA_PHI_M == 2.176435e-08


class TestQuantumMetrics:
    """Test QuantumMetrics dataclass"""
    
    def test_create_metrics(self):
        """Test creating QuantumMetrics instance"""
        metrics = QuantumMetrics(
            phi=0.85,
            gamma=0.12,
            ccce=0.91,
            chi_pc=0.946,
            backend="ibm_fez",
            qubits=127,
            shots=100000,
            execution_time_s=0.023,
            success=True
        )
        
        assert metrics.phi == 0.85
        assert metrics.gamma == 0.12
        assert metrics.backend == "ibm_fez"
    
    def test_above_threshold_true(self):
        """Test above_threshold when phi > 0.7734"""
        metrics = QuantumMetrics(
            phi=0.85,
            gamma=0.12,
            ccce=0.91,
            chi_pc=0.946,
            backend="ibm_fez",
            qubits=127,
            shots=100000,
            execution_time_s=0.023,
            success=True
        )
        
        assert metrics.above_threshold() is True
    
    def test_above_threshold_false(self):
        """Test above_threshold when phi < 0.7734"""
        metrics = QuantumMetrics(
            phi=0.65,
            gamma=0.12,
            ccce=0.91,
            chi_pc=0.946,
            backend="ibm_fez",
            qubits=127,
            shots=100000,
            execution_time_s=0.023,
            success=True
        )
        
        assert metrics.above_threshold() is False
    
    def test_is_coherent_true(self):
        """Test is_coherent when gamma < 0.3"""
        metrics = QuantumMetrics(
            phi=0.85,
            gamma=0.12,
            ccce=0.91,
            chi_pc=0.946,
            backend="ibm_fez",
            qubits=127,
            shots=100000,
            execution_time_s=0.023,
            success=True
        )
        
        assert metrics.is_coherent() is True
    
    def test_is_coherent_false(self):
        """Test is_coherent when gamma >= 0.3"""
        metrics = QuantumMetrics(
            phi=0.85,
            gamma=0.35,
            ccce=0.91,
            chi_pc=0.946,
            backend="ibm_fez",
            qubits=127,
            shots=100000,
            execution_time_s=0.023,
            success=True
        )
        
        assert metrics.is_coherent() is False
    
    def test_to_dict(self):
        """Test converting metrics to dict"""
        metrics = QuantumMetrics(
            phi=0.85,
            gamma=0.12,
            ccce=0.91,
            chi_pc=0.946,
            backend="ibm_fez",
            qubits=127,
            shots=100000,
            execution_time_s=0.023,
            success=True,
            job_id="test_job_123"
        )
        
        result = metrics.to_dict()
        
        assert result['phi'] == 0.85
        assert result['gamma'] == 0.12
        assert result['backend'] == "ibm_fez"
        assert result['job_id'] == "test_job_123"


class TestLambdaPhiEngine:
    """Test Lambda Phi physical constants engine"""
    
    def test_create_engine(self):
        """Test creating LambdaPhiEngine"""
        engine = LambdaPhiEngine()
        assert engine is not None
    
    def test_engine_has_constants(self):
        """Test engine exposes physical constants"""
        engine = LambdaPhiEngine()
        
        assert hasattr(engine, 'theta') or hasattr(engine, 'THETA_LOCK_DEG')
        assert hasattr(engine, 'phi_threshold') or hasattr(engine, 'PHI_THRESHOLD_FIDELITY')


class TestAeternaPorta:
    """Test Aeterna Porta quantum backend"""
    
    def test_create_backend(self):
        """Test creating AeternaPorta instance"""
        backend = AeternaPorta()
        assert backend is not None
    
    def test_backend_initialization(self):
        """Test backend initializes without errors"""
        backend = AeternaPorta()
        assert backend is not None
    
    @pytest.mark.asyncio
    async def test_mock_execution(self):
        """Test backend execution with mock mode"""
        backend = AeternaPorta()
        
        # Most tests will be in integration, this is just structure validation
        assert hasattr(backend, 'execute') or callable(getattr(backend, 'execute_circuit', None))
