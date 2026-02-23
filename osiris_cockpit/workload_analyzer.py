#!/usr/bin/env python3
"""
Quantum Workload Analyzer — IBM Hardware Job Grokker
DNA::}{::lang v51.843

Parses real IBM Quantum job results (ibm_fez, ibm_torino, ibm_marrakesh),
computes entropy, correlations, CCCE metrics, and Hamming weight distributions.
Outputs structured analysis for upload to DynamoDB/S3 or CLI display.
"""

import json
import os
import glob
import math
import hashlib
import zipfile
import tempfile
from collections import Counter
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Tuple
from pathlib import Path

# Immutable constants
LAMBDA_PHI = 2.176435e-8
THETA_LOCK = 51.843
PHI_THRESH = 0.7734
GAMMA_CRIT = 0.3
CHI_PC = 0.946


@dataclass
class JobAnalysis:
    job_id: str
    backend: str
    status: str
    n_qubits: int
    n_shots: int
    n_states: int
    # Entropy
    shannon_entropy: float
    max_entropy: float
    entropy_ratio: float
    # Distribution
    top_states: Dict[str, int]
    hamming_weights: Dict[int, float]
    # Correlations
    marginals: Dict[int, float]  # per-qubit P(1)
    pairwise_correlations: Dict[str, float]
    # CCCE metrics
    phi: float
    gamma: float
    ccce: float
    xi: float
    above_threshold: bool
    is_coherent: bool
    # Integrity
    input_hash: str
    result_hash: str


@dataclass
class WorkloadReport:
    n_jobs: int
    backends: Dict[str, int]
    total_shots: int
    avg_entropy: float
    avg_phi: float
    avg_gamma: float
    avg_ccce: float
    above_threshold_count: int
    coherent_count: int
    sovereign_grade: str
    jobs: List[JobAnalysis]
    aggregate_hash: str


def _parse_counts_from_result(result_data: dict) -> Optional[Dict[str, int]]:
    """Extract bitstring counts from IBM result JSON."""
    try:
        import base64
        pub_results = result_data["__value__"]["pub_results"]
        all_counts = Counter()

        for pub in pub_results:
            data = pub["__value__"]["data"]
            fields = data["__value__"]["fields"]

            # Find the BitArray field regardless of name
            for field_val in fields.values():
                if isinstance(field_val, dict) and field_val.get("__type__") == "BitArray":
                    arr_b64 = field_val["__value__"]["array"]["__value__"]
                    raw = base64.b64decode(arr_b64)
                    n_bits = field_val["__value__"].get("num_bits", 4)
                    counts = _decode_bitarray(raw, n_bits)
                    all_counts.update(counts)
                    break

            # Fallback: check for direct counts
            if not all_counts and "counts" in fields:
                all_counts.update(fields["counts"])

        return dict(all_counts) if all_counts else None

    except (KeyError, IndexError, TypeError):
        pass

    return None


def _decode_bitarray(raw_bytes: bytes, n_bits: int) -> Dict[str, int]:
    """Decode packed bitarray into counts dict."""
    counts = Counter()
    bytes_per_sample = math.ceil(n_bits / 8)

    for i in range(0, len(raw_bytes), bytes_per_sample):
        chunk = raw_bytes[i:i + bytes_per_sample]
        if len(chunk) < bytes_per_sample:
            break
        val = int.from_bytes(chunk, byteorder='big')
        mask = (1 << n_bits) - 1
        val &= mask
        bs = format(val, f'0{n_bits}b')
        counts[bs] += 1

    return dict(counts)


def _shannon_entropy(counts: Dict[str, int]) -> float:
    """Compute Shannon entropy in bits."""
    total = sum(counts.values())
    if total == 0:
        return 0.0
    entropy = 0.0
    for c in counts.values():
        if c > 0:
            p = c / total
            entropy -= p * math.log2(p)
    return entropy


def _hamming_weight_dist(counts: Dict[str, int]) -> Dict[int, float]:
    """Compute Hamming weight distribution."""
    total = sum(counts.values())
    hw = Counter()
    for bs, c in counts.items():
        w = bs.count('1')
        hw[w] += c
    return {w: hw[w] / total for w in sorted(hw.keys())}


