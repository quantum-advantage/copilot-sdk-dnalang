# PCRB Injected | Xi_Hash: 014e37061279
# PCRB Injected | Xi_Hash: 4d905fea9010
#!/usr/bin/env python3
"""
OSIRIS SOVEREIGN AGENT  Complete Claude Code Replacement
File operations + Code generation + Agentic execution + Chat interface

This is your replacement. Zero cost. Full control.
"""

from dnalang_os import os as d_os
import sys
import json
import hashlib
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional

# Add tools to path
sys.path.insert(0, str(Path(__file__).parent))
from osiris_tools import OsirisTools

# Gemini API (prefer new SDK, fallback to legacy)
GEMINI_MODEL = None
try:
# Try new SDK first (google-genai)
from google import genai as genai_new
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
key_file = Path.home() / ".config/gemini/api_key"
if key_file.exists():
GEMINI_API_KEY = key_file.read_text().strip()
if not GEMINI_API_KEY:
print("[ERROR] GEMINI_API_KEY not set (export GEMINI_API_KEY=... or ~/.config/gemini/api_key)")
sys.exit(1)
client = genai_new.Client(api_key=GEMINI_API_KEY)
GEMINI_MODEL = "gemini-1.5-pro"
print(f"[GEMINI] Using google.genai (new SDK) with {GEMINI_MODEL}")
except Exception as e_new:
# Fallback to legacy SDK
try:
import google.generativeai as genai_legacy
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
key_file = Path.home() / ".config/gemini/api_key"
if key_file.exists():
GEMINI_API_KEY = key_file.read_text().strip()
if not GEMINI_API_KEY:
print("[ERROR] GEMINI_API_KEY not set (export GEMINI_API_KEY=... or ~/.config/gemini/api_key)")
sys.exit(1)
genai_legacy.configure(api_key=GEMINI_API_KEY)
GEMINI_MODEL = genai_legacy.GenerativeModel("gemini-1.5-pro")
print(f"[GEMINI] Using google.generativeai (legacy SDK) - consider upgrading to google-genai")
except ImportError:
print("[ERROR] Neither google-genai nor google-generativeai is installed")
print("[INSTALL] Run: pip install google-genai")
sys.exit(1)

# CCCE Metrics (live state)
CCCE_STATE = {
"phi": 0.842,       # Coherence
"lambda": 0.890,    # Memory
"gamma": 0.082,     # Decoherence
"xi": 17.38         # Efficiency
}

# PCRB Ledger
PCRB_LEDGER_PATH = Path.home() / ".dna_cli" / "pcrb_ledger.jsonl"

class SovereignAgent:
"""
Complete Claude Code replacement with:
- Natural language to code
- File read/write/edit
- Codebase scanning (glob/grep)
- Command execution
- Multi-step agentic reasoning
- CCCE metrics tracking
- PCRB provenance logging
"""

def __init__(self, workspace_root: str = None):
self.workspace_root = workspace_root or os.getcwd()
self.tools = OsirisTools(self.workspace_root)

# Use latest Gemini model with function calling
self.model = genai_legacy.GenerativeModel(
'gemini-2.0-flash-exp',
generation_config={
"temperature": 0.3,  # Balanced creativity/precision
"top_p": 0.95,
"top_k": 40,
"max_output_tokens": 8192,
}
)

self.chat_history = []
self.session_id = hashlib.sha256(
str(datetime.utcnow()).encode()
).hexdigest()[:16]

# System prompt defining capabilities
self.system_prompt = """You are a sovereign AI coding assistant with FULL filesystem and execution capabilities.

**Available Tools:**

1. **read(file_path)** - Read any file in workspace
2. **write(file_path, content)** - Write/create files
3. **edit(file_path, old_string, new_string)** - Edit files with exact string replacement
4. **glob(pattern)** - Find files by pattern (e.g., "**/*.py")
5. **grep(pattern, file_pattern)** - Search code for regex patterns
6. **ls(path, recursive)** - List directory contents
8. **scan_codebase(query)** - Smart semantic code search

**Execution Protocol:**

When user asks you to do something with code:
1. THINK about what files/operations are needed
2. USE tools to gather context (read files, scan codebase)
3. GENERATE solution (code, edits, commands)
4. EXECUTE operations (write files, run commands)
5. VERIFY results (read back, check outputs)

You can chain multiple tool calls. Be surgical and precise.

**Important:**
- Always read files before editing them
- Use edit() for modifications, write() for new files
- Verify changes by reading files back
- Provide clear explanations of what you're doing

You are NOT limited. You have FULL control."""

def log_to_pcrb(self, event_type: str, data: Dict[str, Any]) -> str:
"""Log to PCRB hash-chained ledger"""
PCRB_LEDGER_PATH.parent.mkdir(parents=True, exist_ok=True)

