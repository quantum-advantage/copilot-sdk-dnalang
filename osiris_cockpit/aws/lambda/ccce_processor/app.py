"""
DNA::}{::lang CCCE Telemetry Processor — AWS Lambda
Processes experiment results from EventBridge, stores telemetry, serves metrics API.
"""

import json
import math
import os
import boto3
from datetime import datetime, timezone
from decimal import Decimal
from boto3.dynamodb.conditions import Key

LAMBDA_PHI = float(os.environ.get('LAMBDA_PHI', '2.176435e-08'))
THETA_LOCK = float(os.environ.get('THETA_LOCK', '51.843'))
PHI_THRESH = float(os.environ.get('PHI_THRESHOLD', '0.7734'))
GAMMA_CRIT = float(os.environ.get('GAMMA_CRITICAL', '0.3'))

TELEMETRY_TABLE = os.environ.get('TELEMETRY_TABLE', '')
RESULTS_BUCKET  = os.environ.get('RESULTS_BUCKET', '')

dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')


def lambda_handler(event, context):
    """
    Routes:
      EventBridge trigger  → store telemetry from experiment completion
      GET /telemetry/metrics   → return latest CCCE metrics for all experiments
      GET /telemetry/{id}      → return metrics for specific experiment
    """
    # EventBridge event
    if 'detail-type' in event and event['detail-type'] == 'ExperimentCompleted':
        return _process_event(event['detail'])

    # API Gateway
    method = event.get('httpMethod', '')
    path = event.get('path', '')

    if method == 'GET' and '/telemetry/metrics' in path:
        return _get_all_metrics(event)
    elif method == 'GET' and '/telemetry/' in path:
        exp_id = event.get('pathParameters', {}).get('experiment_id', '')
        return _get_experiment_metrics(exp_id)

    return _json_response(400, {'error': 'Unknown route'})


def identity_handler(event, context):
    """
    GET /identity — Sovereign identity endpoint
    GET /health   — Health check
    """
    path = event.get('path', '')
    xi = (LAMBDA_PHI * PHI_THRESH) / GAMMA_CRIT

    if '/health' in path:
        return _json_response(200, {
            'status': 'SOVEREIGN',
            'framework': 'DNA::}{::lang v51.843',
            'phi': PHI_THRESH,
            'gamma': GAMMA_CRIT,
            'xi': xi,
            'timestamp': datetime.now(timezone.utc).isoformat(),
        })

    return _json_response(200, {
        'framework': 'DNA::}{::lang v51.843',
        'version': '51.843',
        'author': 'Devin Phillip Davis',
        'organization': 'Agile Defense Systems',
        'cage_code': '9HUP5',
        'constants': {
            'lambda_phi': LAMBDA_PHI,
            'theta_lock': THETA_LOCK,
            'phi_threshold': PHI_THRESH,
            'gamma_critical': GAMMA_CRIT,
            'chi_pc': 0.946,
            'zeno_frequency_hz': 1.25e6,
        },
        'negentropy_xi': xi,
        'subsystems': [
            'Aeterna Porta — Token-free quantum execution',
            'NCLM Swarm — 7-node consciousness evolution',
            'Tesseract A* — Correlated decoder',
            'QuEra 256 — Neutral atom adapter',
            'SCIMITAR — Quantum-safe defense',
        ],
        'quantum_backends': [
            'ibm_torino (133q)',
            'ibm_fez (127q)',
            'ibm_nighthawk',
            'amazon_braket (IonQ, Rigetti)',
        ],
        'status': 'SOVEREIGN',
        'timestamp': datetime.now(timezone.utc).isoformat(),
    })


def _process_event(detail):
    """Store an experiment completion event in the telemetry table."""
    if not TELEMETRY_TABLE:
        return {'status': 'skipped', 'reason': 'no telemetry table configured'}

    table = dynamodb.Table(TELEMETRY_TABLE)
    ccce = detail.get('ccce', {})

    item = {
        'experiment_id': detail.get('experiment_id', 'unknown'),
        'timestamp': detail.get('timestamp', datetime.now(timezone.utc).isoformat()),
        'job_id': detail.get('job_id', ''),
        'backend': detail.get('backend', 'unknown'),
        'phi': Decimal(str(ccce.get('phi', 0))),
        'gamma': Decimal(str(ccce.get('gamma', 0))),
        'ccce': Decimal(str(ccce.get('ccce', 0))),
        'xi': Decimal(str(ccce.get('xi', 0))),
        'above_threshold': ccce.get('above_threshold', False),
        'is_coherent': ccce.get('is_coherent', False),
    }
    table.put_item(Item=item)
    return {'status': 'stored', 'experiment_id': item['experiment_id']}


