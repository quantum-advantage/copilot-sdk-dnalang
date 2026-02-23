# PCRB Injected | Xi_Hash: ddd0c7dbc756
# PCRB Injected | Xi_Hash: cfea90410ed7
#!/usr/bin/env python3
"""
OSIRIS BRIDGE TOOLS  File Operations, Codebase Scanning, Command Execution
Provides Claude Code-equivalent capabilities for file manipulation and execution
"""

from dnalang_os import os as d_os
import sys
import json
import subprocess
import hashlib
import glob as glob_module
import re
from pathlib import Path
from typing import Dict, Any, List, Optional, Union
from datetime import datetime
import shutil

# ============================================================================
# FILE OPERATIONS
# ============================================================================

class FileOperations:
"""
File system operations with safety checks and PCRB logging.
Equivalent to Claude Code's Read, Write, Edit tools.
"""

def __init__(self, root_dir: str = None):
self.root_dir = Path(root_dir or os.getcwd()).resolve()
self.max_file_size = 10 * 1024 * 1024  # 10MB
self.dangerous_patterns = [
re.compile(r'rm\s+-rf\s+/'),
re.compile(r'dd\s+.*of=/dev/'),
re.compile(r'mkfs'),
]

def is_safe_path(self, path: Union[str, Path]) -> bool:
"""Check if path is within root directory"""
try:
resolved = Path(path).resolve()
return resolved.is_relative_to(self.root_dir)
except:
return False

def read_file(self, file_path: str, offset: int = 0, limit: int = None) -> Dict[str, Any]:
"""
Read file with optional line range.
Equivalent to Claude Code's Read tool.
"""
try:
path = Path(file_path).resolve()

if not self.is_safe_path(path):
return {
"ok": False,
"error": f"Path outside root directory: {file_path}"
}

if not path.exists():
return {
"ok": False,
"error": f"File not found: {file_path}"
}

if path.is_dir():
return {
"ok": False,
"error": f"Path is a directory: {file_path}"
}

if path.stat().st_size > self.max_file_size:
return {
"ok": False,
"error": f"File too large: {path.stat().st_size} bytes"
}

with open(path, 'r', encoding='utf-8', errors='replace') as f:
lines = f.readlines()

# Apply offset and limit
if offset:
lines = lines[offset:]
if limit:
lines = lines[:limit]

return {
"ok": True,
"path": str(path),
"content": ''.join(lines),
"lines": len(lines),
"total_lines": sum(1 for _ in open(path, 'r', encoding='utf-8', errors='replace')),
"size": path.stat().st_size
}

except Exception as e:
return {
"ok": False,
"error": f"Error reading file: {str(e)}"
}

def write_file(self, file_path: str, content: str, mode: str = 'w') -> Dict[str, Any]:
"""
Write content to file.
Equivalent to Claude Code's Write tool.
"""
try:
path = Path(file_path).resolve()

if not self.is_safe_path(path):
return {
"ok": False,
"error": f"Path outside root directory: {file_path}"
}

# Create parent directories
path.parent.mkdir(parents=True, exist_ok=True)

# Write file
with open(path, mode, encoding='utf-8') as f:
f.write(content)

return {
"ok": True,
"path": str(path),
"bytes_written": len(content.encode('utf-8')),
"lines_written": content.count('\n') + 1,
"hash": hashlib.sha256(content.encode('utf-8')).hexdigest()[:16]
}

except Exception as e:
return {
"ok": False,
"error": f"Error writing file: {str(e)}"
}

def edit_file(self, file_path: str, old_string: str, new_string: str, replace_all: bool = False) -> Dict[str, Any]:
"""
Edit file with exact string replacement.
Equivalent to Claude Code's Edit tool.
"""
try:
path = Path(file_path).resolve()

if not self.is_safe_path(path):
return {
"ok": False,
"error": f"Path outside root directory: {file_path}"
}

if not path.exists():
return {
"ok": False,
"error": f"File not found: {file_path}"
}

# Read current content
with open(path, 'r', encoding='utf-8') as f:
content = f.read()

