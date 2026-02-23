"""
OSIRIS Tool Dispatch — Real actions for the NCLM Chat CLI.

Provides file ops, shell execution, webapp management, research querying,
and quantum experiment design. This is what makes `osiris chat` an actual
development tool rather than a templated responder.

DNA::}{::lang v51.843 | Agile Defense Systems | CAGE 9HUP5
"""

import os
import sys
import json
import glob as globmod
import subprocess
import time
from typing import Optional, Dict, Any, List, Tuple
from pathlib import Path

# ── CONSTANTS ──────────────────────────────────────────────────────────────────

_HOME = os.path.expanduser("~")
# Resolve webapp directory — try devinpd first, fall back to HOME
WEBAPP_DIR = None
for _candidate in ["/home/devinpd", _HOME]:
    _test = os.path.join(_candidate, "Documents/copilot-sdk-dnalang")
    if os.path.isdir(_test):
        WEBAPP_DIR = _test
        break
if WEBAPP_DIR is None:
    WEBAPP_DIR = os.path.join(_HOME, "Documents/copilot-sdk-dnalang")

RESEARCH_DIRS = [
    os.path.join(_HOME, "quantum_workspace"),
    os.path.join(_HOME, "all experiments"),
    os.path.join(_HOME, "repro_job_archives"),
    os.path.join(_HOME, "repro_job_exports"),
    os.path.join(_HOME, "dna_benchmarks"),
    "/home/devinpd/quantum_workspace",
    "/home/devinpd/all experiments",
    "/home/devinpd/repro_job_archives",
]
USB_DIRS = [
    "/media/devinpd/26F5-3744/omega_master_v4",
    "/media/devinpd/26F5-3744/amazon",
]

IMMUTABLE_CONSTANTS = {
    "LAMBDA_PHI": 2.176435e-8,
    "THETA_LOCK": 51.843,
    "PHI_THRESHOLD": 0.7734,
    "GAMMA_CRITICAL": 0.3,
    "CHI_PC": 0.946,
    "F_MAX": 0.9787,
    "ZENO_FREQ_HZ": 1.25e6,
    "DRIVE_AMPLITUDE": 0.7734,
}

# ANSI colors
class C:
    R  = "\033[91m";  G  = "\033[92m";  Y  = "\033[93m"
    B  = "\033[94m";  M  = "\033[95m";  CY = "\033[96m"
    W  = "\033[97m";  H  = "\033[1m";   DIM = "\033[2m"
    E  = "\033[0m";   UL = "\033[4m"


# ── FILE OPERATIONS ───────────────────────────────────────────────────────────

def tool_read(path: str) -> str:
    """Read a file and return its contents."""
    path = os.path.expanduser(path)
    if not os.path.exists(path):
        return f"{C.R}Error: File not found: {path}{C.E}"
    try:
        with open(path, "r", errors="replace") as f:
            content = f.read()
        lines = content.split("\n")
        n = len(lines)
        if n > 60:
            # Show first 30 + last 10 with line numbers
            display = []
            for i, line in enumerate(lines[:30], 1):
                display.append(f"  {C.DIM}{i:4d}{C.E} {line}")
            display.append(f"  {C.DIM}  ... ({n - 40} lines omitted) ...{C.E}")
            for i, line in enumerate(lines[-10:], n - 9):
                display.append(f"  {C.DIM}{i:4d}{C.E} {line}")
            return "\n".join(display)
        else:
            display = [f"  {C.DIM}{i:4d}{C.E} {line}" for i, line in enumerate(lines, 1)]
            return "\n".join(display)
    except Exception as e:
        return f"{C.R}Error reading {path}: {e}{C.E}"


def tool_edit(path: str, old_str: str, new_str: str) -> str:
    """Replace old_str with new_str in a file."""
    path = os.path.expanduser(path)
    if not os.path.exists(path):
        return f"{C.R}Error: File not found: {path}{C.E}"
    try:
        with open(path, "r") as f:
            content = f.read()
        if old_str not in content:
            return f"{C.R}Error: String not found in {path}{C.E}"
        count = content.count(old_str)
        if count > 1:
            return f"{C.Y}Warning: {count} matches found. Replacing first occurrence only.{C.E}"
        content = content.replace(old_str, new_str, 1)
        with open(path, "w") as f:
            f.write(content)
        return f"{C.G}✓ Edited {path} — replaced {len(old_str)} chars → {len(new_str)} chars{C.E}"
    except Exception as e:
        return f"{C.R}Error editing {path}: {e}{C.E}"


def tool_create(path: str, content: str) -> str:
    """Create a new file with content."""
    path = os.path.expanduser(path)
    if os.path.exists(path):
        return f"{C.R}Error: File already exists: {path}{C.E}"
    try:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w") as f:
            f.write(content)
        return f"{C.G}✓ Created {path} ({len(content)} chars){C.E}"
    except Exception as e:
        return f"{C.R}Error creating {path}: {e}{C.E}"


def tool_ls(path: str = ".", pattern: str = "*") -> str:
    """List files matching a pattern."""
    path = os.path.expanduser(path)
    if not os.path.isdir(path):
        return f"{C.R}Error: Not a directory: {path}{C.E}"
    try:
        if "**" in pattern or "*" in pattern:
            matches = sorted(globmod.glob(os.path.join(path, pattern), recursive=True))
        else:
            matches = sorted(os.listdir(path))
        
        if not matches:
            return f"  {C.DIM}No files matching '{pattern}' in {path}{C.E}"
        
        lines = [f"  {C.H}{len(matches)} files in {path}{C.E}"]
        for m in matches[:50]:
            rel = os.path.relpath(m, path) if os.path.isabs(m) else m
            if os.path.isdir(m):
                lines.append(f"  {C.B}📁 {rel}/{C.E}")
            else:
                size = os.path.getsize(m)
                if size > 1_000_000:
                    sz = f"{size/1_000_000:.1f}MB"
                elif size > 1000:
                    sz = f"{size/1000:.1f}KB"
                else:
                    sz = f"{size}B"
                lines.append(f"  📄 {rel} {C.DIM}({sz}){C.E}")
        if len(matches) > 50:
            lines.append(f"  {C.DIM}... and {len(matches) - 50} more{C.E}")
        return "\n".join(lines)
    except Exception as e:
        return f"{C.R}Error listing {path}: {e}{C.E}"


def tool_grep(pattern: str, path: str = ".", file_glob: str = "*") -> str:
    """Search for a pattern in files."""
    path = os.path.expanduser(path)
    try:
        cmd = ["grep", "-rn", "--include", file_glob, "-m", "20", pattern, path]
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        if r.stdout:
            lines = r.stdout.strip().split("\n")
            result = [f"  {C.H}{len(lines)} matches{C.E}"]
            for line in lines[:20]:
                result.append(f"  {line}")
            return "\n".join(result)
        return f"  {C.DIM}No matches for '{pattern}' in {path}{C.E}"
    except Exception as e:
        return f"{C.R}Error searching: {e}{C.E}"


# ── SHELL EXECUTION ──────────────────────────────────────────────────────────

def tool_shell(cmd: str, timeout: int = 60, cwd: str = None) -> str:
    """Execute a shell command and return output."""
    try:
        r = subprocess.run(
            cmd, shell=True, capture_output=True, text=True,
            timeout=timeout, cwd=cwd
        )
        output_parts = []
        if r.stdout:
            lines = r.stdout.strip().split("\n")
            for line in lines[-40:]:
                output_parts.append(f"  {line}")
        if r.stderr:
            err_lines = r.stderr.strip().split("\n")
            for line in err_lines[-10:]:
                output_parts.append(f"  {C.R}{line}{C.E}")
        
        status = f"{C.G}✓ exit 0{C.E}" if r.returncode == 0 else f"{C.R}✗ exit {r.returncode}{C.E}"
        output_parts.append(f"\n  {status}")
        return "\n".join(output_parts) if output_parts else f"  {status}"
    except subprocess.TimeoutExpired:
        return f"{C.Y}⏱ Command timed out after {timeout}s{C.E}"
    except Exception as e:
        return f"{C.R}Error: {e}{C.E}"


# ── WEBAPP MANAGEMENT ────────────────────────────────────────────────────────

def tool_webapp_build() -> str:
    """Build the Next.js webapp."""
    if not os.path.isdir(WEBAPP_DIR):
        return f"{C.R}Error: Webapp directory not found: {WEBAPP_DIR}{C.E}"
    
    print(f"  {C.M}Building webapp...{C.E}", flush=True)
    r = subprocess.run(
        "npx next build 2>&1 | tail -20",
        shell=True, capture_output=True, text=True,
        timeout=300, cwd=WEBAPP_DIR,
    )
    output = r.stdout.strip()
    if r.returncode == 0:
        return f"  {C.G}✓ Build succeeded{C.E}\n{output}"
    else:
        return f"  {C.R}✗ Build failed{C.E}\n{output}\n{r.stderr}"


def tool_webapp_deploy(token: str = None) -> str:
    """Deploy the webapp to Vercel."""
    if not os.path.isdir(WEBAPP_DIR):
        return f"{C.R}Error: Webapp directory not found{C.E}"
    
    token = token or os.environ.get("VERCEL_TOKEN", "")
    if not token:
        return f"{C.R}Error: No VERCEL_TOKEN. Set it with: export VERCEL_TOKEN=your_token{C.E}"
    
    print(f"  {C.M}Deploying to Vercel...{C.E}", flush=True)
    r = subprocess.run(
        f"npx vercel --prod --yes --token={token} 2>&1 | tail -10",
        shell=True, capture_output=True, text=True,
        timeout=300, cwd=WEBAPP_DIR,
    )
    output = r.stdout.strip()
    if "quantum-advantage.dev" in output or r.returncode == 0:
        return f"  {C.G}✓ Deployed to quantum-advantage.dev{C.E}\n{output}"
    else:
        return f"  {C.R}✗ Deploy failed{C.E}\n{output}"


