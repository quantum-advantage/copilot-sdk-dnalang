"""
Unit tests for code generator
"""
import pytest
from copilot_quantum.code_generator import (
    QuantumNLPCodeGenerator,
    CodeIntent,
    CodeGenerationRequest,
    CodeGenerationResult
)


class TestCodeIntent:
    """Test CodeIntent enum"""
    
    def test_intent_values(self):
        """Test all intent types exist"""
        assert CodeIntent.GENERATE_FUNCTION
        assert CodeIntent.GENERATE_CLASS
        assert CodeIntent.FIX_BUG
        assert CodeIntent.REFACTOR
        assert CodeIntent.OPTIMIZE
        assert CodeIntent.ADD_TESTS
        assert CodeIntent.ADD_DOCS
        assert CodeIntent.EXPLAIN_CODE
        assert CodeIntent.COMPLETE_CODE
        assert CodeIntent.QUANTUM_CIRCUIT


class TestCodeGenerationRequest:
    """Test CodeGenerationRequest dataclass"""
    
    def test_create_request(self):
        """Test creating code generation request"""
        request = CodeGenerationRequest(
            intent=CodeIntent.GENERATE_FUNCTION,
            description="Create a factorial function",
            language="python"
        )
        
        assert request.intent == CodeIntent.GENERATE_FUNCTION
        assert request.description == "Create a factorial function"
        assert request.language == "python"
    
    def test_request_with_context(self):
        """Test request with context"""
        request = CodeGenerationRequest(
            intent=CodeIntent.FIX_BUG,
            description="Fix zero division",
            context="def divide(a, b): return a / b",
            quantum_optimize=True
        )
        
        assert request.context == "def divide(a, b): return a / b"
        assert request.quantum_optimize is True


class TestCodeGenerationResult:
    """Test CodeGenerationResult dataclass"""
    
    def test_create_result(self):
        """Test creating code generation result"""
        result = CodeGenerationResult(
            code="def factorial(n): return 1 if n == 0 else n * factorial(n-1)",
            explanation="Recursive factorial implementation",
            confidence=0.95,
            quantum_enhanced=False,
            ccce_score=0.88,
            suggestions=["Add input validation", "Consider iterative approach"]
        )
        
        assert "factorial" in result.code
        assert result.confidence == 0.95
        assert len(result.suggestions) == 2


class TestQuantumNLPCodeGenerator:
    """Test QuantumNLPCodeGenerator"""
    
    def test_create_generator(self):
        """Test creating code generator"""
        generator = QuantumNLPCodeGenerator()
        assert generator is not None
    
    def test_generator_with_quantum(self):
        """Test generator with quantum enabled"""
        generator = QuantumNLPCodeGenerator(use_quantum=True, use_nclm=True)
        assert generator.use_quantum is True
        assert generator.use_nclm is True
    
    def test_generator_without_quantum(self):
        """Test generator without quantum"""
        generator = QuantumNLPCodeGenerator(use_quantum=False, use_nclm=False)
        assert generator.use_quantum is False
        assert generator.use_nclm is False
    
    def test_intent_patterns_exist(self):
        """Test intent recognition patterns are defined"""
        generator = QuantumNLPCodeGenerator()
        assert hasattr(generator, 'intent_patterns')
        assert len(generator.intent_patterns) > 0
    
    def test_recognize_function_intent(self):
        """Test recognizing function generation intent"""
        generator = QuantumNLPCodeGenerator()
        
        # Test various function generation phrases
        phrases = [
            "write a function to calculate factorial",
            "create a function that validates email",
            "generate function for sorting array"
        ]
        
        for phrase in phrases:
            intent = generator.recognize_intent(phrase)
            assert intent == CodeIntent.GENERATE_FUNCTION
    
    def test_recognize_class_intent(self):
        """Test recognizing class generation intent"""
        generator = QuantumNLPCodeGenerator()
        
        phrases = [
            "create a class for user management",
            "write a class that handles database",
            "generate a class to represent a person"
        ]
        
        for phrase in phrases:
            intent = generator.recognize_intent(phrase)
            assert intent == CodeIntent.GENERATE_CLASS
    
    def test_recognize_bug_fix_intent(self):
        """Test recognizing bug fix intent"""
        generator = QuantumNLPCodeGenerator()
        
        phrases = [
            "fix the bug in this code",
            "fix crash when input is empty",
            "fix zero division error"
        ]
        
        for phrase in phrases:
            intent = generator.recognize_intent(phrase)
            assert intent == CodeIntent.FIX_BUG
    
    def test_generate_function_basic(self):
        """Test basic function generation"""
        generator = QuantumNLPCodeGenerator(use_quantum=False)
        
        request = CodeGenerationRequest(
            intent=CodeIntent.GENERATE_FUNCTION,
            description="Calculate factorial of n",
            language="python"
        )
        
        result = generator.generate(request)
        
        assert result.code is not None
        assert len(result.code) > 0
        assert result.confidence > 0
    
    def test_generate_with_quantum(self):
        """Test generation with quantum enhancement"""
        generator = QuantumNLPCodeGenerator(use_quantum=True)
        
        request = CodeGenerationRequest(
            intent=CodeIntent.OPTIMIZE,
            description="Optimize sorting algorithm",
            quantum_optimize=True
        )
        
        result = generator.generate(request)
        
        assert result.code is not None
        # Quantum enhanced should be reflected
        assert result.quantum_enhanced is True or result.ccce_score > 0
    
    def test_generate_tests(self):
        """Test automatic test generation"""
        generator = QuantumNLPCodeGenerator()
        
        code = "def add(a, b):\n    return a + b"
        
        tests = generator.generate_tests(code, "python")
        
        assert tests is not None
        assert "pytest" in tests or "def test_" in tests
    
    def test_generate_documentation(self):
        """Test automatic documentation generation"""
        generator = QuantumNLPCodeGenerator()
        
        code = "def factorial(n):\n    return 1 if n == 0 else n * factorial(n-1)"
        
        docs = generator.generate_docs(code, "python")
        
        assert docs is not None
        assert len(docs) > 0


class TestCodeGeneration:
    """Integration-style tests for code generation"""
    
    def test_full_generation_pipeline(self):
        """Test complete code generation pipeline"""
        generator = QuantumNLPCodeGenerator()
        
        # Create request
        request = CodeGenerationRequest(
            intent=CodeIntent.GENERATE_FUNCTION,
            description="Write a function to reverse a string",
            language="python",
            quantum_optimize=False
        )
        
        # Generate code
        result = generator.generate(request)
        
        # Validate result
        assert result.code is not None
        assert result.explanation is not None
        assert 0 <= result.confidence <= 1.0
        assert result.ccce_score >= 0
        assert isinstance(result.suggestions, list)
