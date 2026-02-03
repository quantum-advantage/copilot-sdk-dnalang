"""
Unit tests for SovereignAgent
"""
import pytest
from copilot_quantum.agent import SovereignAgent, AgentResult


class TestSovereignAgent:
    """Test SovereignAgent initialization and basic operations"""
    
    def test_create_agent(self):
        """Test creating SovereignAgent"""
        agent = SovereignAgent()
        assert agent is not None
    
    def test_agent_with_quantum(self):
        """Test creating agent with quantum backend"""
        agent = SovereignAgent(enable_lambda_phi=True)
        assert agent is not None
    
    def test_agent_configuration(self):
        """Test agent configuration options"""
        agent = SovereignAgent(
            enable_lambda_phi=True,
            enable_nclm=False,
            copilot_mode="local"
        )
        assert agent is not None
    
    @pytest.mark.asyncio
    async def test_execute_basic(self):
        """Test basic agent execution"""
        agent = SovereignAgent()
        
        result = await agent.execute("Test prompt")
        
        assert isinstance(result, AgentResult)
        assert result.success is True or result.error is not None
    
    @pytest.mark.asyncio
    async def test_execute_returns_result(self):
        """Test execute returns AgentResult"""
        agent = SovereignAgent()
        
        result = await agent.execute("Simple task")
        
        assert hasattr(result, 'output')
        assert hasattr(result, 'success')
        assert hasattr(result, 'execution_time_s')
    
    def test_get_stats(self):
        """Test getting agent statistics"""
        agent = SovereignAgent()
        
        stats = agent.get_stats()
        
        assert isinstance(stats, dict)
        assert 'total_executions' in stats
        assert 'success_rate' in stats
    
    def test_get_quantum_summary(self):
        """Test getting quantum execution summary"""
        agent = SovereignAgent(enable_lambda_phi=True)
        
        summary = agent.get_quantum_summary()
        
        # May be None if no quantum executions yet
        assert summary is None or isinstance(summary, dict)


class TestAgentResult:
    """Test AgentResult dataclass"""
    
    def test_create_result(self):
        """Test creating AgentResult"""
        result = AgentResult(
            output="Test output",
            success=True,
            execution_time_s=0.5
        )
        
        assert result.output == "Test output"
        assert result.success is True
        assert result.execution_time_s == 0.5
    
    def test_result_with_quantum_metrics(self):
        """Test result with quantum metrics"""
        result = AgentResult(
            output="Quantum task complete",
            quantum_metrics={
                'phi': 0.85,
                'gamma': 0.12,
                'above_threshold': True
            },
            success=True
        )
        
        assert result.quantum_metrics is not None
        assert result.quantum_metrics['phi'] == 0.85
    
    def test_result_with_error(self):
        """Test result with error"""
        result = AgentResult(
            output="",
            success=False,
            error="Something went wrong"
        )
        
        assert result.success is False
        assert result.error == "Something went wrong"


@pytest.mark.asyncio
class TestAgentExecution:
    """Test agent execution scenarios"""
    
    async def test_classical_execution(self):
        """Test classical (non-quantum) execution"""
        agent = SovereignAgent()
        
        result = await agent.execute(
            "Explain Python list comprehension",
            use_quantum=False
        )
        
        assert result.quantum_metrics is None
    
    async def test_multiple_executions(self):
        """Test multiple sequential executions"""
        agent = SovereignAgent()
        
        result1 = await agent.execute("Task 1")
        result2 = await agent.execute("Task 2")
        
        stats = agent.get_stats()
        assert stats['total_executions'] >= 2
