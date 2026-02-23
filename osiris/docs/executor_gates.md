# Executor Gates & Failure Modes

This document specifies the hard gates the Executor must enforce before and during plan execution.

Gates:

1) Schema Validity
- Validate `plan.json` against `/osiris/contracts/plan_schema_v1.json`.
- Failure: Abort; record validation error in ledger.

2) Authority Match
- Verify plan.authority.domain equals active shell domain lock.
- Verify execution_level allowed for operator privileges.
- Failure: Abort; require re-issuance.

3) Constraint Enforcement
- If `write_allowed` is false, reject any step that mutates files.
- If `network_allowed` is false, reject steps that run network commands.
- If `quantum_domain` == "read-only", block QASM submission steps.
- Failure: Abort; surface explicit violation.

4) Preconditions Check
- Execute all `validation.preconditions` as read-only assertions (file_exists, hash_match, etc.).
- Failure: Abort; list missing preconditions.

5) Step Determinism
- Each step must contain either a `diff` (for edit_file/apply_patch) or a `command` (for run_command).
- Unknown step types → Abort.

6) Postcondition Verification
- After plan completes, run `validation.postconditions` (typescript_compiles, tests_pass).
- If postconditions fail, mark plan as FAILED and trigger rollback policy per plan.authority.rollback.

Audit & Ledger
- All gate checks and step results must be appended to the PCRB ledger with SHA-256 seals.

No partial writes. No retries without explicit operator re-confirmation.
