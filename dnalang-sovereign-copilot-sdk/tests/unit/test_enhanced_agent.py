"""
Unit tests for EnhancedSovereignAgent
"""
import pytest
from copilot_quantum.enhanced_agent import EnhancedSovereignAgent, AgentResult


class TestEnhancedSovereignAgent:
    """Test EnhancedSovereignAgent"""
    
    def test_create_agent(self):
        """Test creating EnhancedSovereignAgent"""
        agent = EnhancedSovereignAgent()
        assert agent is not None
    
    def test_agent_configuration(self):
        """Test agent with configuration"""
        agent = EnhancedSovereignAgent(
            enable_lambda_phi=True,
            copilot_mode="local"
        )
        assert agent is not None
    
    @pytest.mark.asyncio
    async def test_execute_with_code_generation(self):
        """Test execution that generates code"""
        agent = EnhancedSovereignAgent()
        
        result = await agent.execute("Write a function to add two numbers")
        
        assert isinstance(result, AgentResult)
        assert result.code is not None or result.output is not None
    
    @pytest.mark.asyncio
    async def test_execute_returns_enhanced_result(self):
        """Test execute returns enhanced AgentResult"""
        agent = EnhancedSovereignAgent()
        
        result = await agent.execute("Test task")
        
        assert hasattr(result, 'output')
        assert hasattr(result, 'code')
        assert hasattr(result, 'success')


class TestCodeGeneration:
    """Test code generation capabilities"""
    
    @pytest.mark.asyncio
    async def test_generate_function(self, sample_code):
        """Test function generation"""
        agent = EnhancedSovereignAgent()
        
        result = await agent.execute("Write a factorial function")
        
        # Should have code output
        assert result.code is not None or "def" in result.output
    
    @pytest.mark.asyncio
    async def test_fix_bug(self, buggy_code):
        """Test bug fixing"""
        agent = EnhancedSovereignAgent()
        
        result = await agent.execute(
            "Fix the zero division bug",
            context=buggy_code
        )
        
        # Should provide fixed code or explanation
        assert result.success is True
    
    @pytest.mark.asyncio
    async def test_add_tests(self, sample_code):
        """Test adding tests to code"""
        agent = EnhancedSovereignAgent()
        
        result = await agent.execute(
            "Generate tests for this code",
            context=sample_code
        )
        
        assert result.code is not None or "test" in result.output.lower()


class TestFileOperations:
    """Test file operation capabilities"""
    
    @pytest.mark.asyncio
    async def test_read_file_capability(self):
        """Test agent can handle file reading requests"""
        agent = EnhancedSovereignAgent()
        
        # This tests the capability exists, not actual file I/O
        assert hasattr(agent, 'dev_tools') or hasattr(agent, 'read_file')
    
    @pytest.mark.asyncio
    async def test_search_capability(self):
        """Test agent has search capability"""
        agent = EnhancedSovereignAgent()
        
        # Check search-related methods exist
        assert hasattr(agent, 'dev_tools') or hasattr(agent, 'search_files')
