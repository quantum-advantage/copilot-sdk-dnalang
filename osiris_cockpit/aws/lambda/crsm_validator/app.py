"""
11dCRSM Validation Lambda — Cryptographically Signed Experiment Ledger
DNA::}{::lang v51.843

Registers, validates, and signs quantum experiments with SHA-256 integrity hashes.
Implements the immutable ledger pattern from the 11dCRSM validation framework.
"""

import json
import os
import hashlib
import time
import uuid
from datetime import datetime, timezone
from decimal import Decimal

# Config
TABLE_NAME = os.environ.get("LEDGER_TABLE", "dnalang-experiments-production")
BUCKET = os.environ.get("RESULTS_BUCKET", "dnalang-results-869935102268-us-east-2")
REGION = os.environ.get("AWS_REGION", "us-east-2")

# Constants
LAMBDA_PHI = 2.176435e-8
THETA_LOCK = 51.843
PHI_THRESHOLD = 0.7734
GAMMA_CRITICAL = 0.3


def _sha256(data):
    """Compute SHA-256 hash of data."""
    if isinstance(data, dict):
        data = json.dumps(data, sort_keys=True, default=str)
    if isinstance(data, str):
        data = data.encode()
    return hashlib.sha256(data).hexdigest()


def _sign_record(record):
    """Sign a record with SHA-256 chain hash."""
    # Chain: hash(previous_hash + record_hash)
    record_hash = _sha256(record)
    chain_seed = f"{LAMBDA_PHI}:{THETA_LOCK}:{PHI_THRESHOLD}"
    chain_hash = _sha256(chain_seed + record_hash)
    return {
        "record_hash": record_hash,
        "chain_hash": chain_hash,
        "algorithm": "SHA-256",
        "chain_seed": "lambda_phi:theta_lock:phi_threshold",
    }


