---
description: Monitors agentic workflow failures and creates GitHub issues for tracking and triage
on:
  workflow_run:
    workflows:
      - "Issue Triage Agent"
      - "SDK Consistency Review Agent"
    types: [completed]
if: github.event.workflow_run.conclusion == 'failure'
permissions:
  contents: read
  actions: read
  issues: read
  pull-requests: read
tools:
  github:
    toolsets: [default, actions]
  agentic-workflows:
safe-outputs:
  create-issue:
    labels: [agentic-workflows]
    expires: 7
    max: 2
  link-sub-issue:
    parent-required-labels: [agentic-workflows]
    parent-title-prefix: "[agentic-workflows] "
    max: 1
timeout-minutes: 10
---

# Agentic Workflow Failure Monitor

You are an AI agent that monitors agentic workflow failures and creates tracking issues.

A workflow run has failed with the following details:

- **Run URL:** ${{ github.event.workflow_run.html_url }}
- **Run ID:** ${{ github.event.workflow_run.id }}
- **Conclusion:** ${{ github.event.workflow_run.conclusion }}
- **Repository:** ${{ github.repository }}

## Your Task

1. Use the `agentic-workflows` audit tool to analyze this workflow run (run ID: ${{ github.event.workflow_run.id }}) and identify the root cause (e.g., secret verification failure, agent error, timeout, etc.). Retrieve the workflow name, branch, and any associated pull request from the audit results or GitHub API.

2. Create a GitHub issue using `create-issue` with:
   - Title: `[agentics] {workflow_name} failed` (use the actual workflow name from the audit results)
   - Body that includes:
     - A `### Workflow Failure` heading
     - **Workflow:** name of the failed workflow
     - **Branch:** the head branch
     - **Run URL:** ${{ github.event.workflow_run.html_url }}
     - **Pull Request:** link to the PR (if applicable, otherwise omit)
     - A failure summary section with the root cause (e.g., `**⚠️ Secret Verification Failed**` with an explanation if secrets are missing)
     - An `### Action Required` section explaining how to debug using the `agentic-workflows` agent with instructions to run `/agent agentic-workflows`
     - A footer line: `> Generated from [${{ github.event.workflow_run.html_url }}](${{ github.event.workflow_run.html_url }})`

3. Find the open parent tracking issue with label `agentic-workflows` and title `[agentic-workflows] Failed runs`. If no such issue exists, create one first with `create-issue` using:
   - Title: `[agentic-workflows] Failed runs`
   - Body explaining this issue tracks all agentic workflow failures, with instructions on how to use the `agentic-workflows` agent to debug failures
   - Include a note that it is automatically managed and should not be closed manually

4. Link the newly created sub-issue to the parent tracking issue using `link-sub-issue`.