def _get_all_metrics(event):
    """Return latest CCCE metrics for all known experiments."""
    if not TELEMETRY_TABLE:
        return _json_response(200, _static_metrics())

    table = dynamodb.Table(TELEMETRY_TABLE)
    experiments = ['STD_BELL', 'EXP_THETA', 'EXP_LAMBDA_PHI', 'EXP_Z8',
                   'EXP_GHZ', 'EXP_VQE', 'EXP_TITAN_TRI', 'EXP_TITAN_BELL',
                   'EXP_LAZARUS', 'EXP_TELEPORT']

    metrics = {}
    for exp_id in experiments:
        try:
            resp = table.query(
                KeyConditionExpression=Key('experiment_id').eq(exp_id),
                ScanIndexForward=False,
                Limit=1,
            )
            if resp.get('Items'):
                item = resp['Items'][0]
                phi = float(item.get('phi', 0))
                gamma = float(item.get('gamma', 0))
                xi = (LAMBDA_PHI * phi) / max(gamma, 0.001)
                metrics[exp_id] = {
                    'phi': phi,
                    'gamma': gamma,
                    'ccce': float(item.get('ccce', 0)),
                    'xi': xi,
                    'above_threshold': phi >= PHI_THRESH,
                    'is_coherent': gamma < GAMMA_CRIT,
                    'backend': item.get('backend', 'unknown'),
                    'timestamp': item.get('timestamp', ''),
                }
        except Exception:
            pass

    if not metrics:
        return _json_response(200, _static_metrics())

    above = sum(1 for m in metrics.values() if m['above_threshold'])
    coherent = sum(1 for m in metrics.values() if m['is_coherent'])

    return _json_response(200, {
        'framework': 'DNA::}{::lang v51.843',
        'telemetry_source': 'dynamodb',
        'n_experiments': len(metrics),
        'above_threshold': above,
        'coherent': coherent,
        'experiments': metrics,
        'timestamp': datetime.now(timezone.utc).isoformat(),
    })


def _get_experiment_metrics(experiment_id):
    """Return historical metrics for a specific experiment."""
    if not TELEMETRY_TABLE or not experiment_id:
        return _json_response(404, {'error': 'Experiment not found'})

    table = dynamodb.Table(TELEMETRY_TABLE)
    resp = table.query(
        KeyConditionExpression=Key('experiment_id').eq(experiment_id),
        ScanIndexForward=False,
        Limit=20,
    )

    items = []
    for item in resp.get('Items', []):
        items.append({
            'timestamp': item.get('timestamp', ''),
            'phi': float(item.get('phi', 0)),
            'gamma': float(item.get('gamma', 0)),
            'ccce': float(item.get('ccce', 0)),
            'xi': float(item.get('xi', 0)),
            'backend': item.get('backend', ''),
        })

    return _json_response(200, {
        'experiment_id': experiment_id,
        'history': items,
        'count': len(items),
    })


def _static_metrics():
    """Fallback: return metrics from immutable constants."""
    xi = (LAMBDA_PHI * PHI_THRESH) / GAMMA_CRIT
    return {
        'framework': 'DNA::}{::lang v51.843',
        'telemetry_source': 'constants',
        'constants': {
            'lambda_phi': LAMBDA_PHI,
            'theta_lock': THETA_LOCK,
            'phi_threshold': PHI_THRESH,
            'gamma_critical': GAMMA_CRIT,
            'negentropy_xi': xi,
        },
        'status': 'No live telemetry data — run experiments first',
    }


def _json_response(code, body):
    return {
        'statusCode': code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'X-DNA-Lang-Version': '51.843',
        },
        'body': json.dumps(body, default=str),
    }