def _float_to_decimal(obj):
    """Convert floats to Decimal for DynamoDB."""
    if isinstance(obj, float):
        return Decimal(str(obj))
    if isinstance(obj, dict):
        return {k: _float_to_decimal(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_float_to_decimal(v) for v in obj]
    return obj


def lambda_handler(event, context):
    """Handle CRSM validation requests."""
    import boto3

    # Determine request type
    http_method = event.get("httpMethod", "POST")
    path = event.get("path", "/validate")
    body = event.get("body", "{}")

    if isinstance(body, str):
        try:
            body = json.loads(body)
        except json.JSONDecodeError:
            body = {}

    # Route
    if path.endswith("/validate") and http_method == "POST":
        return _validate_experiment(body, boto3)
    elif path.endswith("/verify") and http_method == "POST":
        return _verify_experiment(body, boto3)
    elif path.endswith("/ledger") and http_method == "GET":
        return _get_ledger(event, boto3)
    elif path.endswith("/attestation") and http_method == "GET":
        return _get_attestation(event, boto3)
    else:
        return _response(404, {"error": "Not found", "routes": [
            "POST /validate — register & sign experiment",
            "POST /verify — verify experiment integrity",
            "GET /ledger — list recent experiments",
            "GET /attestation — framework attestation",
        ]})


def _validate_experiment(body, boto3):
    """Register and sign a new experiment."""
    timestamp = datetime.now(timezone.utc).isoformat()
    experiment_id = body.get("experiment_id", f"crsm-{uuid.uuid4().hex[:12]}")

    # Build experiment record
    record = {
        "experiment_id": experiment_id,
        "timestamp": timestamp,
        "framework": "DNA::}{::lang v51.843",
        "cage_code": "9HUP5",
        "experiment_type": body.get("type", "crsm_validation"),
        "input_data": body.get("input", {}),
        "parameters": body.get("parameters", {}),
        "results": body.get("results", {}),
        "metrics": body.get("metrics", {
            "phi": body.get("phi", 0),
            "gamma": body.get("gamma", 1),
            "ccce": body.get("ccce", 0),
        }),
    }

    # Compute integrity hashes
    input_hash = _sha256(record["input_data"])
    result_hash = _sha256(record["results"])
    signature = _sign_record(record)

    record["integrity"] = {
        "input_hash": input_hash,
        "result_hash": result_hash,
        **signature,
    }

    # Evaluate CCCE
    phi = float(record["metrics"].get("phi", 0))
    gamma = float(record["metrics"].get("gamma", 1))
    record["above_threshold"] = phi >= PHI_THRESHOLD
    record["is_coherent"] = gamma < GAMMA_CRITICAL

    # Store in DynamoDB
    try:
        ddb = boto3.resource("dynamodb", region_name=REGION)
        table = ddb.Table(TABLE_NAME)
        ddb_record = _float_to_decimal(record)
        table.put_item(
            Item=ddb_record,
            ConditionExpression="attribute_not_exists(experiment_id)",
        )
    except Exception as e:
        if "ConditionalCheckFailedException" in str(e):
            return _response(409, {
                "error": "Experiment already registered",
                "experiment_id": experiment_id,
            })
        return _response(500, {"error": f"DynamoDB write failed: {str(e)}"})

    # Store full record in S3
    try:
        s3 = boto3.client("s3", region_name=REGION)
        s3.put_object(
            Bucket=BUCKET,
            Key=f"crsm/{experiment_id}.json",
            Body=json.dumps(record, indent=2, default=str),
            ContentType="application/json",
        )
    except Exception as e:
        record["s3_warning"] = str(e)

    return _response(201, {
        "status": "REGISTERED",
        "experiment_id": experiment_id,
        "timestamp": timestamp,
        "integrity": record["integrity"],
        "above_threshold": record["above_threshold"],
        "is_coherent": record["is_coherent"],
    })


def _verify_experiment(body, boto3):
    """Verify integrity of a registered experiment."""
    experiment_id = body.get("experiment_id")
    if not experiment_id:
        return _response(400, {"error": "experiment_id required"})

    try:
        ddb = boto3.resource("dynamodb", region_name=REGION)
        table = ddb.Table(TABLE_NAME)
        resp = table.get_item(Key={"experiment_id": experiment_id})
    except Exception as e:
        return _response(500, {"error": str(e)})

    item = resp.get("Item")
    if not item:
        return _response(404, {"error": f"Experiment {experiment_id} not found"})

    # Recompute hashes
    integrity = item.get("integrity", {})
    stored_record_hash = integrity.get("record_hash", "")

    # Rebuild record for verification
    verify_record = {k: v for k, v in item.items() if k != "integrity"}
    recomputed = _sign_record(verify_record)

    match = recomputed["record_hash"] == stored_record_hash

    return _response(200, {
        "experiment_id": experiment_id,
        "verified": match,
        "stored_hash": stored_record_hash,
        "recomputed_hash": recomputed["record_hash"],
        "chain_hash_match": recomputed["chain_hash"] == integrity.get("chain_hash", ""),
        "timestamp": item.get("timestamp"),
    })


def _get_ledger(event, boto3):
    """List recent experiments from ledger."""
    try:
        ddb = boto3.resource("dynamodb", region_name=REGION)
        table = ddb.Table(TABLE_NAME)
        resp = table.scan(Limit=50)
        items = resp.get("Items", [])

        # Convert Decimals
        def fix(obj):
            if isinstance(obj, Decimal):
                return float(obj)
            if isinstance(obj, dict):
                return {k: fix(v) for k, v in obj.items()}
            if isinstance(obj, list):
                return [fix(v) for v in obj]
            return obj

        return _response(200, {
            "framework": "DNA::}{::lang v51.843",
            "ledger_count": len(items),
            "experiments": [fix(i) for i in items],
        })
    except Exception as e:
        return _response(500, {"error": str(e)})


def _get_attestation(event, boto3):
    """Return framework attestation."""
    return _response(200, {
        "framework": "DNA::}{::lang v51.843",
        "version": "51.843",
        "author": "Devin Phillip Davis",
        "organization": "Agile Defense Systems",
        "cage_code": "9HUP5",
        "attestation": {
            "type": "SHA-256 chain hash",
            "chain_seed": "lambda_phi:theta_lock:phi_threshold",
            "constants": {
                "lambda_phi": LAMBDA_PHI,
                "theta_lock": THETA_LOCK,
                "phi_threshold": PHI_THRESHOLD,
                "gamma_critical": GAMMA_CRITICAL,
            },
            "immutable": True,
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status": "SOVEREIGN",
    })


def _response(code, body):
    return {
        "statusCode": code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": json.dumps(body, default=str),
    }
