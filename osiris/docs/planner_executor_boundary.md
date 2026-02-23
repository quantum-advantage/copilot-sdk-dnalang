# Planner → Executor Contract (v1)

This document defines the Planner and Executor roles and the Plan Artifact which is the only object that may cross the boundary.

Principles:
- Planner: read-only reasoning, plan synthesis, risk estimation. Never executes or mutates state.
- Executor: deterministic mechanical application of Plan steps. Never reasons or alters plans.

Plan Artifact: a JSON file conforming to `plan_schema_v1.json` containing:
- `meta`: identifiers and planner hash
- `authority`: domain, execution_level, confirmation
- `constraints`: write/network/quantum flags
- `steps`: ordered atomic steps (edit_file, run_command, apply_patch, verify)
- `validation`: pre/postconditions to check

Execution workflow:
1. Planner emits `plan.json` and signs with `planner_hash`.
2. CRSM Projector may annotate `plan.json` (read-only annotation).
3. Operator confirms plan; Executor validates schema and authority.
4. Executor enforces gates (schema, authority, constraints) then executes steps sequentially.
5. Each step result is recorded in an execution ledger with step hash and status.

Abort rules: any gate failure causes full abort and no partial writes.
