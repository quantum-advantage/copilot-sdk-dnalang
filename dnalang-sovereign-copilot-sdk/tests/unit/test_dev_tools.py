"""
Unit tests for developer tools
"""
import pytest
import tempfile
import os
from pathlib import Path
from copilot_quantum.dev_tools import (
    DeveloperTools,
    FileSearchResult,
    CodeAnalysisResult
)


class TestDeveloperTools:
    """Test DeveloperTools initialization"""
    
    def test_create_tools(self):
        """Test creating DeveloperTools instance"""
        tools = DeveloperTools()
        assert tools is not None
    
    def test_tools_with_workspace(self):
        """Test creating tools with custom workspace"""
        with tempfile.TemporaryDirectory() as tmpdir:
            tools = DeveloperTools(workspace_root=tmpdir)
            assert tools.workspace_root == tmpdir


class TestFileOperations:
    """Test file system operations"""
    
    @pytest.mark.asyncio
    async def test_write_and_read_file(self):
        """Test writing and reading files"""
        with tempfile.TemporaryDirectory() as tmpdir:
            tools = DeveloperTools(workspace_root=tmpdir)
            
            # Write file
            content = "Hello, World!"
            success = await tools.write_file("test.txt", content)
            assert success is True
            
            # Read file
            result = await tools.read_file("test.txt")
            assert result == content
    
    @pytest.mark.asyncio
    async def test_read_nonexistent_file(self):
        """Test reading non-existent file returns error"""
        with tempfile.TemporaryDirectory() as tmpdir:
            tools = DeveloperTools(workspace_root=tmpdir)
            
            result = await tools.read_file("nonexistent.txt")
            assert "Error" in result
    
    @pytest.mark.asyncio
    async def test_list_files(self):
        """Test listing files in directory"""
        with tempfile.TemporaryDirectory() as tmpdir:
            tools = DeveloperTools(workspace_root=tmpdir)
            
            # Create some files
            await tools.write_file("file1.py", "content1")
            await tools.write_file("file2.py", "content2")
            await tools.write_file("file3.txt", "content3")
            
            # List all files
            files = await tools.list_files(".")
            assert len(files) == 3
            
            # List with pattern
            py_files = await tools.list_files(".", pattern="*.py")
            assert len(py_files) == 2
    
    @pytest.mark.asyncio
    async def test_list_files_recursive(self):
        """Test recursive file listing"""
        with tempfile.TemporaryDirectory() as tmpdir:
            tools = DeveloperTools(workspace_root=tmpdir)
            
            # Create nested structure
            await tools.write_file("root.py", "root")
            await tools.write_file("subdir/nested.py", "nested")
            
            # List recursively
            files = await tools.list_files(".", pattern="*.py", recursive=True)
            assert len(files) >= 2


class TestSearchOperations:
    """Test search operations"""
    
    @pytest.mark.asyncio
    async def test_search_in_files(self):
        """Test searching for text in files"""
        with tempfile.TemporaryDirectory() as tmpdir:
            tools = DeveloperTools(workspace_root=tmpdir)
            
            # Create files with searchable content
            await tools.write_file("file1.py", "def hello():\n    print('Hello')")
            await tools.write_file("file2.py", "def goodbye():\n    print('Goodbye')")
            
            # Search for 'def'
            results = await tools.search_in_files("def", ".", "*.py")
            assert len(results) == 2
            
            # Search for 'Hello'
            results = await tools.search_in_files("Hello", ".", "*.py")
            assert len(results) == 1
            assert "file1.py" in results[0].path
    
    @pytest.mark.asyncio
    async def test_search_case_insensitive(self):
        """Test case-insensitive search"""
        with tempfile.TemporaryDirectory() as tmpdir:
            tools = DeveloperTools(workspace_root=tmpdir)
            
            await tools.write_file("test.py", "Hello World")
            
            # Case-insensitive search
            results = await tools.search_in_files("hello", ".", "*.py", case_sensitive=False)
            assert len(results) == 1


class TestCodeAnalysis:
    """Test code analysis features"""
    
    @pytest.mark.asyncio
    async def test_analyze_code(self):
        """Test code analysis"""
        with tempfile.TemporaryDirectory() as tmpdir:
            tools = DeveloperTools(workspace_root=tmpdir)
            
            code = """def factorial(n):
    # TODO: Add input validation
    return 1 if n == 0 else n * factorial(n - 1)
"""
            await tools.write_file("factorial.py", code)
            
            result = await tools.analyze_code("factorial.py")
            
            assert result.file_path == "factorial.py"
            assert isinstance(result.issues, list)
            assert isinstance(result.metrics, dict)
            assert isinstance(result.suggestions, list)
    
    @pytest.mark.asyncio
    async def test_find_functions(self):
        """Test finding functions in file"""
        with tempfile.TemporaryDirectory() as tmpdir:
            tools = DeveloperTools(workspace_root=tmpdir)
            
            code = """def func1(a, b):
    pass

def func2():
    pass
"""
            await tools.write_file("funcs.py", code)
            
            functions = await tools.find_functions("funcs.py")
            
            assert len(functions) == 2
            assert functions[0]['name'] == 'func1'
            assert functions[1]['name'] == 'func2'
    
    @pytest.mark.asyncio
    async def test_find_classes(self):
        """Test finding classes in file"""
        with tempfile.TemporaryDirectory() as tmpdir:
            tools = DeveloperTools(workspace_root=tmpdir)
            
            code = """class MyClass:
    pass

class AnotherClass(BaseClass):
    pass
"""
            await tools.write_file("classes.py", code)
            
            classes = await tools.find_classes("classes.py")
            
            assert len(classes) == 2
            assert classes[0]['name'] == 'MyClass'
            assert classes[1]['name'] == 'AnotherClass'


class TestProjectOperations:
    """Test project-level operations"""
    
    @pytest.mark.asyncio
    async def test_get_project_structure(self):
        """Test getting project structure"""
        with tempfile.TemporaryDirectory() as tmpdir:
            tools = DeveloperTools(workspace_root=tmpdir)
            
            # Create some files
            await tools.write_file("main.py", "print('hello')")
            await tools.write_file("utils.py", "def util(): pass")
            
            structure = await tools.get_project_structure()
            
            assert structure['root'] == tmpdir
            assert structure['files']['total'] >= 2
            assert structure['files']['python'] >= 2
    
    @pytest.mark.asyncio
    async def test_find_dependencies(self):
        """Test finding imports/dependencies"""
        with tempfile.TemporaryDirectory() as tmpdir:
            tools = DeveloperTools(workspace_root=tmpdir)
            
            code = """import os
import sys
from pathlib import Path
from typing import List, Dict
"""
            await tools.write_file("deps.py", code)
            
            deps = await tools.find_dependencies("deps.py")
            
            assert len(deps) >= 4
            assert any("import os" in d for d in deps)
            assert any("from pathlib import Path" in d for d in deps)


class TestGitOperations:
    """Test git operations"""
    
    @pytest.mark.asyncio
    async def test_git_status(self):
        """Test git status (if in git repo)"""
        tools = DeveloperTools()
        
        # This will work if we're in a git repo, otherwise will return error
        result = await tools.git_status()
        assert isinstance(result, str)
    
    @pytest.mark.asyncio
    async def test_git_log(self):
        """Test git log (if in git repo)"""
        tools = DeveloperTools()
        
        result = await tools.git_log(max_count=5)
        assert isinstance(result, str)