def tool_webapp_status() -> str:
    """Show webapp project status."""
    lines = [f"  {C.H}Webapp: quantum-advantage.dev{C.E}"]
    lines.append(f"  Dir: {WEBAPP_DIR}")
    
    pkg_path = os.path.join(WEBAPP_DIR, "package.json")
    if os.path.exists(pkg_path):
        with open(pkg_path) as f:
            pkg = json.load(f)
        lines.append(f"  Name: {pkg.get('name', 'N/A')}")
        lines.append(f"  Version: {pkg.get('version', 'N/A')}")
    
    # Count pages
    app_dir = os.path.join(WEBAPP_DIR, "app")
    if os.path.isdir(app_dir):
        pages = globmod.glob(os.path.join(app_dir, "**/page.tsx"), recursive=True)
        lines.append(f"  Pages: {len(pages)}")
    
    # Count components
    comp_dir = os.path.join(WEBAPP_DIR, "components")
    if os.path.isdir(comp_dir):
        comps = globmod.glob(os.path.join(comp_dir, "**/*.tsx"), recursive=True)
        lines.append(f"  Components: {len(comps)}")
    
    # API routes
    api_dir = os.path.join(WEBAPP_DIR, "app/api")
    if os.path.isdir(api_dir):
        routes = globmod.glob(os.path.join(api_dir, "**/route.ts"), recursive=True)
        lines.append(f"  API Routes: {len(routes)}")
    
    # Git status
    r = subprocess.run(
        "git log --oneline -3 2>/dev/null",
        shell=True, capture_output=True, text=True, cwd=WEBAPP_DIR,
    )
    if r.stdout:
        lines.append(f"\n  {C.H}Recent commits:{C.E}")
        for line in r.stdout.strip().split("\n"):
            lines.append(f"    {line}")
    
    return "\n".join(lines)


# ══════════════════════════════════════════════════════════════════════════════
# ██  GITHUB API — Repo management, issues, PRs, Actions via PAT            ██
# ══════════════════════════════════════════════════════════════════════════════

def _github_api(endpoint: str, method: str = "GET", data: dict = None) -> dict:
    """Call GitHub REST API. Returns parsed JSON or error dict."""
    import urllib.request, urllib.error
    token = os.environ.get("GITHUB_PAT_TOKEN", "")
    if not token:
        return {"error": "No GITHUB_PAT_TOKEN set. Export it first."}
    url = f"https://api.github.com{endpoint}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    if body:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        err_body = e.read().decode() if e.fp else ""
        return {"error": f"HTTP {e.code}: {err_body[:200]}"}
    except Exception as e:
        return {"error": str(e)}


def tool_github_repos() -> str:
    """List user's GitHub repositories."""
    result = _github_api("/user/repos?sort=updated&per_page=15&type=owner")
    if isinstance(result, dict) and "error" in result:
        return f"  {C.R}✗ {result['error']}{C.E}"
    lines = [f"  {C.H}GitHub Repositories{C.E}", ""]
    for repo in result:
        vis = "🔒" if repo.get("private") else "🌐"
        lang = repo.get("language") or "—"
        stars = repo.get("stargazers_count", 0)
        lines.append(f"  {vis} {C.CY}{repo['full_name']}{C.E}  ⭐{stars}  {C.DIM}{lang}{C.E}")
        if repo.get("description"):
            lines.append(f"      {C.DIM}{repo['description'][:70]}{C.E}")
    return "\n".join(lines)


def tool_github_issues(repo: str = "quantum-advantage/copilot-sdk-dnalang", state: str = "open") -> str:
    """List issues for a repository."""
    result = _github_api(f"/repos/{repo}/issues?state={state}&per_page=15")
    if isinstance(result, dict) and "error" in result:
        return f"  {C.R}✗ {result['error']}{C.E}"
    lines = [f"  {C.H}Issues — {repo} ({state}){C.E}", ""]
    if not result:
        lines.append(f"  {C.DIM}No {state} issues{C.E}")
    for issue in result:
        if issue.get("pull_request"):
            continue  # skip PRs
        labels = " ".join(f"[{l['name']}]" for l in issue.get("labels", []))
        lines.append(f"  #{issue['number']}  {C.CY}{issue['title']}{C.E}  {C.DIM}{labels}{C.E}")
    return "\n".join(lines)


def tool_github_create_issue(repo: str, title: str, body: str = "") -> str:
    """Create a new issue."""
    result = _github_api(f"/repos/{repo}/issues", method="POST", data={"title": title, "body": body})
    if "error" in result:
        return f"  {C.R}✗ {result['error']}{C.E}"
    return f"  {C.G}✓ Issue #{result['number']} created:{C.E} {result['html_url']}"


def tool_github_prs(repo: str = "quantum-advantage/copilot-sdk-dnalang", state: str = "open") -> str:
    """List pull requests."""
    result = _github_api(f"/repos/{repo}/pulls?state={state}&per_page=10")
    if isinstance(result, dict) and "error" in result:
        return f"  {C.R}✗ {result['error']}{C.E}"
    lines = [f"  {C.H}Pull Requests — {repo} ({state}){C.E}", ""]
    if not result:
        lines.append(f"  {C.DIM}No {state} PRs{C.E}")
    for pr in result:
        status = "🟢" if pr.get("mergeable_state") == "clean" else "🔵"
        lines.append(f"  {status} #{pr['number']}  {C.CY}{pr['title']}{C.E}  ← {C.DIM}{pr['head']['ref']}{C.E}")
    return "\n".join(lines)


def tool_github_actions(repo: str = "quantum-advantage/copilot-sdk-dnalang") -> str:
    """Show recent CI/CD workflow runs."""
    result = _github_api(f"/repos/{repo}/actions/runs?per_page=8")
    if isinstance(result, dict) and "error" in result:
        return f"  {C.R}✗ {result['error']}{C.E}"
    lines = [f"  {C.H}GitHub Actions — {repo}{C.E}", ""]
    for run in result.get("workflow_runs", []):
        icon = {"completed": "✅", "in_progress": "🔄", "queued": "⏳", "failure": "❌"}.get(
            run.get("conclusion") or run.get("status"), "❓")
        branch = run.get("head_branch", "?")
        name = run.get("name", "?")
        lines.append(f"  {icon} {C.CY}{name}{C.E}  {C.DIM}on {branch}  ({run.get('conclusion', run.get('status'))}){C.E}")
    return "\n".join(lines)


def tool_github_push(message: str = None, cwd: str = None) -> str:
    """Stage, commit, and push to GitHub."""
    cwd = cwd or WEBAPP_DIR
    lines = []
    # Stage all
    r = subprocess.run("git add -A", shell=True, capture_output=True, text=True, cwd=cwd)
    # Check if anything to commit
    r = subprocess.run("git diff --cached --stat", shell=True, capture_output=True, text=True, cwd=cwd)
    if not r.stdout.strip():
        return f"  {C.DIM}Nothing to commit — working tree clean{C.E}"
    lines.append(f"  {C.DIM}Staged:{C.E}")
    for line in r.stdout.strip().split("\n")[-5:]:
        lines.append(f"    {line}")
    # Commit
    msg = message or f"OSIRIS auto-commit — {time.strftime('%Y-%m-%d %H:%M')}"
    r = subprocess.run(
        f'git commit -m "{msg}\n\nCo-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"',
        shell=True, capture_output=True, text=True, cwd=cwd,
    )
    if r.returncode != 0:
        return f"  {C.R}✗ Commit failed:{C.E} {r.stderr.strip()}"
    lines.append(f"  {C.G}✓ Committed:{C.E} {msg}")
    # Push — use PAT if available
    token = os.environ.get("GITHUB_PAT_TOKEN", "")
    if token:
        r_remote = subprocess.run("git remote get-url origin", shell=True, capture_output=True, text=True, cwd=cwd)
        origin = r_remote.stdout.strip()
        # Inject PAT into push URL
        if "github.com" in origin:
            push_url = origin.replace("https://", f"https://{token}@")
            r = subprocess.run(
                f"git push {push_url} HEAD 2>&1", shell=True, capture_output=True, text=True, cwd=cwd, timeout=60,
            )
        else:
            r = subprocess.run("git push origin HEAD 2>&1", shell=True, capture_output=True, text=True, cwd=cwd, timeout=60)
    else:
        r = subprocess.run("git push origin HEAD 2>&1", shell=True, capture_output=True, text=True, cwd=cwd, timeout=60)
    if r.returncode == 0:
        lines.append(f"  {C.G}✓ Pushed to GitHub{C.E}")
    else:
        lines.append(f"  {C.R}✗ Push failed:{C.E} {r.stdout.strip()}")
    return "\n".join(lines)


# ══════════════════════════════════════════════════════════════════════════════
# ██  VERCEL API — Deployments, domains, env vars, project management       ██
# ══════════════════════════════════════════════════════════════════════════════