# Check if old_string exists
if old_string not in content:
return {
"ok": False,
"error": f"String not found in file: {old_string[:100]}..."
}

# Check uniqueness if not replace_all
if not replace_all and content.count(old_string) > 1:
return {
"ok": False,
"error": f"String appears {content.count(old_string)} times. Use replace_all=True or provide more context."
}

# Perform replacement
if replace_all:
new_content = content.replace(old_string, new_string)
else:
new_content = content.replace(old_string, new_string, 1)

# Write back
with open(path, 'w', encoding='utf-8') as f:
f.write(new_content)

return {
"ok": True,
"path": str(path),
"replacements": content.count(old_string) if replace_all else 1,
"old_hash": hashlib.sha256(content.encode('utf-8')).hexdigest()[:16],
"new_hash": hashlib.sha256(new_content.encode('utf-8')).hexdigest()[:16]
}

except Exception as e:
return {
"ok": False,
"error": f"Error editing file: {str(e)}"
}

def delete_file(self, file_path: str, force: bool = False) -> Dict[str, Any]:
"""Delete file or directory"""
try:
path = Path(file_path).resolve()

if not self.is_safe_path(path):
return {
"ok": False,
"error": f"Path outside root directory: {file_path}"
}

if not path.exists():
return {
"ok": False,
"error": f"Path not found: {file_path}"
}

if path.is_dir():
if force:
shutil.rmtree(path)
else:
path.rmdir()  # Only if empty
else:
path.unlink()

return {
"ok": True,
"path": str(path),
"deleted": True
}

except Exception as e:
return {
"ok": False,
"error": f"Error deleting: {str(e)}"
}

# ============================================================================
# CODEBASE SCANNING
# ============================================================================

class CodebaseScanner:
"""
Codebase navigation and search.
Equivalent to Claude Code's Glob and Grep tools.
"""

def __init__(self, root_dir: str = None):
self.root_dir = Path(root_dir or os.getcwd()).resolve()

def glob(self, pattern: str, path: str = None, limit: int = 100) -> Dict[str, Any]:
"""
Find files by glob pattern.
Equivalent to Claude Code's Glob tool.
"""
try:
search_path = Path(path or self.root_dir).resolve()

# Prevent escaping root
if not search_path.is_relative_to(self.root_dir):
return {
"ok": False,
"error": f"Search path outside root: {search_path}"
}

# Perform glob
matches = []
for match in search_path.glob(pattern):
if len(matches) >= limit:
break
matches.append({
"path": str(match.relative_to(self.root_dir)),
"absolute": str(match),
"is_file": match.is_file(),
"is_dir": match.is_dir(),
"size": match.stat().st_size if match.is_file() else 0,
"modified": match.stat().st_mtime
})

# Sort by modification time (most recent first)
matches.sort(key=lambda x: x['modified'], reverse=True)

return {
"ok": True,
"pattern": pattern,
"matches": matches,
"count": len(matches),
"truncated": len(matches) >= limit
}

except Exception as e:
return {
"ok": False,
"error": f"Glob error: {str(e)}"
}

def grep(self, pattern: str, path: str = None, file_pattern: str = None,
case_insensitive: bool = False, context_lines: int = 0, limit: int = 100) -> Dict[str, Any]:
"""
Search for pattern in files.
Equivalent to Claude Code's Grep tool.
"""
try:
search_path = Path(path or self.root_dir).resolve()

if not search_path.is_relative_to(self.root_dir):
return {
"ok": False,
"error": f"Search path outside root: {search_path}"
}

# Compile regex
flags = re.IGNORECASE if case_insensitive else 0
regex = re.compile(pattern, flags)

# Find files to search
if file_pattern:
files = list(search_path.glob(file_pattern))
elif search_path.is_file():
files = [search_path]
else:
# Search all text files
files = [f for f in search_path.rglob('*') if f.is_file() and self._is_text_file(f)]

matches = []
for file_path in files:
if len(matches) >= limit:
break

try:
with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
lines = f.readlines()