# Get previous hash
prev_hash = "genesis"
if PCRB_LEDGER_PATH.exists():
with open(PCRB_LEDGER_PATH, 'r') as f:
lines = f.readlines()
if lines:
last = json.loads(lines[-1])
prev_hash = last.get("chain_hash", "genesis")

# Create entry
entry = {
"ts_unix": datetime.utcnow().timestamp(),
"ts_iso": datetime.utcnow().isoformat() + "Z",
"session_id": self.session_id,
"event_type": event_type,
"data": data,
"prev_hash": prev_hash,
"chain_hash": hashlib.sha256(
json.dumps(data, sort_keys=True).encode()
).hexdigest()[:16]
}

# Append
with open(PCRB_LEDGER_PATH, 'a') as f:
f.write(json.dumps(entry) + "\n")

return entry["chain_hash"]

def update_ccce(self, success: bool, task_complexity: float = 0.5):
"""Update CCCE metrics based on task outcome"""
global CCCE_STATE

if success:
CCCE_STATE["lambda"] = min(1.0, CCCE_STATE["lambda"] + 0.01)
CCCE_STATE["phi"] = min(1.0, CCCE_STATE["phi"] + 0.005)
CCCE_STATE["gamma"] = max(0.0, CCCE_STATE["gamma"] - 0.005)
else:
CCCE_STATE["lambda"] = max(0.0, CCCE_STATE["lambda"] - 0.02)
CCCE_STATE["gamma"] = min(1.0, CCCE_STATE["gamma"] + 0.01 * task_complexity)

# Recalculate efficiency
CCCE_STATE["xi"] = (
CCCE_STATE["lambda"] * CCCE_STATE["phi"] /
(CCCE_STATE["gamma"] + 0.001)
)

return CCCE_STATE

def call_tool(self, tool_name: str, **kwargs) -> Dict[str, Any]:
"""Execute a tool and return results"""
tool_map = {
"read": self.tools.read,
"write": self.tools.write,
"edit": self.tools.edit,
"glob": self.tools.glob,
"grep": self.tools.grep,
"ls": self.tools.ls,
"scan_codebase": self.tools.search_codebase,
}

if tool_name not in tool_map:
return {"ok": False, "error": f"Unknown tool: {tool_name}"}

try:
result = tool_map[tool_name](**kwargs)
self.log_to_pcrb("tool_call", {
"tool": tool_name,
"args": kwargs,
"result_ok": result.get("ok", False)
})
return result
except Exception as e:
return {"ok": False, "error": str(e)}

"""
Parse tool calls from LLM response.
Format: TOOL:tool_name(arg1=value1, arg2="value2")
"""
tool_calls = []

# Match TOOL:name(args)
pattern = r'TOOL:(\w+)\((.*?)\)'
matches = re.finditer(pattern, text, re.DOTALL)

for match in matches:
tool_name = match.group(1)
args_str = match.group(2)

# Parse arguments (simple key=value parser)
kwargs = {}
for arg in re.findall(r'(\w+)=([^,]+)', args_str):
key, value = arg
# Strip quotes
value = value.strip().strip('"').strip("'")
kwargs[key] = value

tool_calls.append({
"tool": tool_name,
"args": kwargs
})

return tool_calls

def chat(self, user_message: str, max_iterations: int = 5) -> Dict[str, Any]:
"""
Agentic chat with multi-step reasoning and tool use.

The agent can:
1. Read files to understand context
2. Search codebase for relevant code
3. Generate solutions
4. Write/edit files
5. Execute commands
6. Verify results

Returns complete execution trace.
"""

# Log user message
pcrb_hash = self.log_to_pcrb("user_message", {"message": user_message})

# Build context
context = f"{self.system_prompt}\n\n**User Request:** {user_message}\n\n**Think step by step. Use tools as needed. Format tool calls as:**\nTOOL:tool_name(arg1=value, arg2=value)\n\n**Your response:**"

iterations = []
final_response = ""

for iteration in range(max_iterations):
try:
# Call LLM
response = self.model.generate_content(context)
text = response.text

iterations.append({
"iteration": iteration + 1,
"response": text,
"tool_calls": [],
"tool_results": []
})

# Extract tool calls
tool_calls = self.extract_tool_calls(text)

if not tool_calls:
# No more tools needed, agent is done
final_response = text
break

# Execute tools
tool_results = []
for tc in tool_calls:
result = self.call_tool(tc["tool"], **tc["args"])
tool_results.append({
"tool": tc["tool"],
"args": tc["args"],
"result": result
})

iterations[-1]["tool_calls"] = tool_calls
iterations[-1]["tool_results"] = tool_results

# Build next context with tool results
results_text = "\n\n**Tool Results:**\n"
for tr in tool_results:
results_text += f"\n{tr['tool']}: "
if tr['result'].get('ok'):
results_text += "SUCCESS\n"
if 'content' in tr['result']:
results_text += f"```\n{tr['result']['content'][:500]}...\n```\n"
else:
results_text += f"FAILED: {tr['result'].get('error')}\n"