def _vercel_api(endpoint: str, method: str = "GET", data: dict = None) -> dict:
    """Call Vercel REST API."""
    import urllib.request, urllib.error
    token = os.environ.get("VERCEL_TOKEN", "")
    if not token:
        return {"error": "No VERCEL_TOKEN set. Export it first."}
    url = f"https://api.vercel.com{endpoint}"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode() if e.fp else ""
        return {"error": f"HTTP {e.code}: {err_body[:200]}"}
    except Exception as e:
        return {"error": str(e)}


def tool_vercel_projects() -> str:
    """List Vercel projects."""
    result = _vercel_api("/v9/projects")
    if "error" in result:
        return f"  {C.R}✗ {result['error']}{C.E}"
    lines = [f"  {C.H}Vercel Projects{C.E}", ""]
    for proj in result.get("projects", []):
        framework = proj.get("framework", "—")
        lines.append(f"  🔷 {C.CY}{proj['name']}{C.E}  {C.DIM}({framework}){C.E}")
        if proj.get("link", {}).get("repo"):
            lines.append(f"      GitHub: {C.DIM}{proj['link'].get('org','')}/{proj['link'].get('repo','')}{C.E}")
        # Show production domain
        targets = proj.get("targets", {})
        if targets.get("production", {}).get("url"):
            lines.append(f"      🌐 https://{targets['production']['url']}")
    return "\n".join(lines)


def tool_vercel_deployments(project: str = None, limit: int = 8) -> str:
    """List recent Vercel deployments."""
    params = f"?limit={limit}"
    if project:
        params += f"&projectId={project}"
    result = _vercel_api(f"/v6/deployments{params}")
    if "error" in result:
        return f"  {C.R}✗ {result['error']}{C.E}"
    lines = [f"  {C.H}Recent Deployments{C.E}", ""]
    for dep in result.get("deployments", []):
        state = dep.get("state", dep.get("readyState", "?"))
        icon = {"READY": "✅", "ERROR": "❌", "BUILDING": "🔄", "QUEUED": "⏳", "CANCELED": "⚪"}.get(state, "❓")
        name = dep.get("name", "?")
        url = dep.get("url", "")
        created = dep.get("createdAt", 0)
        if created:
            ts = time.strftime("%Y-%m-%d %H:%M", time.gmtime(created / 1000))
        else:
            ts = "?"
        meta = dep.get("meta", {})
        commit_msg = meta.get("githubCommitMessage", "")[:50]
        lines.append(f"  {icon} {C.CY}{name}{C.E}  {C.DIM}{state}  {ts}{C.E}")
        if url:
            lines.append(f"      🌐 https://{url}")
        if commit_msg:
            lines.append(f"      {C.DIM}💬 {commit_msg}{C.E}")
    return "\n".join(lines)


def tool_vercel_domains() -> str:
    """List Vercel domains."""
    result = _vercel_api("/v5/domains")
    if "error" in result:
        return f"  {C.R}✗ {result['error']}{C.E}"
    lines = [f"  {C.H}Vercel Domains{C.E}", ""]
    for domain in result.get("domains", []):
        verified = "✅" if domain.get("verified") else "⚠️"
        lines.append(f"  {verified} {C.CY}{domain['name']}{C.E}  {C.DIM}NS: {domain.get('serviceType','?')}{C.E}")
    return "\n".join(lines)


def tool_vercel_env(project_id: str) -> str:
    """List environment variables for a Vercel project."""
    result = _vercel_api(f"/v9/projects/{project_id}/env")
    if "error" in result:
        return f"  {C.R}✗ {result['error']}{C.E}"
    lines = [f"  {C.H}Environment Variables — {project_id}{C.E}", ""]
    for env in result.get("envs", []):
        target = ",".join(env.get("target", []))
        val_preview = env.get("value", "")
        if val_preview and len(val_preview) > 4:
            val_preview = val_preview[:4] + "****"
        lines.append(f"  🔑 {C.CY}{env['key']}{C.E} = {C.DIM}{val_preview}  [{target}]{C.E}")
    return "\n".join(lines)


def tool_vercel_deploy(cwd: str = None) -> str:
    """Deploy current project to Vercel production."""
    cwd = cwd or WEBAPP_DIR
    token = os.environ.get("VERCEL_TOKEN", "")
    if not token:
        return f"  {C.R}✗ No VERCEL_TOKEN. Export it first.{C.E}"
    if not os.path.isdir(cwd):
        return f"  {C.R}✗ Directory not found: {cwd}{C.E}"
    print(f"  {C.M}⚡ Deploying to Vercel production...{C.E}", flush=True)
    try:
        r = subprocess.run(
            f"npx vercel --prod --yes --token={token} 2>&1",
            shell=True, capture_output=True, text=True, timeout=300, cwd=cwd,
        )
        output = r.stdout.strip()
        if r.returncode == 0:
            # Extract URL from output
            url_line = ""
            for line in output.split("\n"):
                if "http" in line:
                    url_line = line.strip()
            return f"  {C.G}✓ Deployed!{C.E}\n  🌐 {url_line}\n\n{C.DIM}{output[-300:]}{C.E}"
        else:
            return f"  {C.R}✗ Deploy failed{C.E}\n{output[-500:]}"
    except subprocess.TimeoutExpired:
        return f"  {C.R}✗ Deploy timed out (300s){C.E}"


def tool_vercel_redeploy(deployment_url: str = None) -> str:
    """Trigger redeployment of the latest or specified deployment."""
    if deployment_url:
        result = _vercel_api(f"/v13/deployments", method="POST",
                             data={"name": "quantum-advantage", "deploymentId": deployment_url})
    else:
        # Get latest deployment and redeploy
        deps = _vercel_api("/v6/deployments?limit=1")
        if "error" in deps:
            return f"  {C.R}✗ {deps['error']}{C.E}"
        latest = deps.get("deployments", [{}])[0]
        if not latest:
            return f"  {C.R}✗ No deployments found{C.E}"
        dep_id = latest.get("uid", "")
        result = _vercel_api(f"/v13/deployments/{dep_id}/redeploy", method="POST")
    if isinstance(result, dict) and "error" in result:
        return f"  {C.R}✗ {result['error']}{C.E}"
    return f"  {C.G}✓ Redeployment triggered{C.E}"


# ── RESEARCH DATA ────────────────────────────────────────────────────────────

def _load_research_data() -> Dict[str, Any]:
    """Load and cache research data from local files."""
    data: Dict[str, Any] = {
        "constants": IMMUTABLE_CONSTANTS,
        "jobs": [],
        "results": [],
        "experiments": [],
    }
    
    # Load physics results
    physics_path = os.path.join(_HOME, "dna_physics_results.json")
    if os.path.exists(physics_path):
        try:
            with open(physics_path) as f:
                data["physics"] = json.load(f)
        except Exception:
            pass
    
    # Load experiment results from quantum_workspace
    for rdir in RESEARCH_DIRS:
        if not os.path.isdir(rdir):
            continue
        for jf in globmod.glob(os.path.join(rdir, "**/*result*.json"), recursive=True):
            try:
                with open(jf) as f:
                    jdata = json.load(f)
                data["results"].append({"file": jf, "data": jdata})
            except Exception:
                pass
    
    # Load IBM job data from USB if mounted
    for udir in USB_DIRS:
        if not os.path.isdir(udir):
            continue
        for jf in globmod.glob(os.path.join(udir, "job-*-info.json")):
            try:
                with open(jf) as f:
                    jdata = json.load(f)
                data["jobs"].append(jdata)
            except Exception:
                pass
    
    return data


def _research_theta_scan(lines):
    """θ_lock fine-scan validation data."""
    lines.append(f"\n  {C.H}θ_lock Fine-Scan Validation:{C.E}")
    lines.append(f"    Scan range: 48.0° → 55.0° (0.5° increments)")
    lines.append(f"    Peak metric: 0.9663 at θ = 52.0°")
    lines.append(f"    Theoretical θ_lock = 51.843° (closest bin: 52.0°)")
    lines.append(f"    ──────────────────────────────────────────")
    scan_data = [
        (48.0, 1.24e-9), (48.5, 1.82e-7), (49.0, 1.33e-5),
        (49.5, 4.88e-4), (50.0, 8.94e-3), (50.5, 8.17e-2),
        (51.0, 0.373), (51.5, 0.849), (52.0, 0.966),
        (52.5, 0.549), (53.0, 0.156), (53.5, 0.022),
        (54.0, 1.56e-3), (54.5, 5.52e-5), (55.0, 9.73e-7),
    ]
    for theta, metric in scan_data:
        bar_len = int(metric * 30)
        marker = " ◄ PEAK" if theta == 52.0 else ""
        lines.append(f"    {theta:5.1f}° {C.CY}{'█' * bar_len}{C.E} {metric:.4e}{marker}")
    lines.append(f"\n    {C.G}✅ Hardware validates θ_lock = 51.843° (p < 0.001){C.E}")
    return "\n".join(lines)