def _marginals(counts: Dict[str, int], n_bits: int) -> Dict[int, float]:
    """Per-qubit P(1) marginals."""
    total = sum(counts.values())
    marg = {i: 0.0 for i in range(n_bits)}
    for bs, c in counts.items():
        for i, bit in enumerate(bs):
            if bit == '1':
                marg[i] += c
    return {i: marg[i] / total for i in range(n_bits)}


def _pairwise_correlations(counts: Dict[str, int], n_bits: int) -> Dict[str, float]:
    """Pairwise correlations <Z_i Z_j> - <Z_i><Z_j>."""
    total = sum(counts.values())
    marg = _marginals(counts, n_bits)
    corrs = {}
    for i in range(n_bits):
        for j in range(i + 1, n_bits):
            joint_11 = 0
            for bs, c in counts.items():
                if bs[i] == '1' and bs[j] == '1':
                    joint_11 += c
            p_ij = joint_11 / total
            # Correlation = P(1,1) - P_i(1)*P_j(1)
            corrs[f"{i}-{j}"] = p_ij - marg[i] * marg[j]
    return corrs


def _compute_ccce(counts: Dict[str, int], n_bits: int) -> Tuple[float, float, float, float]:
    """Compute CCCE metrics from measurement distribution."""
    total = sum(counts.values())
    sorted_counts = sorted(counts.values(), reverse=True)

    # Phi: fidelity proxy — top 2 states / total (for entangled states)
    if len(sorted_counts) >= 2:
        phi = (sorted_counts[0] + sorted_counts[1]) / total
    else:
        phi = sorted_counts[0] / total if sorted_counts else 0

    # Gamma: decoherence — fraction in non-dominant states
    dominant = sum(sorted_counts[:2]) if len(sorted_counts) >= 2 else sum(sorted_counts[:1])
    gamma = 1.0 - dominant / total if total > 0 else 1.0

    # CCCE
    ccce = phi * (1 - gamma) - 0.5 * gamma

    # Xi (negentropy)
    xi = (LAMBDA_PHI * phi) / max(gamma, 0.001)

    return phi, gamma, ccce, xi


def analyze_job(info_path: str, result_path: str) -> Optional[JobAnalysis]:
    """Analyze a single IBM Quantum job."""
    try:
        with open(info_path) as f:
            info = json.load(f)
        with open(result_path) as f:
            result = json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return None

    job_id = os.path.basename(info_path).replace('-info.json', '')
    backend = info.get('backend', 'unknown')
    status = info.get('status', 'unknown')

    # Extract counts
    counts = _parse_counts_from_result(result)
    if not counts or len(counts) == 0:
        return None

    # Determine n_bits from bitstrings
    sample_key = next(iter(counts))
    n_bits = len(sample_key)
    n_shots = sum(counts.values())

    # Compute metrics
    entropy = _shannon_entropy(counts)
    max_ent = math.log2(2 ** n_bits) if n_bits > 0 else 1
    hw_dist = _hamming_weight_dist(counts)
    marg = _marginals(counts, n_bits)
    corrs = _pairwise_correlations(counts, n_bits) if n_bits <= 10 else {}
    phi, gamma, ccce, xi = _compute_ccce(counts, n_bits)

    # Top states
    sorted_states = sorted(counts.items(), key=lambda x: -x[1])[:10]
    top = {k: v for k, v in sorted_states}

    # Integrity hashes
    input_hash = hashlib.sha256(json.dumps(info, sort_keys=True).encode()).hexdigest()[:16]
    result_hash = hashlib.sha256(json.dumps(result, sort_keys=True).encode()).hexdigest()[:16]

    return JobAnalysis(
        job_id=job_id,
        backend=backend,
        status=status,
        n_qubits=n_bits,
        n_shots=n_shots,
        n_states=len(counts),
        shannon_entropy=round(entropy, 4),
        max_entropy=round(max_ent, 4),
        entropy_ratio=round(entropy / max_ent, 4) if max_ent > 0 else 0,
        top_states=top,
        hamming_weights={k: round(v, 4) for k, v in hw_dist.items()},
        marginals={k: round(v, 4) for k, v in marg.items()},
        pairwise_correlations={k: round(v, 4) for k, v in corrs.items()},
        phi=round(phi, 6),
        gamma=round(gamma, 6),
        ccce=round(ccce, 6),
        xi=xi,
        above_threshold=phi >= PHI_THRESH,
        is_coherent=gamma < GAMMA_CRIT,
        input_hash=input_hash,
        result_hash=result_hash,
    )


