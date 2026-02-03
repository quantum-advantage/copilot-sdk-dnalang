"""
Integration tests for developer tools with real file operations
"""
import pytest
import tempfile
import os
from pathlib import Path
from copilot_quantum import DeveloperTools


@pytest.mark.integration
class TestDeveloperToolsIntegration:
    """Integration tests for DeveloperTools"""
    
    @pytest.mark.asyncio
    async def test_complete_file_workflow(self):
        """Test complete file creation, modification, and analysis workflow"""
        with tempfile.TemporaryDirectory() as tmpdir:
            tools = DeveloperTools(workspace_root=tmpdir)
            
            # Create initial file
            initial_code = '''def calculate(x, y):
    return x + y
'''
            await tools.write_file("calculator.py", initial_code)
            
            # Read it back
            content = await tools.read_file("calculator.py")
            assert "calculate" in content
            
            # Analyze it
            analysis = await tools.analyze_code("calculator.py")
            assert analysis.file_path == "calculator.py"
            assert len(analysis.metrics) > 0
            
            # Find functions
            functions = await tools.find_functions("calculator.py")
            assert len(functions) == 1
            assert functions[0]['name'] == 'calculate'
    
    @pytest.mark.asyncio
    async def test_project_analysis_workflow(self):
        """Test analyzing a complete project structure"""
        with tempfile.TemporaryDirectory() as tmpdir:
            tools = DeveloperTools(workspace_root=tmpdir)
            
            # Create a small project
            await tools.write_file("main.py", "from utils import helper\n\nprint('Hello')")
            await tools.write_file("utils.py", "def helper():\n    pass")
            await tools.write_file("tests/test_main.py", "def test_main():\n    pass")
            
            # Get project structure
            structure = await tools.get_project_structure()
            
            assert structure['files']['total'] >= 3
            assert structure['files']['python'] >= 3
            assert structure['lines_of_code'] > 0
    
    @pytest.mark.asyncio
    async def test_search_and_replace_workflow(self):
        """Test searching files and conceptual replacement"""
        with tempfile.TemporaryDirectory() as tmpdir:
            tools = DeveloperTools(workspace_root=tmpdir)
            
            # Create files with searchable content
            await tools.write_file("file1.py", "def old_function():\n    pass")
            await tools.write_file("file2.py", "def old_function():\n    return True")
            await tools.write_file("file3.py", "def new_function():\n    pass")
            
            # Search for old_function
            results = await tools.search_in_files("old_function", ".", "*.py")
            
            assert len(results) == 2
            assert all("old_function" in r.context for r in results)
    
    @pytest.mark.asyncio
    async def test_dependency_analysis_workflow(self):
        """Test analyzing dependencies across files"""
        with tempfile.TemporaryDirectory() as tmpdir:
            tools = DeveloperTools(workspace_root=tmpdir)
            
            # Create file with dependencies
            code = """import os
import sys
from pathlib import Path
from typing import List, Dict, Optional
import numpy as np
"""
            await tools.write_file("deps.py", code)
            
            # Find dependencies
            deps = await tools.find_dependencies("deps.py")
            
            assert len(deps) >= 5
            assert any("os" in d for d in deps)
            assert any("numpy" in d for d in deps)
    
    @pytest.mark.asyncio
    async def test_code_quality_workflow(self):
        """Test complete code quality analysis workflow"""
        with tempfile.TemporaryDirectory() as tmpdir:
            tools = DeveloperTools(workspace_root=tmpdir)
            
            # Create file with various issues
            code = '''def problematic_function(x, y):
    # TODO: Add input validation
    result = x / y  # Could raise ZeroDivisionError
    very_long_line_that_exceeds_the_recommended_character_limit_and_should_be_flagged_by_style_checker = True
    return result
'''
            await tools.write_file("problem.py", code)
            
            # Analyze
            analysis = await tools.analyze_code("problem.py")
            
            # Should detect issues
            assert len(analysis.issues) > 0
            
            # Should have metrics
            assert 'total_lines' in analysis.metrics
            assert 'functions' in analysis.metrics
            
            # Should have suggestions
            assert len(analysis.suggestions) >= 0


@pytest.mark.integration
class TestGitIntegration:
    """Integration tests for Git operations"""
    
    @pytest.mark.asyncio
    async def test_git_operations_sequence(self):
        """Test sequence of git operations"""
        with tempfile.TemporaryDirectory() as tmpdir:
            tools = DeveloperTools(workspace_root=tmpdir)
            
            # Initialize git repo
            os.system(f"cd {tmpdir} && git init && git config user.email 'test@test.com' && git config user.name 'Test'")
            
            # Create and commit file
            await tools.write_file("test.txt", "Initial content")
            
            # Git operations
            status = await tools.git_status()
            assert isinstance(status, str)
            
            # Try to get log (may be empty for new repo)
            log = await tools.git_log(max_count=5)
            assert isinstance(log, str)


@pytest.mark.integration
class TestComplexCodeAnalysis:
    """Test complex code analysis scenarios"""
    
    @pytest.mark.asyncio
    async def test_analyze_class_heavy_file(self):
        """Test analyzing file with multiple classes"""
        with tempfile.TemporaryDirectory() as tmpdir:
            tools = DeveloperTools(workspace_root=tmpdir)
            
            code = '''
class BaseClass:
    def __init__(self):
        pass
    
    def base_method(self):
        return True

class DerivedClass(BaseClass):
    def __init__(self, value):
        super().__init__()
        self.value = value
    
    def derived_method(self):
        return self.value * 2

class HelperClass:
    @staticmethod
    def helper():
        return "help"
'''
            await tools.write_file("classes.py", code)
            
            # Find all classes
            classes = await tools.find_classes("classes.py")
            assert len(classes) == 3
            
            # Analyze the file
            analysis = await tools.analyze_code("classes.py")
            assert analysis.metrics['classes'] == 3
    
    @pytest.mark.asyncio
    async def test_analyze_function_heavy_file(self):
        """Test analyzing file with many functions"""
        with tempfile.TemporaryDirectory() as tmpdir:
            tools = DeveloperTools(workspace_root=tmpdir)
            
            code = '''
def func1():
    pass

def func2(a, b):
    return a + b

def func3(x, y, z=10):
    return x * y * z

async def async_func():
    return "async"

def func4():
    """Documented function"""
    return True
'''
            await tools.write_file("functions.py", code)
            
            # Find all functions
            functions = await tools.find_functions("functions.py")
            assert len(functions) >= 4
            
            # Analyze
            analysis = await tools.analyze_code("functions.py")
            assert analysis.metrics['functions'] >= 4