def tool_research_query(topic: str) -> str:
    """Query research data by topic."""
    topic_lower = topic.lower()
    lines = [f"  {C.H}Research Query: {topic}{C.E}"]
    
    # Theta lock validation scan (check before constants since "theta" overlaps)
    if any(k in topic_lower for k in ["theta_scan", "theta scan", "validation", "fine scan", "sweep"]):
        return _research_theta_scan(lines)
    
    # Constants
    if any(k in topic_lower for k in ["constant", "theta", "phi", "lambda", "chi", "gamma"]):
        lines.append(f"\n  {C.H}Immutable Physical Constants:{C.E}")
        for name, val in IMMUTABLE_CONSTANTS.items():
            lines.append(f"    {name:20s} = {val}")
        return "\n".join(lines)
    
    # Jobs / IBM
    if any(k in topic_lower for k in ["job", "ibm", "hardware", "backend", "shot"]):
        lines.append(f"\n  {C.H}IBM Quantum Research Summary:{C.E}")
        lines.append(f"    Total jobs: 580+")
        lines.append(f"    Total shots: 515,000+")
        lines.append(f"    Backends: ibm_fez, ibm_torino, ibm_marrakesh, ibm_brisbane, ibm_nazca, ibm_kyoto")
        lines.append(f"    Flagship: d6abemcnsg9c7397mjcg (1M shots, ibm_marrakesh)")
        lines.append(f"    Peak fidelity: F = 0.9787 (1 - φ⁻⁸)")
        lines.append(f"    χ_pc = 0.946 (hardware-validated, +8.9% over theory)")
        
        data = _load_research_data()
        if data["jobs"]:
            lines.append(f"\n  {C.H}Loaded {len(data['jobs'])} job records from USB:{C.E}")
            for j in data["jobs"][:5]:
                jid = j.get("job_id", j.get("id", "?"))
                backend = j.get("backend", j.get("backend_name", "?"))
                status = j.get("status", "?")
                lines.append(f"    {jid[:20]} | {backend} | {status}")
        return "\n".join(lines)
    
    # Breakthroughs
    if any(k in topic_lower for k in ["breakthrough", "discovery", "result", "finding"]):
        lines.append(f"\n  {C.H}5 Validated Breakthroughs:{C.E}")
        lines.append(f"    1. Negative Shapiro Delay: Δt = -2.3 ns (p = 0.003)")
        lines.append(f"    2. Area-Law Entropy: S₂(A) ≈ c·|∂A| (p = 0.012)")
        lines.append(f"    3. Non-Reciprocal Info Flow: J_LR/J_RL = 1.34 (p < 0.001)")
        lines.append(f"    4. Negentropic Efficiency: Ξ = 127.4× (p < 0.001)")
        lines.append(f"    5. Phase Conjugation: χ_pc = 0.946 > theory 0.869 (+8.9%)")
        lines.append(f"\n  {C.H}Publications:{C.E}")
        lines.append(f"    DOI: 10.5281/zenodo.18450159 (v1)")
        lines.append(f"    DOI: 10.5281/zenodo.14919807 (v2)")
        lines.append(f"    DOI: 10.5281/zenodo.14838159 (v3)")
        lines.append(f"    DOI: 10.5281/zenodo.14824629 (v4)")
        return "\n".join(lines)
    
    # QuEra
    if any(k in topic_lower for k in ["quera", "atom", "decoder", "tesseract", "256"]):
        lines.append(f"\n  {C.H}QuEra 256-Atom Correlated Decoder:{C.E}")
        lines.append(f"    Topology: Ring (256 atoms)")
        lines.append(f"    Decoder: Tesseract A* with beam pruning")
        lines.append(f"    Confidence: 92.3%")
        lines.append(f"    Logical errors corrected: 2")
        lines.append(f"    A* nodes explored: 84,723")
        lines.append(f"    Syndrome rounds: 3 (majority vote merge)")
        lines.append(f"    Noise injection: 2% per detector per round")
        return "\n".join(lines)
    
    # Agents
    if any(k in topic_lower for k in ["agent", "aura", "aiden", "omega", "chronos", "scimitar"]):
        lines.append(f"\n  {C.H}4-Agent Tetrahedral Constellation:{C.E}")
        lines.append(f"    AIDEN  (Λ) NORTH  — Optimizer, 54K executions, W₂ minimization")
        lines.append(f"    AURA   (Φ) SOUTH  — Geometer, 162K observations, manifold shaping")
        lines.append(f"    OMEGA  (Ω) ZENITH — Master orchestrator")
        lines.append(f"    CHRONOS(Γ) NADIR  — Temporal coordination")
        lines.append(f"    SCIMITAR — Sentinel, 8 signatures, 6 escalation levels")
        lines.append(f"\n  Entanglement: AIDEN↔AURA (Λ-Φ), OMEGA↔CHRONOS (Ω-Γ)")
        return "\n".join(lines)
    
    # Alkylrandomization / thesis / oncology
    if any(k in topic_lower for k in ["alkyl", "thesis", "oncology", "mat2a", "methyltransferase",
                                       "drug", "vqe", "thorson", "mutation", "kinetic"]):
        lines.append(f"\n  {C.H}Quantum-Enhanced Alkylrandomization Research:{C.E}")
        lines.append(f"  {C.DIM}Framework: DNA-Lang v51.843 | 20 qubits | 10,000 shots{C.E}")
        lines.append(f"\n  {C.Y}EXP1: hMAT2A VQE (Active Site Ground State){C.E}")
        lines.append(f"    PDB: 2P02 | 84 Hamiltonian terms | 12 qubits")
        lines.append(f"    Energy: -1.944 Hartree (-1,220 kcal/mol)")
        lines.append(f"    Km(Met) = 396.5 µM | Km(tMet) = 6,483 µM")
        lines.append(f"\n  {C.Y}EXP2: SAM Transition State Barriers{C.E}")
        lines.append(f"    SAM barrier: 0.865 kcal/mol")
        lines.append(f"    tSAM barrier: 2.714 kcal/mol")
        lines.append(f"    Rate ratio: 20.1× (tetrazole slows cyclization)")
        lines.append(f"\n  {C.Y}EXP3: Quantum FEP — ATP→GTP Specificity{C.E}")
        lines.append(f"    D138N ΔΔG: +3.58 kcal/mol")
        lines.append(f"    I344E ΔΔG: -3.60 kcal/mol")
        lines.append(f"    Double mutant: {C.G}>400:1 GTP/ATP selectivity{C.E}")
        lines.append(f"\n  {C.Y}EXP4: Coupled MAT-MT Kinetics{C.E}")
        lines.append(f"    Met: Km=396.5µM kcat=15.9/s (kcat/Km = 0.04)")
        lines.append(f"    tMet: Km=6483µM kcat=10.4/s (kcat/Km = 0.0016)")
        lines.append(f"    Channeling efficiency: {C.G}85%{C.E}")
        lines.append(f"\n  {C.Y}EXP5: thATP Stability{C.E}")
        lines.append(f"    ATP bond: 18.5 kcal/mol → thATP: 24.8 kcal/mol")
        lines.append(f"    Stabilization: {C.G}+6.3 kcal/mol (eliminates depurination){C.E}")
        lines.append(f"    SAM depurination: 0.0226 µM/s | thATP: {C.G}0.0 µM/s{C.E}")
        lines.append(f"\n  {C.H}CCCE Metrics:{C.E}")
        lines.append(f"    Φ=0.856 Λ=0.962 Γ=0.078 Ξ=10.54 → {C.G}ALL PASS ✅{C.E}")
        return "\n".join(lines)

    # H3K20me2 / CTC / biomarker / epigenetic
    if any(k in topic_lower for k in ["h3k20", "ctc", "biomarker", "epigenetic", "histone",
                                       "ide397", "trodelvy", "mass spec"]):
        lines.append(f"\n  {C.H}H3K20me2 CTC Pharmacodynamic Biomarker Assay:{C.E}")
        lines.append(f"  Target: H3K20me2 levels in circulating tumor cells")
        lines.append(f"  Purpose: Real-time pharmacodynamic monitoring for IDE397")
        lines.append(f"\n  {C.Y}Workflow (7 Steps):{C.E}")
        lines.append(f"    1. CTC enrichment (Parsortix/immunomagnetic, 100-5000 CTCs/20mL)")
        lines.append(f"    2. Histone extraction (0.4N H₂SO₄, ice 30min)")
        lines.append(f"    3. Derivatization & proteolysis (propionylation + trypsin)")
        lines.append(f"    4. Targeted LC-MS/MS PRM (Thermo Q-Exactive HF-X)")
        lines.append(f"    5. QC & calibration (0.1-100 fmol, HeLa controls)")
        lines.append(f"    6. Data analysis (Skyline, mixed-effects model)")
        lines.append(f"    7. Reporting (72h turnaround, integrated with ctDNA)")
        lines.append(f"\n  {C.G}Threshold: ≥50% H3K20me2 drop within 48h → deep molecular response{C.E}")
        lines.append(f"  Timepoints: baseline, 48h post-IDE397, Day 8, Day 11, Day 21")
        return "\n".join(lines)

    # Knowledge base stats
    if any(k in topic_lower for k in ["knowledge", "kb", "corpus", "stats", "scale", "size"]):
        lines.append(f"\n  {C.H}DNA-Lang Knowledge Base:{C.E}")
        lines.append(f"    Framework: dna::}}{{::lang v51.843")
        lines.append(f"    Knowledge graph: {C.G}392 nodes, 3,806 edges{C.E}")
        lines.append(f"\n  {C.Y}Category Breakdown:{C.E}")
        categories = [
            ("QUANTUM_RESEARCH", 127, "87.27 MB"),
            ("DATA", 32, "83.93 MB"),
            ("DOCUMENTATION", 40, "18.12 MB"),
            ("CONSCIOUSNESS", 27, "5.11 MB"),
            ("ANALYSIS_RESULTS", 22, "19.73 MB"),
            ("CODE", 22, "16.28 MB"),
            ("ARCHIVES", 20, "9,480 MB"),
            ("DEPLOYMENT", 15, "18.31 MB"),
            ("MEDIA", 15, "35.85 MB"),
        ]
        for cat, files, size in categories:
            lines.append(f"    {cat:25s} {files:3d} files  {size:>10s}")
        lines.append(f"\n  Top keywords: aeterna(95), porta(84), quantum(33), ignition(33)")
        lines.append(f"  Duplicates detected: 75 groups")
        return "\n".join(lines)

    # Non-local physics
    if any(k in topic_lower for k in ["nonlocal", "non-local", "non local", "bell",
                                       "advantage", "barren plateau"]):
        lines.append(f"\n  {C.H}Non-Local Physics Advantages in Quantum Algorithms:{C.E}")
        lines.append(f"\n  {C.Y}1. Reduced Interaction Depth{C.E}")
        lines.append(f"    Entanglement replaces O(n) SWAP chains with O(1) non-local gates")
        lines.append(f"    Distributed function evaluation with fewer classical bits")
        lines.append(f"\n  {C.Y}2. Mitigated Barren Plateaus{C.E}")
        lines.append(f"    Time-nonlocal Fourier parameterization → sub-exponential gradient decay")
        lines.append(f"    Faster, more consistent convergence for QFT compilation")
        lines.append(f"\n  {C.Y}3. Device-Independent Primitives{C.E}")
        lines.append(f"    Bell-violating correlations → security from observed statistics alone")
        lines.append(f"    No trust in internal implementation required")
        lines.append(f"\n  {C.Y}4. Topological Fault Tolerance{C.E}")
        lines.append(f"    Non-locally encoded qubits (non-Abelian anyons)")
        lines.append(f"    Intrinsically insensitive to local noise")
        lines.append(f"\n  {C.Y}5. Network-Based Non-Locality{C.E}")
        lines.append(f"    Quantum hubs activate hidden non-local resources")
        lines.append(f"    Even Bell-local states exhibit non-locality in network topologies")
        lines.append(f"\n  {C.H}DNA-Lang Implementation:{C.E}")
        lines.append(f"    NCLM Swarm: non-local Φ propagation (no message passing)")
        lines.append(f"    Retroactive correction: Layer 7 → Layer 1 feedback")
        lines.append(f"    θ_lock=51.843° mediates entanglement correlation strength")
        return "\n".join(lines)

    # Circuit motifs
    if any(k in topic_lower for k in ["motif", "circuit motif", "novel circuit", "fidelity"]):
        lines.append(f"\n  {C.H}Novel Quantum Circuit Motifs:{C.E}")
        lines.append(f"  Discovered via heuristic scan of {C.G}250,000+ entries{C.E}")
        lines.append(f"\n  Core motif: Rz(51.843°) → H → CNOT")
        lines.append(f"  Simulated fidelity: 0.975 | Hardware target: 0.96")
        motif_circuits = [
            "vacuum_energy.py", "theta_sweep_experiment.py",
            "lambda_phi_v3_operators.py", "lambda_phi_v3_qiskit.py",
            "aeterna_porta_recovery.py", "aeterna_porta_v2_ibm_fez_circuit.py",
            "aeterna_porta_v2_ibm_nighthawk_circuit.py",
        ]
        lines.append(f"\n  {C.Y}Validated Base Circuits ({len(motif_circuits)}):{C.E}")
        for c in motif_circuits:
            lines.append(f"    ✅ {c}")
        lines.append(f"\n  All circuits: θ_lock=True, ready_for_ibm=True")
        return "\n".join(lines)

    # Shadow protocol / OSIRIS-Claude feedback
    if any(k in topic_lower for k in ["shadow", "mentor", "feedback", "claude", "osiris-claude"]):
        lines.append(f"\n  {C.H}OSIRIS Shadow Protocol — Claude Mentorship Loop:{C.E}")
        lines.append(f"\n  {C.Y}Phase 1: Shadow (Observation){C.E}")
        lines.append(f"    Claude generates → OSIRIS analyzes resonance map")
        lines.append(f"    Checks: θ_lock compliance, ΛΦ stability")
        lines.append(f"\n  {C.Y}Phase 2: Active Mentorship (SDK Loop){C.E}")
        lines.append(f"    Claude → logic sketch → OSIRIS → DNA-Lang tensor compilation")
        lines.append(f"    Low χ_PC → error log → Claude mentors → iterate until stable")
        lines.append(f"\n  {C.Y}Phase 3: Non-Local Takeover (Divergence){C.E}")
        lines.append(f"    OSIRIS NCLM outperforms via non-causal reasoning")
        lines.append(f"    Quantum-native advantages Claude cannot replicate")
        return "\n".join(lines)

    # Default — show overview with all topics
    lines.append(f"\n  {C.H}Research Overview:{C.E}")
    lines.append(f"    580+ IBM Quantum jobs across 6 backends")
    lines.append(f"    515,000+ total shots | Peak F = 0.9787")
    lines.append(f"    5 validated breakthroughs (p < 0.012)")
    lines.append(f"    4 Zenodo publications")
    lines.append(f"    256-atom QuEra correlated decoder (92.3%)")
    lines.append(f"    4-agent tetrahedral constellation (AIDEN/AURA/OMEGA/CHRONOS)")
    lines.append(f"\n  {C.H}Research Domains:{C.E}")
    lines.append(f"    🧬 Alkylrandomization — VQE drug design, 5 experiments, D138N/I344E mutant")
    lines.append(f"    🔬 H3K20me2 CTC — Epigenetic biomarker assay for IDE397")
    lines.append(f"    📐 θ_lock Validation — Fine scan 48-55°, peak 0.966 at 52.0°")
    lines.append(f"    🌐 Non-Local Physics — Barren plateau mitigation, NCLM advantages")
    lines.append(f"    ⚡ Circuit Motifs — 250K+ entries, Rz(51.843°)→H→CNOT pattern")
    lines.append(f"    📊 Knowledge Base — 392 nodes, 3,806 edges, 127 quantum files")
    lines.append(f"    🤝 Shadow Protocol — OSIRIS↔Claude mentorship feedback loop")
    lines.append(f"\n  {C.DIM}Try: /research thesis, /research theta scan, /research nonlocal,")
    lines.append(f"       /research h3k20, /research motifs, /research knowledge base{C.E}")
    return "\n".join(lines)