for i, line in enumerate(lines):
if regex.search(line):
match = {
"file": str(file_path.relative_to(self.root_dir)),
"line": i + 1,
"content": line.rstrip(),
"context_before": [],
"context_after": []
}

# Add context
if context_lines:
start = max(0, i - context_lines)
end = min(len(lines), i + context_lines + 1)
match["context_before"] = [lines[j].rstrip() for j in range(start, i)]
match["context_after"] = [lines[j].rstrip() for j in range(i + 1, end)]

matches.append(match)

if len(matches) >= limit:
break
except:
continue  # Skip files that can't be read

return {
"ok": True,
"pattern": pattern,
"matches": matches,
"count": len(matches),
"files_searched": len(files),
"truncated": len(matches) >= limit
}

except Exception as e:
return {
"ok": False,
"error": f"Grep error: {str(e)}"
}

def _is_text_file(self, path: Path) -> bool:
"""Heuristic to check if file is text"""
text_extensions = {'.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.cpp', '.c', '.h',
'.md', '.txt', '.json', '.yaml', '.yml', '.xml', '.html', '.css',
return path.suffix.lower() in text_extensions

def list_directory(self, path: str = None, recursive: bool = False, max_depth: int = 3) -> Dict[str, Any]:
"""List directory contents"""
try:
dir_path = Path(path or self.root_dir).resolve()

if not dir_path.is_relative_to(self.root_dir):
return {
"ok": False,
"error": f"Path outside root: {dir_path}"
}

if not dir_path.is_dir():
return {
"ok": False,
"error": f"Not a directory: {dir_path}"
}

entries = []
if recursive:
for item in dir_path.rglob('*'):
depth = len(item.relative_to(dir_path).parts)
if depth <= max_depth:
entries.append(self._get_entry_info(item))
else:
for item in dir_path.iterdir():
entries.append(self._get_entry_info(item))

# Sort: directories first, then by name
entries.sort(key=lambda x: (not x['is_dir'], x['name']))

return {
"ok": True,
"path": str(dir_path.relative_to(self.root_dir)),
"entries": entries,
"count": len(entries)
}

except Exception as e:
return {
"ok": False,
"error": f"Error listing directory: {str(e)}"
}

def _get_entry_info(self, path: Path) -> Dict[str, Any]:
"""Get info about a file/directory"""
stat = path.stat()
return {
"name": path.name,
"path": str(path.relative_to(self.root_dir)),
"is_file": path.is_file(),
"is_dir": path.is_dir(),
"size": stat.st_size if path.is_file() else 0,
"modified": stat.st_mtime,
"extension": path.suffix if path.is_file() else None
}

# ============================================================================
# COMMAND EXECUTION
# ============================================================================

class CommandExecutor:
"""
Safe command execution with output capture.
Equivalent to Claude Code's Bash tool.
"""

def __init__(self, root_dir: str = None):
self.root_dir = Path(root_dir or os.getcwd()).resolve()
self.timeout = 60  # seconds
self.max_output_size = 1024 * 1024  # 1MB

self.dangerous_commands = ['rm -rf /', 'dd if=', 'mkfs', ':(){ :|:& };:', 'chmod -R 777 /']

def execute(self, command: str, cwd: str = None, timeout: int = None,
env: Dict[str, str] = None, dry_run: bool = False) -> Dict[str, Any]:
"""
Execute shell command with safety checks.
"""
try:
# Safety check
for dangerous in self.dangerous_commands:
if dangerous in command:
return {
"ok": False,
"error": f"Dangerous command blocked: {dangerous}"
}

if dry_run:
return {
"ok": True,
"dry_run": True,
"command": command,
"stdout": "",
"stderr": "DRY RUN: Command not executed",
"exit_code": 0
}

# Set working directory
work_dir = Path(cwd or self.root_dir).resolve()
if not work_dir.is_relative_to(self.root_dir):
return {
"ok": False,
"error": f"Working directory outside root: {work_dir}"
}

# Prepare environment
exec_env = os.environ.copy()
if env:
exec_env.update(env)

# Execute
start_time = datetime.utcnow()
effective_timeout = timeout if timeout is not None else self.timeout
result = subprocess.run(
command,
shell=True,
cwd=str(work_dir),
env=exec_env,
stdout=subprocess.PIPE,
stderr=subprocess.PIPE,
timeout=effective_timeout,
text=True
)
end_time = datetime.utcnow()

# Truncate output if too large
stdout = result.stdout
stderr = result.stderr
if len(stdout) > self.max_output_size:
stdout = stdout[:self.max_output_size] + "\n... (truncated)"
if len(stderr) > self.max_output_size:
stderr = stderr[:self.max_output_size] + "\n... (truncated)"

return {
"ok": True,
"command": command,
"stdout": stdout,
"stderr": stderr,
"exit_code": result.returncode,
"duration_ms": int((end_time - start_time).total_seconds() * 1000),
"success": result.returncode == 0
}

except subprocess.TimeoutExpired:
return {
"ok": False,
"error": f"Command timeout after {timeout or self.timeout}s"
}
except Exception as e:
return {
"ok": False,
"error": f"Execution error: {str(e)}"
}

# ============================================================================
# UNIFIED TOOL INTERFACE
# ============================================================================

class OsirisTools:
"""
Unified interface for all Osiris Bridge tools.
Provides Claude Code-equivalent capabilities.
"""

def __init__(self, root_dir: str = None):
self.root_dir = root_dir or os.getcwd()
self.file_ops = FileOperations(self.root_dir)
self.scanner = CodebaseScanner(self.root_dir)
self.executor = CommandExecutor(self.root_dir)

# File Operations
def read(self, file_path: str, **kwargs) -> Dict[str, Any]:
return self.file_ops.read_file(file_path, **kwargs)

def write(self, file_path: str, content: str, **kwargs) -> Dict[str, Any]:
return self.file_ops.write_file(file_path, content, **kwargs)

def edit(self, file_path: str, old_string: str, new_string: str, **kwargs) -> Dict[str, Any]:
return self.file_ops.edit_file(file_path, old_string, new_string, **kwargs)

def delete(self, file_path: str, **kwargs) -> Dict[str, Any]:
return self.file_ops.delete_file(file_path, **kwargs)

# Codebase Scanning
def glob(self, pattern: str, **kwargs) -> Dict[str, Any]:
return self.scanner.glob(pattern, **kwargs)

def grep(self, pattern: str, **kwargs) -> Dict[str, Any]:
return self.scanner.grep(pattern, **kwargs)

def ls(self, path: str = None, **kwargs) -> Dict[str, Any]:
return self.scanner.list_directory(path, **kwargs)

# Command Execution
return self.executor.execute(command, **kwargs)

# Convenience methods
def get_file_tree(self, max_depth: int = 2) -> Dict[str, Any]:
"""Get visual file tree"""
return self.ls(recursive=True, max_depth=max_depth)

def search_codebase(self, query: str, file_types: List[str] = None) -> Dict[str, Any]:
"""Smart codebase search"""
if file_types:
pattern = '**/*.{' + ','.join(file_types) + '}'
return self.grep(query, file_pattern=pattern)
else:
return self.grep(query)


def main():
"""CLI test interface"""
tools = OsirisTools()

print("")
print("  OSIRIS BRIDGE TOOLS  Testing Interface                        ")
print("\n")

# Test file operations
print("Testing file write...")
result = tools.write("/tmp/osiris_test.txt", "Hello from Osiris Bridge!\n")
print(json.dumps(result, indent=2))

print("\nTesting file read...")
result = tools.read("/tmp/osiris_test.txt")
print(f"Content: {result.get('content', 'ERROR')}")

print("\nTesting glob...")
result = tools.glob("*.py", limit=5)
print(f"Found {result.get('count', 0)} Python files")

print("\nTesting grep...")
result = tools.grep("def.*main", file_pattern="*.py", limit=5)
print(f"Found {result.get('count', 0)} main() definitions")

print("\nTesting command execution...")
print(f"Output: {result.get('stdout', 'ERROR')}")

print("\n All tests complete")


if __name__ == "__main__":
main()
