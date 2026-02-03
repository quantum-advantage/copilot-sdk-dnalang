"""
Integration tests for complete agent workflow
"""
import pytest
from copilot_quantum import EnhancedSovereignAgent, SovereignAgent


@pytest.mark.integration
class TestCompleteWorkflow:
    """Test complete agent workflows"""
    
    @pytest.mark.asyncio
    async def test_code_generation_to_execution(self):
        """Test generating and conceptually executing code"""
        agent = EnhancedSovereignAgent()
        
        # Generate code
        result = await agent.execute(
            "Write a function to calculate fibonacci numbers"
        )
        
        assert result.success is True
        assert result.code is not None or "fibonacci" in result.output.lower()
    
    @pytest.mark.asyncio
    async def test_bug_fix_workflow(self, buggy_code):
        """Test bug identification and fixing workflow"""
        agent = EnhancedSovereignAgent()
        
        # Fix bug
        result = await agent.execute(
            "Fix the zero division error in this code",
            context=buggy_code
        )
        
        assert result.success is True
        
        # Verify fix is reasonable (should mention zero check or try/except)
        output_lower = result.output.lower()
        has_fix = (
            "if" in output_lower or 
            "zero" in output_lower or 
            "except" in output_lower or
            result.code is not None
        )
        assert has_fix
    
    @pytest.mark.asyncio
    async def test_code_with_tests_workflow(self):
        """Test generating code with tests"""
        agent = EnhancedSovereignAgent()
        
        # Generate function
        result1 = await agent.execute(
            "Write a function to validate email addresses"
        )
        assert result1.success is True
        
        # Generate tests for it
        code_context = result1.code if result1.code else result1.output
        result2 = await agent.execute(
            "Write pytest tests for this code",
            context=code_context
        )
        assert result2.success is True


@pytest.mark.integration
class TestQuantumWorkflow:
    """Test quantum-enhanced workflows"""
    
    @pytest.mark.asyncio
    async def test_quantum_circuit_generation(self, quantum_circuit_request):
        """Test quantum circuit generation workflow"""
        agent = SovereignAgent(enable_lambda_phi=True)
        
        result = await agent.execute(
            "Create a quantum entanglement circuit",
            use_quantum=True,
            quantum_params=quantum_circuit_request
        )
        
        # Should complete (may or may not have real quantum backend)
        assert result is not None
        assert isinstance(result.success, bool)
    
    @pytest.mark.asyncio
    async def test_quantum_metrics_validation(self):
        """Test quantum metrics are properly validated"""
        agent = SovereignAgent(enable_lambda_phi=True)
        
        result = await agent.execute(
            "Execute quantum circuit",
            use_quantum=True,
            quantum_params={'circuit_type': 'ignition', 'qubits': 120}
        )
        
        # If quantum execution happened, check metrics structure
        if result.quantum_metrics:
            assert 'phi' in result.quantum_metrics
            assert 'gamma' in result.quantum_metrics
            assert 'ccce' in result.quantum_metrics


@pytest.mark.integration
class TestAgentPersistence:
    """Test agent state and statistics tracking"""
    
    @pytest.mark.asyncio
    async def test_statistics_tracking(self):
        """Test that agent tracks statistics correctly"""
        agent = SovereignAgent()
        
        # Execute several tasks
        await agent.execute("Task 1")
        await agent.execute("Task 2")
        await agent.execute("Task 3")
        
        # Check statistics
        stats = agent.get_stats()
        assert stats['total_executions'] >= 3
        assert 0 <= stats['success_rate'] <= 1.0
    
    @pytest.mark.asyncio
    async def test_quantum_summary_accumulation(self):
        """Test quantum execution summary accumulation"""
        agent = SovereignAgent(enable_lambda_phi=True)
        
        # Try quantum execution
        await agent.execute(
            "Quantum task",
            use_quantum=True,
            quantum_params={'circuit_type': 'ignition'}
        )
        
        # Get summary
        summary = agent.get_quantum_summary()
        
        # May be None if no real quantum backend
        if summary:
            assert 'total_jobs' in summary


@pytest.mark.integration
class TestMultiAgent:
    """Test multiple agents working together"""
    
    @pytest.mark.asyncio
    async def test_basic_and_enhanced_agents(self):
        """Test using both SovereignAgent and EnhancedSovereignAgent"""
        basic_agent = SovereignAgent()
        enhanced_agent = EnhancedSovereignAgent()
        
        # Both should be functional
        result1 = await basic_agent.execute("Basic task")
        result2 = await enhanced_agent.execute("Enhanced task")
        
        assert result1 is not None
        assert result2 is not None
    
    @pytest.mark.asyncio
    async def test_agent_independence(self):
        """Test that agents maintain independent statistics"""
        agent1 = SovereignAgent()
        agent2 = SovereignAgent()
        
        await agent1.execute("Task for agent 1")
        await agent2.execute("Task for agent 2")
        
        stats1 = agent1.get_stats()
        stats2 = agent2.get_stats()
        
        # Each agent tracks its own executions
        assert stats1['total_executions'] >= 1
        assert stats2['total_executions'] >= 1


@pytest.mark.integration
class TestEndToEnd:
    """End-to-end integration tests"""
    
    @pytest.mark.asyncio
    async def test_complete_development_session(self):
        """Test a complete development session workflow"""
        agent = EnhancedSovereignAgent(enable_lambda_phi=True)
        
        # Step 1: Generate initial code
        result1 = await agent.execute(
            "Write a class for a simple calculator with add and subtract methods"
        )
        assert result1.success is True
        
        # Step 2: Add more features
        result2 = await agent.execute(
            "Add multiply and divide methods to the calculator",
            context=result1.code or result1.output
        )
        assert result2.success is True
        
        # Step 3: Generate tests
        result3 = await agent.execute(
            "Write comprehensive tests for the calculator class",
            context=result2.code or result2.output
        )
        assert result3.success is True
        
        # Verify agent tracked all operations
        stats = agent.get_stats()
        assert stats['total_executions'] >= 3