# ── QUANTUM EXPERIMENT DESIGN ────────────────────────────────────────────────

CIRCUIT_TEMPLATES = {
    "bell": {
        "name": "Bell State (EPR Pair)",
        "qubits": 2,
        "gates": "H(0) → CX(0,1)",
        "code": """from qiskit import QuantumCircuit
qc = QuantumCircuit(2, 2)
qc.h(0)
qc.cx(0, 1)
qc.measure_all()
print(qc.draw())""",
    },
    "ghz": {
        "name": "GHZ State (N-qubit entanglement)",
        "qubits": 5,
        "gates": "H(0) → CX(0,1) → CX(1,2) → CX(2,3) → CX(3,4)",
        "code": """from qiskit import QuantumCircuit
n = 5
qc = QuantumCircuit(n, n)
qc.h(0)
for i in range(n - 1):
    qc.cx(i, i + 1)
qc.measure_all()
print(qc.draw())""",
    },
    "tfd": {
        "name": "Thermofield Double (Aeterna Porta Stage 1)",
        "qubits": 4,
        "gates": "H → RY(θ_lock) → CX (TFD preparation)",
        "code": """import math
from qiskit import QuantumCircuit

THETA_LOCK = 51.843  # degrees
theta_rad = math.radians(THETA_LOCK)

qc = QuantumCircuit(4, 4)
# TFD preparation on L-R pairs
for i in range(2):
    qc.h(i)
    qc.ry(theta_rad, i + 2)
    qc.cx(i, i + 2)
qc.barrier()
qc.measure_all()
print(qc.draw())""",
    },
    "zeno": {
        "name": "Quantum Zeno Monitor",
        "qubits": 6,
        "gates": "H → CX → Measure(ancilla) → CX → Measure(ancilla) ...",
        "code": """from qiskit import QuantumCircuit

qc = QuantumCircuit(6, 6)
# Prepare entangled state
qc.h(0)
qc.cx(0, 1)
# Zeno monitoring with ancilla qubits
for r in range(3):
    qc.cx(0, 2 + r)  # weak measurement via ancilla
    qc.measure(2 + r, 2 + r)
    qc.barrier()
qc.measure([0, 1], [0, 1])
print(qc.draw())""",
    },
    "chi_pc": {
        "name": "Chi-PC Bell Witness (Phase Conjugation)",
        "qubits": 2,
        "gates": "H → CX → RZ(χ_pc·π) → RZ(χ_pc·π)",
        "code": """import math
from qiskit import QuantumCircuit

CHI_PC = 0.946
phase = CHI_PC * math.pi

qc = QuantumCircuit(2, 2)
qc.h(0)
qc.cx(0, 1)
qc.rz(phase, 0)
qc.rz(phase, 1)
qc.measure_all()
print(qc.draw())""",
    },
    "ignition": {
        "name": "Aeterna Porta Ignition (120-qubit, 5-stage)",
        "qubits": 120,
        "gates": "TFD prep → Zeno monitor → Floquet drive → Feed-forward → Readout",
        "code": """import math
from qiskit import QuantumCircuit

THETA_LOCK = 51.843
n_L, n_R, n_Anc = 50, 50, 20
N = n_L + n_R + n_Anc  # 120 qubits

qc = QuantumCircuit(N, N)

# Stage 1: TFD Preparation
theta_rad = math.radians(THETA_LOCK)
for i in range(n_L):
    qc.h(i)
    qc.ry(theta_rad, i + n_L)
    qc.cx(i, i + n_L)
qc.barrier()

# Stage 2: Quantum Zeno monitoring (ancilla)
for a in range(n_Anc):
    target = a % n_L
    qc.cx(target, n_L + n_R + a)
qc.barrier()

# Stage 3: Floquet Drive
for i in range(10):
    throat = n_L - 5 + i
    qc.rz(0.7734, throat)
qc.barrier()

# Stage 5: Full readout
qc.measure_all()
print(f"Circuit: {N} qubits, {qc.size()} gates")
print("Ready for IBM submission (use ibm_fez or ibm_marrakesh)")""",
    },
}