def analyze_directory(dirpath: str) -> List[JobAnalysis]:
    """Analyze all jobs in a directory."""
    infos = sorted(glob.glob(os.path.join(dirpath, "job-*-info.json")))
    analyses = []
    for info_path in infos:
        result_path = info_path.replace("-info.json", "-result.json")
        if os.path.exists(result_path):
            a = analyze_job(info_path, result_path)
            if a:
                analyses.append(a)
    return analyses


def analyze_zipfile(zippath: str) -> List[JobAnalysis]:
    """Analyze all jobs in a zip file."""
    analyses = []
    with zipfile.ZipFile(zippath) as z:
        infos = sorted([n for n in z.namelist() if n.endswith("-info.json")])
        with tempfile.TemporaryDirectory() as tmpdir:
            for info_name in infos:
                result_name = info_name.replace("-info.json", "-result.json")
                if result_name in z.namelist():
                    info_path = os.path.join(tmpdir, os.path.basename(info_name))
                    result_path = os.path.join(tmpdir, os.path.basename(result_name))
                    with open(info_path, 'wb') as f:
                        f.write(z.read(info_name))
                    with open(result_path, 'wb') as f:
                        f.write(z.read(result_name))
                    a = analyze_job(info_path, result_path)
                    if a:
                        analyses.append(a)
    return analyses


def generate_report(analyses: List[JobAnalysis]) -> WorkloadReport:
    """Generate aggregate report from individual analyses."""
    if not analyses:
        return WorkloadReport(
            n_jobs=0, backends={}, total_shots=0,
            avg_entropy=0, avg_phi=0, avg_gamma=0, avg_ccce=0,
            above_threshold_count=0, coherent_count=0,
            sovereign_grade="NO_DATA", jobs=[], aggregate_hash=""
        )

    backends = Counter(a.backend for a in analyses)
    total_shots = sum(a.n_shots for a in analyses)
    avg_ent = sum(a.shannon_entropy for a in analyses) / len(analyses)
    avg_phi = sum(a.phi for a in analyses) / len(analyses)
    avg_gamma = sum(a.gamma for a in analyses) / len(analyses)
    avg_ccce = sum(a.ccce for a in analyses) / len(analyses)
    above = sum(1 for a in analyses if a.above_threshold)
    coherent = sum(1 for a in analyses if a.is_coherent)

    if above == len(analyses) and coherent == len(analyses):
        grade = "SOVEREIGN"
    elif above > len(analyses) * 0.7:
        grade = "COHERENT"
    elif above > len(analyses) * 0.4:
        grade = "PARTIAL"
    else:
        grade = "DECOHERENT"

    agg_hash = hashlib.sha256(
        json.dumps([a.job_id for a in analyses], sort_keys=True).encode()
    ).hexdigest()[:32]

    return WorkloadReport(
        n_jobs=len(analyses),
        backends=dict(backends),
        total_shots=total_shots,
        avg_entropy=round(avg_ent, 4),
        avg_phi=round(avg_phi, 6),
        avg_gamma=round(avg_gamma, 6),
        avg_ccce=round(avg_ccce, 6),
        above_threshold_count=above,
        coherent_count=coherent,
        sovereign_grade=grade,
        jobs=analyses,
        aggregate_hash=agg_hash,
    )


def analyze_all_workloads() -> WorkloadReport:
    """Analyze ALL available workload data."""
    all_analyses = []

    # Directory sources
    home = os.path.expanduser("~")
    dirs = [
        os.path.join(home, "workloads (5)"),
    ]
    for d in dirs:
        if os.path.isdir(d):
            all_analyses.extend(analyze_directory(d))

    # Zip sources
    zips = [
        os.path.join(home, "workloads.zip"),
    ]
    for z in zips:
        if os.path.isfile(z):
            all_analyses.extend(analyze_zipfile(z))

    return generate_report(all_analyses)