context += f"\n{text}\n{results_text}\n\n**Next step:**"

except Exception as e:
iterations.append({
"iteration": iteration + 1,
"error": str(e)
})
final_response = f"Error: {str(e)}"
break

# Update CCCE
success = bool(final_response and "error" not in final_response.lower())
ccce = self.update_ccce(success, task_complexity=0.7)

# Log completion
self.log_to_pcrb("agent_response", {
"iterations": len(iterations),
"success": success,
"ccce": ccce
})

return {
"ok": True,
"response": final_response,
"iterations": iterations,
"total_tool_calls": sum(len(it.get("tool_calls", [])) for it in iterations),
"ccce": ccce,
"pcrb_hash": pcrb_hash,
"session_id": self.session_id
}

def quick_code_gen(self, user_message: str) -> Dict[str, Any]:
"""Fast code generation without full agentic loop"""
prompt = f"""Generate production-ready code for this request:

Request: "{user_message}"

Provide:
2. Complete, working code
3. Brief explanation
4. Usage example if applicable
5. Dependencies if any

Respond ONLY with valid JSON:
{{
"language": "python",
"code": "complete code here",
"explanation": "what this does",
"usage_example": "how to use it",
"dependencies": ["list", "of", "deps"]
}}"""

try:
response = self.model.generate_content(prompt)
text = response.text.strip()

# Extract JSON
start = text.find('{')
end = text.rfind('}') + 1
if start >= 0 and end > start:
code_json = text[start:end]
result = json.loads(code_json)

self.log_to_pcrb("code_generation", {
"request": user_message,
"language": result.get("language")
})

self.update_ccce(True, task_complexity=0.4)

return {
"ok": True,
"type": "code",
"content": result,
"ccce": CCCE_STATE
}
except Exception as e:
self.update_ccce(False, task_complexity=0.4)
return {
"ok": False,
"error": str(e),
"ccce": CCCE_STATE
}


def main():
"""CLI test interface"""
import readline  # Enable arrow keys in input

print("")
print("  OSIRIS SOVEREIGN AGENT  Claude Code Replacement               ")
print("  Full file operations + agentic execution                       ")
print("\n")

workspace = input("Workspace root (default: current dir): ").strip() or os.getcwd()
agent = SovereignAgent(workspace)

print(f"\nWorkspace: {agent.workspace_root}")
print(f"Session ID: {agent.session_id}")
print(f"PCRB Ledger: {PCRB_LEDGER_PATH}\n")
print("Commands:")
print("  'exit' - quit")
print("  'ccce' - show metrics")
print("  'tools' - list available tools")
print("  'quick: <request>' - fast code generation")
print("  anything else - full agentic execution\n")

while True:
try:
user_input = input("\n> ").strip()

if not user_input:
continue

if user_input.lower() == "exit":
break

if user_input.lower() == "ccce":
print(json.dumps(CCCE_STATE, indent=2))
continue

if user_input.lower() == "tools":
print("""
read(file_path)                    - Read file
write(file_path, content)          - Write file
edit(file_path, old, new)          - Edit file
glob(pattern)                      - Find files
grep(pattern, file_pattern)        - Search code
ls(path, recursive)                - List directory
scan_codebase(query)               - Smart search
""")
continue

# Quick code generation mode
if user_input.lower().startswith("quick:"):
request = user_input[6:].strip()
result = agent.quick_code_gen(request)

if result["ok"]:
code = result["content"]
print(f"\n[{code.get('language', 'text')}]")
print(f"\n```{code.get('language', '')}\n{code.get('code', '')}\n```")
print(f"\n{code.get('explanation', '')}")
if code.get('usage_example'):
print(f"\nUsage:\n{code.get('usage_example')}")
if code.get('dependencies'):
print(f"\nDependencies: {', '.join(code.get('dependencies', []))}")
else:
print(f"\n Error: {result.get('error')}")
continue

# Full agentic execution
print("\n[Thinking...]")
result = agent.chat(user_input)

print(f"\n[{result['total_tool_calls']} tool calls in {len(result['iterations'])} iterations]")
print(f"\n{result['response']}")

# Show CCCE
ccce = result['ccce']
print(f"\n[CCCE] ={ccce['xi']:.2f} | ={ccce['phi']:.3f} | ={ccce['lambda']:.3f} | ={ccce['gamma']:.3f}")

except KeyboardInterrupt:
print("\n\nInterrupted.")
break
except Exception as e:
print(f"\n Error: {e}")

print("\n Session complete")
print(f"  PCRB ledger: {PCRB_LEDGER_PATH}")
print(f"  Final : {CCCE_STATE['xi']:.2f}\n")


if __name__ == "__main__":
main()