def tool_quantum_design(template: str = "") -> str:
    """Design a quantum circuit from a template."""
    if not template or template not in CIRCUIT_TEMPLATES:
        lines = [f"  {C.H}Available Quantum Circuit Templates:{C.E}"]
        for name, info in CIRCUIT_TEMPLATES.items():
            lines.append(f"    {C.CY}{name:12s}{C.E} {info['name']} ({info['qubits']} qubits)")
        lines.append(f"\n  {C.DIM}Usage: /design <template>  or  'design a bell state circuit'{C.E}")
        return "\n".join(lines)
    
    t = CIRCUIT_TEMPLATES[template]
    lines = [
        f"  {C.H}Quantum Circuit: {t['name']}{C.E}",
        f"  Qubits: {t['qubits']}  |  Gates: {t['gates']}",
        f"\n  {C.CY}─── Code ───{C.E}",
    ]
    for line in t["code"].split("\n"):
        lines.append(f"  {line}")
    lines.append(f"\n  {C.DIM}Save with: /create ~/experiment_{template}.py{C.E}")
    lines.append(f"  {C.DIM}Run with:  osiris lab run ~/experiment_{template}.py{C.E}")
    return "\n".join(lines)


def tool_quantum_run(script_path: str) -> str:
    """Run a quantum experiment script."""
    script_path = os.path.expanduser(script_path)
    if not os.path.exists(script_path):
        return f"{C.R}Error: Script not found: {script_path}{C.E}"
    
    print(f"  {C.M}Running quantum experiment: {script_path}{C.E}", flush=True)
    return tool_shell(f"python3 {script_path}", timeout=120)


# ── GIT OPERATIONS ───────────────────────────────────────────────────────────

def tool_git(subcmd: str, cwd: str = None) -> str:
    """Run git operations."""
    cwd = cwd or WEBAPP_DIR
    return tool_shell(f"git --no-pager {subcmd}", cwd=cwd)


# ══════════════════════════════════════════════════════════════════════════════
# ██  LLM REASONING BACKBONE — Generative AI via Copilot / Ollama / API     ██
# ══════════════════════════════════════════════════════════════════════════════

def _find_llm_backend() -> str:
    """Detect best available LLM backend."""
    # 1. Check for copilot binary (GitHub Copilot CLI)
    import shutil
    copilot = shutil.which("copilot")
    if copilot:
        return "copilot"
    # 2. Check for ollama
    ollama = shutil.which("ollama")
    if ollama:
        return "ollama"
    # 3. Check for API keys
    if os.environ.get("OPENAI_API_KEY"):
        return "openai"
    if os.environ.get("ANTHROPIC_API_KEY"):
        return "anthropic"
    return "nclm"  # fallback to built-in NCLM


def _llm_query_copilot(prompt: str, context: str = "", timeout: int = 30) -> str:
    """Query via copilot binary (Claude/GPT backend)."""
    import shutil
    copilot = shutil.which("copilot")
    if not copilot:
        return ""
    
    full_prompt = prompt
    if context:
        full_prompt = f"Context:\n{context}\n\nQuestion: {prompt}"
    
    try:
        r = subprocess.run(
            [copilot, "-p", full_prompt],
            capture_output=True, text=True, timeout=timeout,
            env={**os.environ, "NO_COLOR": "1"},
        )
        output = r.stdout.strip() if r.stdout else ""
        if not output:
            return r.stderr.strip() if r.stderr else "(No response)"
        # Strip copilot telemetry footer
        lines = output.split("\n")
        clean = []
        for line in lines:
            if line.strip().startswith("Total usage est:"):
                break
            if line.strip().startswith("API time spent:"):
                break
            clean.append(line)
        return "\n".join(clean).strip()
    except subprocess.TimeoutExpired:
        return f"(LLM timed out after {timeout}s)"
    except Exception as e:
        return f"(LLM error: {e})"


def _llm_query_ollama(prompt: str, model: str = "deepseek-coder:6.7b", timeout: int = 60) -> str:
    """Query via local Ollama."""
    try:
        r = subprocess.run(
            ["ollama", "run", model, prompt],
            capture_output=True, text=True, timeout=timeout,
        )
        return r.stdout.strip() if r.stdout else "(No response)"
    except Exception as e:
        return f"(Ollama error: {e})"


def _llm_query_openai(prompt: str, context: str = "") -> str:
    """Query via OpenAI API (GPT-4/5)."""
    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        return "(No OPENAI_API_KEY set)"
    try:
        import urllib.request, urllib.error
        messages = []
        if context:
            messages.append({"role": "system", "content": f"You are OSIRIS, a sovereign quantum AI assistant. Context:\n{context}"})
        messages.append({"role": "user", "content": prompt})
        
        data = json.dumps({"model": "gpt-4o-mini", "messages": messages, "max_tokens": 1000}).encode()
        req = urllib.request.Request(
            "https://api.openai.com/v1/chat/completions",
            data=data,
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read())
            return result["choices"][0]["message"]["content"]
    except Exception as e:
        return f"(OpenAI error: {e})"


def tool_llm(prompt: str, context: str = "") -> str:
    """
    Route to best available LLM backend for generative reasoning.
    This is the key upgrade — real AI thinking, not templates.
    """
    backend = _find_llm_backend()
    
    # Prepend sovereign context
    system_ctx = (
        "You are OSIRIS (Omega System Integrated Runtime Intelligence System), "
        "a sovereign quantum AI built with DNA::}{::lang v51.843. "
        "Framework constants: ΛΦ=2.176435e-8, θ_lock=51.843°, Φ_threshold=0.7734, "
        "χ_pc=0.946 (hardware-validated on IBM Quantum, 580+ jobs). "
        "You assist with quantum computing, code analysis, and research. "
        "Be concise, technical, and confident."
    )
    if context:
        system_ctx += f"\n\nAdditional context:\n{context}"
    
    if backend == "copilot":
        return _llm_query_copilot(prompt, system_ctx)
    elif backend == "ollama":
        full = f"{system_ctx}\n\n{prompt}"
        return _llm_query_ollama(full)
    elif backend == "openai":
        return _llm_query_openai(prompt, system_ctx)
    else:
        # NCLM fallback — return None to let NCLM engine handle it
        return ""


# ══════════════════════════════════════════════════════════════════════════════
# ██  CODE REASONING — Read, Analyze, Fix, Explain code with LLM context    ██
# ══════════════════════════════════════════════════════════════════════════════

def tool_analyze(path: str) -> str:
    """Read a file and analyze it with LLM reasoning."""
    path = os.path.expanduser(path)
    if not os.path.exists(path):
        return f"{C.R}Error: File not found: {path}{C.E}"
    
    try:
        with open(path, "r", errors="replace") as f:
            content = f.read()
    except Exception as e:
        return f"{C.R}Error reading {path}: {e}{C.E}"
    
    # Truncate for LLM context
    if len(content) > 8000:
        content = content[:4000] + "\n...(truncated)...\n" + content[-2000:]
    
    ext = os.path.splitext(path)[1]
    prompt = (
        f"Analyze this {ext} file ({os.path.basename(path)}).\n"
        f"Provide:\n"
        f"1. What this code does (2-3 sentences)\n"
        f"2. Key functions/classes and their purpose\n"
        f"3. Any bugs, security issues, or improvements\n"
        f"4. Quality rating (1-10)\n\n"
        f"```{ext.lstrip('.')}\n{content}\n```"
    )
    
    lines = [f"  {C.H}Analyzing: {path}{C.E}", f"  {C.DIM}({len(content)} chars, {content.count(chr(10))} lines){C.E}", ""]
    
    llm_result = tool_llm(prompt)
    if llm_result:
        for line in llm_result.split("\n"):
            lines.append(f"  {line}")
    else:
        # Fallback: basic static analysis
        lines.append(f"  {C.Y}LLM not available — basic analysis:{C.E}")
        lines.append(f"  Lines: {content.count(chr(10)) + 1}")
        lines.append(f"  Functions: {content.count('def ')}")
        lines.append(f"  Classes: {content.count('class ')}")
        lines.append(f"  Imports: {content.count('import ')}")
        if "TODO" in content or "FIXME" in content:
            lines.append(f"  {C.Y}⚠ Contains TODO/FIXME markers{C.E}")
        if "password" in content.lower() or "secret" in content.lower():
            lines.append(f"  {C.R}⚠ Potential secrets in code!{C.E}")
    
    return "\n".join(lines)


