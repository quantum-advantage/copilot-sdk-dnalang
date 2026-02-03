"""
Integration tests for code generator with real scenarios
"""
import pytest
from copilot_quantum import QuantumNLPCodeGenerator, CodeIntent, CodeGenerationRequest


@pytest.mark.integration
class TestCodeGeneratorIntegration:
    """Integration tests for code generator"""
    
    def test_generate_multiple_functions(self):
        """Test generating multiple different functions"""
        generator = QuantumNLPCodeGenerator()
        
        test_cases = [
            "Write a function to calculate factorial",
            "Create a function to reverse a string",
            "Generate a function to check if number is prime",
            "Write a function to find maximum in array"
        ]
        
        for description in test_cases:
            request = CodeGenerationRequest(
                intent=CodeIntent.GENERATE_FUNCTION,
                description=description,
                language="python"
            )
            
            result = generator.generate(request)
            
            assert result.code is not None
            assert len(result.code) > 0
            assert result.confidence > 0
    
    def test_generate_class_with_methods(self):
        """Test generating classes with multiple methods"""
        generator = QuantumNLPCodeGenerator()
        
        request = CodeGenerationRequest(
            intent=CodeIntent.GENERATE_CLASS,
            description="Create a Person class with name, age, and a method to introduce themselves",
            language="python"
        )
        
        result = generator.generate(request)
        
        assert result.code is not None
        assert "class" in result.code.lower()
        assert "def" in result.code
    
    def test_fix_multiple_bugs(self):
        """Test fixing different types of bugs"""
        generator = QuantumNLPCodeGenerator()
        
        bug_cases = [
            ("def divide(a, b): return a / b", "Fix zero division"),
            ("def get_item(lst, idx): return lst[idx]", "Fix index out of range"),
            ("def parse_int(s): return int(s)", "Fix value error for invalid input")
        ]
        
        for code, description in bug_cases:
            request = CodeGenerationRequest(
                intent=CodeIntent.FIX_BUG,
                description=description,
                context=code,
                language="python"
            )
            
            result = generator.generate(request)
            
            assert result.code is not None
            # Fixed code should be different from original
            assert result.code != code or len(result.explanation) > 0
    
    def test_optimize_code(self):
        """Test code optimization"""
        generator = QuantumNLPCodeGenerator(use_quantum=True)
        
        slow_code = """
def find_duplicates(arr):
    duplicates = []
    for i in range(len(arr)):
        for j in range(i+1, len(arr)):
            if arr[i] == arr[j] and arr[i] not in duplicates:
                duplicates.append(arr[i])
    return duplicates
"""
        
        request = CodeGenerationRequest(
            intent=CodeIntent.OPTIMIZE,
            description="Optimize this function for better performance",
            context=slow_code,
            language="python",
            quantum_optimize=True
        )
        
        result = generator.generate(request)
        
        assert result.code is not None
        assert result.quantum_enhanced or result.ccce_score > 0
    
    def test_refactor_code(self):
        """Test code refactoring"""
        generator = QuantumNLPCodeGenerator()
        
        messy_code = """
def calc(a,b,op):
    if op=='+':
        return a+b
    elif op=='-':
        return a-b
    elif op=='*':
        return a*b
    elif op=='/':
        return a/b
    else:
        return None
"""
        
        request = CodeGenerationRequest(
            intent=CodeIntent.REFACTOR,
            description="Refactor to be more Pythonic and maintainable",
            context=messy_code,
            language="python"
        )
        
        result = generator.generate(request)
        
        assert result.code is not None
        assert len(result.suggestions) > 0
    
    def test_add_documentation(self):
        """Test adding documentation to code"""
        generator = QuantumNLPCodeGenerator()
        
        undocumented_code = """
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
"""
        
        request = CodeGenerationRequest(
            intent=CodeIntent.ADD_DOCS,
            description="Add comprehensive documentation",
            context=undocumented_code,
            language="python"
        )
        
        result = generator.generate(request)
        
        assert result.docs is not None or '"""' in result.code


@pytest.mark.integration
class TestGeneratorWithQuantum:
    """Test code generator with quantum enhancement"""
    
    def test_quantum_enhanced_generation(self):
        """Test that quantum enhancement affects output"""
        generator = QuantumNLPCodeGenerator(use_quantum=True)
        
        request = CodeGenerationRequest(
            intent=CodeIntent.OPTIMIZE,
            description="Create highly optimized sorting algorithm",
            language="python",
            quantum_optimize=True
        )
        
        result = generator.generate(request)
        
        # Should indicate quantum enhancement
        assert result.quantum_enhanced or result.ccce_score > 0.7
    
    def test_quantum_vs_classical(self):
        """Compare quantum-enhanced vs classical generation"""
        quantum_gen = QuantumNLPCodeGenerator(use_quantum=True)
        classical_gen = QuantumNLPCodeGenerator(use_quantum=False)
        
        description = "Optimize matrix multiplication"
        
        quantum_request = CodeGenerationRequest(
            intent=CodeIntent.OPTIMIZE,
            description=description,
            quantum_optimize=True
        )
        
        classical_request = CodeGenerationRequest(
            intent=CodeIntent.OPTIMIZE,
            description=description,
            quantum_optimize=False
        )
        
        quantum_result = quantum_gen.generate(quantum_request)
        classical_result = classical_gen.generate(classical_request)
        
        # Both should produce code
        assert quantum_result.code is not None
        assert classical_result.code is not None
        
        # Quantum should have different enhancement status
        assert quantum_result.quantum_enhanced != classical_result.quantum_enhanced


@pytest.mark.integration
class TestMultiLanguageSupport:
    """Test support for multiple programming languages"""
    
    def test_python_generation(self):
        """Test Python code generation"""
        generator = QuantumNLPCodeGenerator()
        
        request = CodeGenerationRequest(
            intent=CodeIntent.GENERATE_FUNCTION,
            description="Create a function to merge two sorted lists",
            language="python"
        )
        
        result = generator.generate(request)
        assert result.code is not None
    
    def test_javascript_generation(self):
        """Test JavaScript code generation"""
        generator = QuantumNLPCodeGenerator()
        
        request = CodeGenerationRequest(
            intent=CodeIntent.GENERATE_FUNCTION,
            description="Create a function to debounce API calls",
            language="javascript"
        )
        
        result = generator.generate(request)
        # Should attempt generation (may vary based on implementation)
        assert result.code is not None or result.explanation is not None