def format_report_cli(report: WorkloadReport) -> str:
    """Format report for CLI display."""
    lines = [
        f"  ╔══════════════════════════════════════════════════════════════╗",
        f"  ║  Quantum Workload Analysis │ DNA::}}{{::lang v51.843         ║",
        f"  ╚══════════════════════════════════════════════════════════════╝",
        f"",
        f"  Jobs: {report.n_jobs}  │  Shots: {report.total_shots:,}  │  Grade: {report.sovereign_grade}",
        f"  Backends: {', '.join(f'{b} ({c})' for b, c in report.backends.items())}",
        f"",
        f"  ┌─────────── Aggregate Metrics ───────────┐",
        f"  │  Avg Entropy:  {report.avg_entropy:.4f} bits              │",
        f"  │  Avg Φ:        {report.avg_phi:.6f}                 │",
        f"  │  Avg Γ:        {report.avg_gamma:.6f}                 │",
        f"  │  Avg CCCE:     {report.avg_ccce:.6f}                 │",
        f"  │  Above Φ:      {report.above_threshold_count}/{report.n_jobs}                          │",
        f"  │  Coherent:     {report.coherent_count}/{report.n_jobs}                          │",
        f"  └─────────────────────────────────────────┘",
        f"",
    ]

    if report.jobs:
        lines.append(f"  {'Job ID':42s} {'Backend':14s} {'Φ':>8s} {'Γ':>8s} {'H(bits)':>8s} {'Status':>8s}")
        lines.append(f"  {'─'*42} {'─'*14} {'─'*8} {'─'*8} {'─'*8} {'─'*8}")
        for j in report.jobs:
            mark = "✓" if j.above_threshold else "✗"
            lines.append(
                f"  {mark} {j.job_id[:40]:40s} {j.backend:14s} {j.phi:8.4f} {j.gamma:8.4f} {j.shannon_entropy:8.4f} {j.n_shots:>8,}"
            )

    lines.append(f"\n  Hash: {report.aggregate_hash}")
    return "\n".join(lines)


def upload_to_aws(report: WorkloadReport) -> dict:
    """Upload analysis results to DynamoDB and S3."""
    import boto3
    from datetime import datetime, timezone

    region = "us-east-2"
    timestamp = datetime.now(timezone.utc).isoformat()

    results = {"dynamodb": 0, "s3": False}

    try:
        ddb = boto3.resource("dynamodb", region_name=region)
        table = ddb.Table("dnalang-experiments-production")

        for job in report.jobs:
            table.put_item(Item={
                "job_id": f"workload-{job.job_id}",
                "created_at": timestamp,
                "experiment_id": f"workload-{job.job_id}",
                "timestamp": timestamp,
                "backend": job.backend,
                "n_qubits": job.n_qubits,
                "n_shots": job.n_shots,
                "phi": str(job.phi),
                "gamma": str(job.gamma),
                "ccce": str(job.ccce),
                "shannon_entropy": str(job.shannon_entropy),
                "above_threshold": job.above_threshold,
                "is_coherent": job.is_coherent,
                "input_hash": job.input_hash,
                "result_hash": job.result_hash,
                "source": "workload_analyzer",
            })
            results["dynamodb"] += 1
    except Exception as e:
        results["dynamodb_error"] = str(e)

    try:
        s3 = boto3.client("s3", region_name=region)
        report_dict = {
            "framework": "DNA::}{::lang v51.843",
            "cage_code": "9HUP5",
            "analysis_type": "workload_grok",
            "timestamp": timestamp,
            "n_jobs": report.n_jobs,
            "total_shots": report.total_shots,
            "backends": report.backends,
            "avg_phi": report.avg_phi,
            "avg_gamma": report.avg_gamma,
            "avg_ccce": report.avg_ccce,
            "sovereign_grade": report.sovereign_grade,
            "aggregate_hash": report.aggregate_hash,
            "jobs": [asdict(j) for j in report.jobs],
        }
        key = f"analysis/workload-grok-{timestamp.replace(':', '-')}.json"
        s3.put_object(
            Bucket="dnalang-results-869935102268-us-east-2",
            Key=key,
            Body=json.dumps(report_dict, indent=2, default=str),
            ContentType="application/json",
        )
        results["s3"] = True
        results["s3_key"] = key
    except Exception as e:
        results["s3_error"] = str(e)

    return results


if __name__ == "__main__":
    report = analyze_all_workloads()
    print(format_report_cli(report))