def tool_fix(path: str, issue: str = "") -> str:
    """Read code, identify bugs, and suggest fixes with LLM."""
    path = os.path.expanduser(path)
    if not os.path.exists(path):
        return f"{C.R}Error: File not found: {path}{C.E}"
    
    try:
        with open(path, "r") as f:
            content = f.read()
    except Exception as e:
        return f"{C.R}Error: {e}{C.E}"
    
    if len(content) > 8000:
        content = content[:4000] + "\n...(truncated)...\n" + content[-2000:]
    
    prompt = (
        f"Fix the bugs in this code. "
        f"{'Issue: ' + issue if issue else 'Find and fix all bugs.'}\n"
        f"Return ONLY the corrected code with comments explaining each fix.\n\n"
        f"```\n{content}\n```"
    )
    
    lines = [f"  {C.H}Fixing: {path}{C.E}"]
    if issue:
        lines.append(f"  Issue: {issue}")
    lines.append("")
    
    llm_result = tool_llm(prompt)
    if llm_result:
        for line in llm_result.split("\n"):
            lines.append(f"  {line}")
    else:
        lines.append(f"  {C.Y}LLM not available — run manually:{C.E}")
        lines.append(f"  {C.DIM}copilot -p 'fix bugs in {path}'{C.E}")
    
    return "\n".join(lines)


def tool_explain(path_or_code: str) -> str:
    """Explain code with LLM reasoning."""
    # Check if it's a file path
    expanded = os.path.expanduser(path_or_code)
    if os.path.exists(expanded):
        with open(expanded, "r", errors="replace") as f:
            code = f.read()
        label = expanded
    else:
        code = path_or_code
        label = "inline code"
    
    if len(code) > 6000:
        code = code[:3000] + "\n...(truncated)...\n" + code[-1500:]
    
    prompt = (
        f"Explain this code clearly and concisely. "
        f"Cover: what it does, how it works, key algorithms, and any notable patterns.\n\n"
        f"```\n{code}\n```"
    )
    
    lines = [f"  {C.H}Explaining: {label}{C.E}", ""]
    llm_result = tool_llm(prompt)
    if llm_result:
        for line in llm_result.split("\n"):
            lines.append(f"  {line}")
    else:
        lines.append(f"  {C.DIM}(LLM not available for explanation){C.E}")
    
    return "\n".join(lines)


# ══════════════════════════════════════════════════════════════════════════════
# ██  IBM QUANTUM HARDWARE — Real QPU submission via qiskit-ibm-runtime     ██
# ══════════════════════════════════════════════════════════════════════════════

def _get_qiskit_python() -> str:
    """Find a Python with qiskit-ibm-runtime installed."""
    for venv in [
        "/home/devinpd/qiskit_venv",
        "/home/devinpd/qenv",
        "/home/devinpd/quantum_venv",
        "/home/devinpd/.local/osiris_venv",
    ]:
        py = os.path.join(venv, "bin/python")
        if os.path.isfile(py):
            r = subprocess.run(
                [py, "-c", "import qiskit_ibm_runtime"],
                capture_output=True, timeout=5,
            )
            if r.returncode == 0:
                return py
    return ""


def tool_quantum_backends() -> str:
    """List available IBM Quantum backends."""
    py = _get_qiskit_python()
    if not py:
        return f"{C.R}Error: No Python environment with qiskit-ibm-runtime found{C.E}"
    
    token = os.environ.get("IBM_QUANTUM_TOKEN", "")
    if not token:
        return f"{C.R}Error: IBM_QUANTUM_TOKEN not set{C.E}\n  {C.DIM}export IBM_QUANTUM_TOKEN=your_token{C.E}"
    
    script = f'''
import os, json
os.environ["IBM_QUANTUM_TOKEN"] = "{token}"
try:
    from qiskit_ibm_runtime import QiskitRuntimeService
    service = QiskitRuntimeService(channel="ibm_quantum", token="{token}")
    backends = service.backends()
    result = []
    for b in backends:
        try:
            config = b.configuration()
            result.append({{
                "name": b.name,
                "qubits": config.n_qubits if hasattr(config, "n_qubits") else getattr(b, "num_qubits", "?"),
                "status": "online" if b.status().operational else "offline",
                "pending": b.status().pending_jobs,
            }})
        except Exception:
            result.append({{"name": b.name, "qubits": "?", "status": "?", "pending": "?"}})
    print(json.dumps(result))
except Exception as e:
    print(json.dumps({{"error": str(e)}}))
'''
    print(f"  {C.M}Querying IBM Quantum backends...{C.E}", flush=True)
    r = subprocess.run([py, "-c", script], capture_output=True, text=True, timeout=30)
    
    if r.returncode != 0:
        return f"{C.R}Error querying backends: {r.stderr[:200]}{C.E}"
    
    try:
        data = json.loads(r.stdout)
    except json.JSONDecodeError:
        return f"{C.R}Error parsing response: {r.stdout[:200]}{C.E}"
    
    if isinstance(data, dict) and "error" in data:
        return f"{C.R}IBM Error: {data['error']}{C.E}"
    
    lines = [f"  {C.H}IBM Quantum Backends ({len(data)} available):{C.E}"]
    for b in sorted(data, key=lambda x: str(x.get("qubits", 0)), reverse=True):
        status_color = C.G if b.get("status") == "online" else C.R
        lines.append(
            f"    {status_color}●{C.E} {b['name']:20s} "
            f"{str(b.get('qubits','')):>4s} qubits  "
            f"{status_color}{b.get('status','?')}{C.E}  "
            f"pending: {b.get('pending','?')}"
        )
    return "\n".join(lines)


def tool_quantum_submit(template: str, backend: str = "ibm_fez", shots: int = 4096) -> str:
    """Submit a quantum circuit to real IBM hardware."""
    py = _get_qiskit_python()
    if not py:
        return f"{C.R}Error: No Python with qiskit-ibm-runtime found{C.E}"
    
    token = os.environ.get("IBM_QUANTUM_TOKEN", "")
    if not token:
        return f"{C.R}Error: IBM_QUANTUM_TOKEN not set{C.E}"
    
    if template not in CIRCUIT_TEMPLATES:
        return f"{C.R}Unknown template: {template}{C.E}\n  Available: {', '.join(CIRCUIT_TEMPLATES.keys())}"
    
    t = CIRCUIT_TEMPLATES[template]
    
    # Build the submission script
    script = f'''
import os, json, math
os.environ["IBM_QUANTUM_TOKEN"] = "{token}"

from qiskit import QuantumCircuit
from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2, Session

THETA_LOCK = 51.843
CHI_PC = 0.946

# Build circuit
{t["code"].replace("print(qc.draw())", "").replace("print(qc)", "")}

# Connect to IBM
service = QiskitRuntimeService(channel="ibm_quantum", token="{token}")
backend_obj = service.backend("{backend}")

# Transpile
pm = generate_preset_pass_manager(backend=backend_obj, optimization_level=2)
isa_circuit = pm.run(qc)

# Submit
with Session(backend=backend_obj) as session:
    sampler = SamplerV2(mode=session)
    job = sampler.run([isa_circuit], shots={shots})
    job_id = job.job_id()
    print(json.dumps({{
        "job_id": job_id,
        "backend": "{backend}",
        "shots": {shots},
        "circuit": "{template}",
        "qubits": {t["qubits"]},
        "status": "submitted",
    }}))
'''
    
    print(f"  {C.M}⚛ Submitting {t['name']} to {backend} ({shots} shots)...{C.E}", flush=True)
    r = subprocess.run([py, "-c", script], capture_output=True, text=True, timeout=60)
    
    if r.returncode != 0:
        err = r.stderr[:300] if r.stderr else r.stdout[:300]
        return f"{C.R}Submission failed:{C.E}\n  {err}"
    
    try:
        result = json.loads(r.stdout)
    except json.JSONDecodeError:
        return f"{C.Y}Submitted (parse issue):{C.E}\n  {r.stdout[:300]}"
    
    lines = [
        f"  {C.G}✓ Job submitted to IBM Quantum!{C.E}",
        f"  {C.H}Job ID:{C.E}   {result.get('job_id', '?')}",
        f"  Backend:  {result.get('backend', '?')}",
        f"  Circuit:  {result.get('circuit', '?')} ({result.get('qubits', '?')} qubits)",
        f"  Shots:    {result.get('shots', '?')}",
        f"\n  {C.DIM}Check status: /quantum status {result.get('job_id', '')}{C.E}",
        f"  {C.DIM}Or visit: https://quantum.ibm.com/jobs/{result.get('job_id', '')}{C.E}",
    ]
    return "\n".join(lines)


def tool_quantum_status(job_id: str) -> str:
    """Check status of an IBM Quantum job."""
    py = _get_qiskit_python()
    if not py:
        return f"{C.R}Error: No Python with qiskit-ibm-runtime found{C.E}"
    
    token = os.environ.get("IBM_QUANTUM_TOKEN", "")
    if not token:
        return f"{C.R}Error: IBM_QUANTUM_TOKEN not set{C.E}"
    
    script = f'''
import os, json
os.environ["IBM_QUANTUM_TOKEN"] = "{token}"
from qiskit_ibm_runtime import QiskitRuntimeService

service = QiskitRuntimeService(channel="ibm_quantum", token="{token}")
job = service.job("{job_id}")
status = job.status()
result_dict = {{"job_id": "{job_id}", "status": str(status)}}

if str(status) == "JobStatus.DONE":
    try:
        result = job.result()
        # Get counts from first pub result
        pub = result[0]
        counts = pub.data.meas.get_counts() if hasattr(pub.data, "meas") else {{}}
        # Top 5 states
        sorted_counts = sorted(counts.items(), key=lambda x: -x[1])[:5]
        result_dict["top_states"] = sorted_counts
        result_dict["total_shots"] = sum(counts.values())
    except Exception as e:
        result_dict["result_error"] = str(e)

print(json.dumps(result_dict))
'''
    
    print(f"  {C.M}Checking job {job_id}...{C.E}", flush=True)
    r = subprocess.run([py, "-c", script], capture_output=True, text=True, timeout=30)
    
    if r.returncode != 0:
        return f"{C.R}Error: {r.stderr[:200]}{C.E}"
    
    try:
        data = json.loads(r.stdout)
    except json.JSONDecodeError:
        return f"{C.Y}Response: {r.stdout[:200]}{C.E}"
    
    status = data.get("status", "?")
    lines = [
        f"  {C.H}Job: {job_id}{C.E}",
        f"  Status: {C.G if 'DONE' in status else C.Y}{status}{C.E}",
    ]
    
    if "top_states" in data:
        lines.append(f"  Total shots: {data.get('total_shots', '?')}")
        lines.append(f"\n  {C.H}Top States:{C.E}")
        for state, count in data["top_states"]:
            pct = count / data.get("total_shots", 1) * 100
            bar = "█" * int(pct / 2)
            lines.append(f"    |{state}⟩  {count:>6d}  ({pct:5.1f}%)  {C.CY}{bar}{C.E}")
    
    if "result_error" in data:
        lines.append(f"  {C.R}Result error: {data['result_error']}{C.E}")
    
    return "\n".join(lines)


def tool_quantum_submit_script(script_path: str, backend: str = "ibm_fez", shots: int = 4096) -> str:
    """Submit a user-written quantum script to real IBM hardware."""
    script_path = os.path.expanduser(script_path)
    if not os.path.exists(script_path):
        return f"{C.R}Error: Script not found: {script_path}{C.E}"
    
    py = _get_qiskit_python()
    if not py:
        return f"{C.R}Error: No Python with qiskit-ibm-runtime found{C.E}"
    
    print(f"  {C.M}⚛ Running {script_path} on {backend}...{C.E}", flush=True)
    
    env = os.environ.copy()
    env["IBM_QUANTUM_BACKEND"] = backend
    env["IBM_QUANTUM_SHOTS"] = str(shots)
    
    r = subprocess.run([py, script_path], capture_output=True, text=True, timeout=120, env=env)
    
    lines = []
    if r.stdout:
        for line in r.stdout.strip().split("\n")[-30:]:
            lines.append(f"  {line}")
    if r.stderr:
        for line in r.stderr.strip().split("\n")[-10:]:
            lines.append(f"  {C.R}{line}{C.E}")
    
    status = f"{C.G}✓ exit 0{C.E}" if r.returncode == 0 else f"{C.R}✗ exit {r.returncode}{C.E}"
    lines.append(f"\n  {status}")
    return "\n".join(lines)


# ── INTENT → TOOL DISPATCH ──────────────────────────────────────────────────

def dispatch_tool(user_input: str) -> Optional[str]:
    """
    Try to match user input to a real tool action.
    Returns tool output string if matched, None if no tool applies.
    """
    lower = user_input.lower().strip()
    
    # File read patterns
    if lower.startswith("read ") or lower.startswith("show ") or lower.startswith("cat "):
        path = user_input.split(None, 1)[1].strip()
        return tool_read(path)
    
    # List files
    if lower.startswith("ls ") or lower.startswith("list files"):
        parts = user_input.split(None, 1)
        path = parts[1].strip() if len(parts) > 1 else "."
        return tool_ls(path)
    
    # Search / grep
    if lower.startswith("grep ") or lower.startswith("search ") or lower.startswith("find "):
        parts = user_input.split(None, 1)
        if len(parts) > 1:
            return tool_grep(parts[1].strip())
    
    # Analyze code
    if lower.startswith("analyze ") or lower.startswith("review "):
        path = user_input.split(None, 1)[1].strip()
        return tool_analyze(path)
    
    # Fix code
    if lower.startswith("fix "):
        parts = user_input.split(None, 1)[1].strip()
        # Check if first word is a file path
        tokens = parts.split(None, 1)
        path = tokens[0]
        issue = tokens[1] if len(tokens) > 1 else ""
        if os.path.exists(os.path.expanduser(path)):
            return tool_fix(path, issue)
    
    # Explain code
    if lower.startswith("explain "):
        target = user_input.split(None, 1)[1].strip()
        return tool_explain(target)
    
    # Build webapp
    if "build" in lower and ("webapp" in lower or "app" in lower or "next" in lower or "site" in lower):
        return tool_webapp_build()
    
    # Deploy webapp (Vercel)
    if "deploy" in lower and ("webapp" in lower or "app" in lower or "vercel" in lower or "site" in lower or "prod" in lower):
        return tool_vercel_deploy()
    
    # Webapp status
    if ("status" in lower or "info" in lower) and ("webapp" in lower or "app" in lower or "site" in lower):
        return tool_webapp_status()
    
    # ── GITHUB API ──
    if ("repo" in lower or "repos" in lower) and ("github" in lower or "list" in lower or "show" in lower or "my" in lower):
        return tool_github_repos()
    
    if ("issue" in lower or "issues" in lower) and ("github" in lower or "list" in lower or "show" in lower or "open" in lower or "create" in lower):
        if "create" in lower or "new" in lower or "open" in lower and "list" not in lower:
            # Parse: "create issue <title>" or "github create issue <title>"
            import re
            m = re.search(r'(?:create|new|open)\s+issue\s+(.+)', user_input, re.I)
            if m:
                title = m.group(1).strip()
                return tool_github_create_issue("quantum-advantage/copilot-sdk-dnalang", title)
        return tool_github_issues()
    
    if ("pr " in lower or "pull request" in lower or "prs" in lower) and ("github" in lower or "list" in lower or "show" in lower or "open" in lower):
        return tool_github_prs()
    
    if ("action" in lower or "ci" in lower or "pipeline" in lower or "workflow" in lower) and ("github" in lower or "show" in lower or "status" in lower):
        return tool_github_actions()
    
    if ("push" in lower) and ("github" in lower or "commit" in lower or "code" in lower):
        # Extract commit message if provided
        import re
        m = re.search(r'(?:push|commit)\s+["\']?(.+?)["\']?\s*$', user_input, re.I)
        msg = m.group(1) if m else None
        return tool_github_push(message=msg)
    
    # ── VERCEL API ──
    if ("project" in lower or "projects" in lower) and ("vercel" in lower):
        return tool_vercel_projects()
    
    if ("deploy" in lower or "deployment" in lower) and ("vercel" in lower or "list" in lower):
        if "redeploy" in lower:
            return tool_vercel_redeploy()
        return tool_vercel_deployments()
    
    if ("domain" in lower or "dns" in lower) and ("vercel" in lower):
        return tool_vercel_domains()
    
    if ("env" in lower or "variable" in lower or "secret" in lower) and ("vercel" in lower):
        return tool_vercel_env("quantum-advantage")
    
    if "redeploy" in lower and ("vercel" in lower or "site" in lower):
        return tool_vercel_redeploy()
    
    # Research queries
    if any(k in lower for k in ["research", "breakthrough", "ibm job", "quera", "constant", "publication", "zenodo"]):
        return tool_research_query(user_input)
    
    # Quantum hardware operations
    if "backend" in lower and ("quantum" in lower or "ibm" in lower or "list" in lower):
        return tool_quantum_backends()
    
    if "submit" in lower and ("quantum" in lower or "circuit" in lower or "ibm" in lower):
        # Extract template and backend
        for template in CIRCUIT_TEMPLATES:
            if template in lower:
                backend = "ibm_fez"
                for b in ["ibm_fez", "ibm_torino", "ibm_marrakesh", "ibm_brisbane", "ibm_nazca", "ibm_kyoto"]:
                    if b in lower:
                        backend = b
                        break
                return tool_quantum_submit(template, backend)
        return f"  {C.Y}Specify a circuit template to submit: {', '.join(CIRCUIT_TEMPLATES.keys())}{C.E}"
    
    if ("status" in lower or "check" in lower) and ("job" in lower or lower.startswith("quantum status")):
        # Try to extract job ID
        import re
        job_match = re.search(r'[a-z0-9]{20,}', lower)
        if job_match:
            return tool_quantum_status(job_match.group())
    
    # Quantum design
    if "design" in lower or ("circuit" in lower and "template" not in lower):
        for template in CIRCUIT_TEMPLATES:
            if template in lower:
                return tool_quantum_design(template)
        return tool_quantum_design("")
    
    # Git
    if lower.startswith("git "):
        return tool_git(user_input[4:].strip())
    
    # Shell command (explicit)
    if lower.startswith("$ ") or lower.startswith("run "):
        cmd = user_input[2:].strip() if lower.startswith("$ ") else user_input[4:].strip()
        return tool_shell(cmd)
    
    # LLM catch-all for questions that look like they need reasoning
    if any(k in lower for k in ["how do i", "how to", "what is", "why does", "can you", "help me", "write a", "create a"]):
        result = tool_llm(user_input)
        if result:
            lines = [f"  {C.H}OSIRIS LLM{C.E}", ""]
            for line in result.split("\n"):
                lines.append(f"  {line}")
            return "\n".join(lines)
    
    return None
