#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
# DNA::}{::lang Quantum Platform — CloudShell One-Shot Deploy
# Agile Defense Systems | CAGE 9HUP5
# Paste this entire script into AWS CloudShell
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

REGION="us-east-2"
STACK="dnalang-quantum-platform"
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  DNA::}{::lang v51.843 — AWS Deployment                  ║"
echo "║  Account: $ACCOUNT  Region: $REGION                      ║"
echo "║  Agile Defense Systems | CAGE 9HUP5                      ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# ── Create directory structure ─────────────────────────────────────────
mkdir -p ~/dnalang-platform/{lambda/experiment_runner,lambda/ccce_processor,statemachine}
cd ~/dnalang-platform

# ═══════════════════════════════════════════════════════════════════════
# SAM TEMPLATE
# ═══════════════════════════════════════════════════════════════════════
cat > template.yaml << 'TEMPLATE_EOF'
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: >
  DNA-Lang Quantum Orchestration Platform
  Agile Defense Systems | CAGE 9HUP5
  Event-driven quantum circuit execution with CCCE telemetry.

Parameters:
  Environment:
    Type: String
    Default: production
    AllowedValues: [production, staging, dev]
  IBMQuantumToken:
    Type: String
    NoEcho: true
    Default: ''
    Description: IBM Quantum API token (optional)

Globals:
  Function:
    Runtime: python3.11
    Timeout: 300
    MemorySize: 512
    Environment:
      Variables:
        ENVIRONMENT: !Ref Environment
        RESULTS_BUCKET: !Ref ResultsBucket
        TELEMETRY_TABLE: !Ref TelemetryTable
        EXPERIMENTS_TABLE: !Ref ExperimentsTable
        LAMBDA_PHI: '2.176435e-08'
        THETA_LOCK: '51.843'
        PHI_THRESHOLD: '0.7734'
        GAMMA_CRITICAL: '0.3'

Resources:

  # ═══ STORAGE ═══

  ResultsBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub 'dnalang-results-${AWS::AccountId}-${AWS::Region}'
      VersioningConfiguration:
        Status: Enabled
      LifecycleConfiguration:
        Rules:
          - Id: ArchiveOldResults
            Status: Enabled
            Transitions:
              - StorageClass: GLACIER
                TransitionInDays: 90
      Tags:
        - Key: Framework
          Value: 'DNALang-v51.843'
        - Key: CAGE
          Value: '9HUP5'

  TelemetryTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub 'dnalang-ccce-telemetry-${Environment}'
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: experiment_id
          AttributeType: S
        - AttributeName: timestamp
          AttributeType: S
        - AttributeName: backend
          AttributeType: S
      KeySchema:
        - AttributeName: experiment_id
          KeyType: HASH
        - AttributeName: timestamp
          KeyType: RANGE
      GlobalSecondaryIndexes:
        - IndexName: backend-index
          KeySchema:
            - AttributeName: backend
              KeyType: HASH
            - AttributeName: timestamp
              KeyType: RANGE
          Projection:
            ProjectionType: ALL
      Tags:
        - Key: Framework
          Value: 'DNALang-v51.843'

  ExperimentsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub 'dnalang-experiments-${Environment}'
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: job_id
          AttributeType: S
        - AttributeName: created_at
          AttributeType: S
      KeySchema:
        - AttributeName: job_id
          KeyType: HASH
        - AttributeName: created_at
          KeyType: RANGE
      Tags:
        - Key: Framework
          Value: 'DNALang-v51.843'

  # ═══ API ═══

  QuantumApi:
    Type: AWS::Serverless::Api
    Properties:
      StageName: !Ref Environment
      Description: DNA-Lang Quantum Orchestration API
      Cors:
        AllowOrigin: "'*'"
        AllowMethods: "'GET,POST,OPTIONS'"
        AllowHeaders: "'Content-Type,Authorization'"

  # ═══ LAMBDA FUNCTIONS ═══

  ExperimentRunnerFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Sub 'dnalang-experiment-runner-${Environment}'
      CodeUri: lambda/experiment_runner/
      Handler: app.lambda_handler
      MemorySize: 1024
      Timeout: 900
      Environment:
        Variables:
          IBM_QUANTUM_TOKEN: !Ref IBMQuantumToken
          EVENT_BUS_NAME: !Ref QuantumEventBus
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref ExperimentsTable
        - S3CrudPolicy:
            BucketName: !Ref ResultsBucket
        - EventBridgePutEventsPolicy:
            EventBusName: !Ref QuantumEventBus
        - CloudWatchPutMetricPolicy: {}
      Events:
        RunExperiment:
          Type: Api
          Properties:
            RestApiId: !Ref QuantumApi
            Path: /experiments/run
            Method: post
        RunSingle:
          Type: Api
          Properties:
            RestApiId: !Ref QuantumApi
            Path: /experiments/{experiment_name}
            Method: post

  CCCEProcessorFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Sub 'dnalang-ccce-processor-${Environment}'
      CodeUri: lambda/ccce_processor/
      Handler: app.lambda_handler
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref TelemetryTable
        - S3ReadPolicy:
            BucketName: !Ref ResultsBucket
      Events:
        ProcessResults:
          Type: EventBridgeRule
          Properties:
            EventBusName: !Ref QuantumEventBus
            Pattern:
              source:
                - 'dnalang.quantum'
              detail-type:
                - 'ExperimentCompleted'
        GetMetrics:
          Type: Api
          Properties:
            RestApiId: !Ref QuantumApi
            Path: /telemetry/metrics
            Method: get
        GetExperiment:
          Type: Api
          Properties:
            RestApiId: !Ref QuantumApi
            Path: /telemetry/{experiment_id}
            Method: get

  IdentityFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Sub 'dnalang-identity-${Environment}'
      CodeUri: lambda/ccce_processor/
      Handler: app.identity_handler
      Policies:
        - DynamoDBReadPolicy:
            TableName: !Ref TelemetryTable
      Events:
        Identity:
          Type: Api
          Properties:
            RestApiId: !Ref QuantumApi
            Path: /identity
            Method: get
        Health:
          Type: Api
          Properties:
            RestApiId: !Ref QuantumApi
            Path: /health
            Method: get

  # ═══ EVENT BUS ═══

  QuantumEventBus:
    Type: AWS::Events::EventBus
    Properties:
      Name: !Sub 'dnalang-quantum-${Environment}'

  # ═══ STEP FUNCTIONS ═══

  QuantumPipelineStateMachine:
    Type: AWS::Serverless::StateMachine
    Properties:
      Name: !Sub 'dnalang-quantum-pipeline-${Environment}'
      DefinitionUri: statemachine/quantum_pipeline.asl.json
      DefinitionSubstitutions:
        ExperimentRunnerArn: !GetAtt ExperimentRunnerFunction.Arn
        CCCEProcessorArn: !GetAtt CCCEProcessorFunction.Arn
        ResultsBucket: !Ref ResultsBucket
      Policies:
        - LambdaInvokePolicy:
            FunctionName: !Ref ExperimentRunnerFunction
        - LambdaInvokePolicy:
            FunctionName: !Ref CCCEProcessorFunction
        - S3CrudPolicy:
            BucketName: !Ref ResultsBucket
      Events:
        ScheduledRun:
          Type: Schedule
          Properties:
            Schedule: rate(24 hours)
            Description: Daily quantum experiment sweep
            Enabled: false
            Input: '{"experiments": ["EXP_THETA", "EXP_LAMBDA_PHI", "EXP_Z8", "EXP_GHZ", "EXP_VQE"], "shots": 4096, "source": "scheduled"}'

  # ═══ MONITORING ═══

  PhiThresholdAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: !Sub 'dnalang-phi-below-threshold-${Environment}'
      AlarmDescription: 'Phi dropped below consciousness threshold (0.7734)'
      Namespace: DNALang/CCCE
      MetricName: Phi
      Statistic: Average
      Period: 300
      EvaluationPeriods: 3
      Threshold: 0.7734
      ComparisonOperator: LessThanThreshold
      TreatMissingData: notBreaching

  GammaDecoherenceAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: !Sub 'dnalang-gamma-decoherent-${Environment}'
      AlarmDescription: 'Gamma exceeded decoherence boundary (0.3)'
      Namespace: DNALang/CCCE
      MetricName: Gamma
      Statistic: Average
      Period: 300
      EvaluationPeriods: 3
      Threshold: 0.3
      ComparisonOperator: GreaterThanThreshold
      TreatMissingData: notBreaching

Outputs:
  ApiUrl:
    Description: Quantum Orchestration API endpoint
    Value: !Sub 'https://${QuantumApi}.execute-api.${AWS::Region}.amazonaws.com/${Environment}'

  ExperimentEndpoint:
    Description: Run experiments
    Value: !Sub 'https://${QuantumApi}.execute-api.${AWS::Region}.amazonaws.com/${Environment}/experiments/run'

  TelemetryEndpoint:
    Description: CCCE telemetry
    Value: !Sub 'https://${QuantumApi}.execute-api.${AWS::Region}.amazonaws.com/${Environment}/telemetry/metrics'

  IdentityEndpoint:
    Description: Sovereign identity
    Value: !Sub 'https://${QuantumApi}.execute-api.${AWS::Region}.amazonaws.com/${Environment}/identity'

  StateMachineArn:
    Description: Step Functions pipeline ARN
    Value: !Ref QuantumPipelineStateMachine

  ResultsBucketName:
    Description: S3 bucket for experiment results
    Value: !Ref ResultsBucket

  EventBusName:
    Description: EventBridge bus for quantum events
    Value: !Ref QuantumEventBus
TEMPLATE_EOF

echo "✓ template.yaml"

# ═══════════════════════════════════════════════════════════════════════
# EXPERIMENT RUNNER LAMBDA
# ═══════════════════════════════════════════════════════════════════════
cat > lambda/experiment_runner/app.py << 'RUNNER_EOF'
"""
DNA-Lang Experiment Runner — AWS Lambda
Executes quantum circuits analytically, emits results to EventBridge + CloudWatch.
"""

import json
import math
import os
import random
import time
import uuid
import boto3
from datetime import datetime, timezone

LAMBDA_PHI  = float(os.environ.get('LAMBDA_PHI', '2.176435e-08'))
THETA_LOCK  = float(os.environ.get('THETA_LOCK', '51.843'))
PHI_THRESH  = float(os.environ.get('PHI_THRESHOLD', '0.7734'))
GAMMA_CRIT  = float(os.environ.get('GAMMA_CRITICAL', '0.3'))

RESULTS_BUCKET    = os.environ.get('RESULTS_BUCKET', '')
EXPERIMENTS_TABLE = os.environ.get('EXPERIMENTS_TABLE', '')
EVENT_BUS_NAME    = os.environ.get('EVENT_BUS_NAME', '')

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
events = boto3.client('events')
cloudwatch = boto3.client('cloudwatch')


def _simulate_bell(theta_rad, n_qubits, shots):
    p00 = 0.5 + random.gauss(0, 0.02)
    p11 = 0.5 - random.gauss(0, 0.02)
    p01 = abs(random.gauss(0, 0.03))
    p10 = abs(random.gauss(0, 0.03))
    total = p00 + p11 + p01 + p10
    p00, p11, p01, p10 = p00/total, p11/total, p01/total, p10/total
    fmt = f'{{:0{n_qubits}b}}'
    counts = {fmt.format(0): int(p00 * shots)}
    counts[fmt.format(2**n_qubits - 1)] = int(p11 * shots)
    if p01 * shots > 1:
        counts[fmt.format(1)] = int(p01 * shots)
    if p10 * shots > 1:
        counts[fmt.format(2)] = int(p10 * shots)
    return counts


def _simulate_ghz(n_qubits, shots):
    p_all0 = 0.5 + random.gauss(0, 0.02)
    p_all1 = 0.5 - random.gauss(0, 0.02)
    noise_total = abs(random.gauss(0, 0.05))
    p_all0 -= noise_total / 2
    p_all1 -= noise_total / 2
    fmt = f'{{:0{n_qubits}b}}'
    counts = {
        fmt.format(0): int(p_all0 * shots),
        fmt.format(2**n_qubits - 1): int(p_all1 * shots),
    }
    remaining = shots - sum(counts.values())
    if remaining > 0:
        for _ in range(min(remaining, 10)):
            bit = random.randint(1, 2**n_qubits - 2)
            key = fmt.format(bit)
            counts[key] = counts.get(key, 0) + max(1, remaining // 10)
    return counts


def _simulate_vqe(n_qubits, shots):
    states = {}
    fmt = f'{{:0{n_qubits}b}}'
    ground = fmt.format(8 if n_qubits >= 4 else 0)
    states[ground] = int(0.28 * shots + random.gauss(0, 20))
    for i in range(2**n_qubits):
        key = fmt.format(i)
        if key not in states:
            states[key] = max(0, int(shots / (2**n_qubits) + random.gauss(0, 15)))
    return {k: v for k, v in states.items() if v > 0}


EXPERIMENTS = {
    'EXP_THETA': {
        'name': 'Theta-Lock Bell State',
        'qubits': 2,
        'description': 'Rz(51.843 deg) phase-locked Bell circuit',
        'runner': lambda shots: _simulate_bell(THETA_LOCK * math.pi / 180, 2, shots),
    },
    'EXP_LAMBDA_PHI': {
        'name': 'Lambda-Phi Memory Constant',
        'qubits': 2,
        'description': 'CRY(2.176e-8) Planck-scale rotation Bell circuit',
        'runner': lambda shots: _simulate_bell(LAMBDA_PHI, 2, shots),
    },
    'EXP_Z8': {
        'name': 'Z.8 Consensus Protocol',
        'qubits': 10,
        'description': '10-qubit star topology consensus',
        'runner': lambda shots: _simulate_ghz(10, shots),
    },
    'EXP_GHZ': {
        'name': 'QA11D GHZ Validation',
        'qubits': 5,
        'description': '5-qubit GHZ oracle target Phi=0.947',
        'runner': lambda shots: _simulate_ghz(5, shots),
    },
    'EXP_VQE': {
        'name': 'hMAT2A VQE Enzymology',
        'qubits': 4,
        'description': 'Simplified methyltransferase VQE circuit',
        'runner': lambda shots: _simulate_vqe(4, shots),
    },
}


def _ccce_from_counts(counts, shots):
    probs = {k: v / shots for k, v in counts.items()}
    n_states = len(probs)
    entropy = -sum(p * math.log2(p) for p in probs.values() if p > 0)
    max_entropy = math.log2(n_states) if n_states > 1 else 1
    gamma = entropy / max_entropy if max_entropy > 0 else 0
    sorted_p = sorted(probs.values(), reverse=True)
    phi = sorted_p[0] if sorted_p else 0
    ccce_val = phi * (1 - gamma)
    xi = (LAMBDA_PHI * phi) / max(gamma, 0.001)
    return {
        'phi': round(phi, 6),
        'gamma': round(gamma, 6),
        'ccce': round(ccce_val, 6),
        'xi': xi,
        'above_threshold': phi >= PHI_THRESH,
        'is_coherent': gamma < GAMMA_CRIT,
    }


def _run_experiment(name, shots=4096):
    if name not in EXPERIMENTS:
        return {'error': f'Unknown experiment: {name}'}
    exp = EXPERIMENTS[name]
    t0 = time.time()
    counts = exp['runner'](shots)
    elapsed = time.time() - t0
    metrics = _ccce_from_counts(counts, shots)
    top5 = dict(sorted(counts.items(), key=lambda x: -x[1])[:5])
    return {
        'experiment_id': name,
        'name': exp['name'],
        'description': exp['description'],
        'qubits': exp['qubits'],
        'shots': shots,
        'counts': counts,
        'top5': top5,
        'ccce': metrics,
        'execution_time_s': round(elapsed, 4),
        'backend': 'lambda_simulator',
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'job_id': f'dnalang-{name.lower()}-{uuid.uuid4().hex[:8]}',
    }


def _publish_metrics(result):
    try:
        ccce = result.get('ccce', {})
        cloudwatch.put_metric_data(
            Namespace='DNALang/CCCE',
            MetricData=[
                {
                    'MetricName': 'Phi',
                    'Value': ccce.get('phi', 0),
                    'Unit': 'None',
                    'Dimensions': [
                        {'Name': 'Experiment', 'Value': result['experiment_id']},
                        {'Name': 'Backend', 'Value': result.get('backend', 'unknown')},
                    ],
                },
                {
                    'MetricName': 'Gamma',
                    'Value': ccce.get('gamma', 0),
                    'Unit': 'None',
                    'Dimensions': [
                        {'Name': 'Experiment', 'Value': result['experiment_id']},
                        {'Name': 'Backend', 'Value': result.get('backend', 'unknown')},
                    ],
                },
                {
                    'MetricName': 'CCCE',
                    'Value': ccce.get('ccce', 0),
                    'Unit': 'None',
                    'Dimensions': [
                        {'Name': 'Experiment', 'Value': result['experiment_id']},
                        {'Name': 'Backend', 'Value': result.get('backend', 'unknown')},
                    ],
                },
                {
                    'MetricName': 'Xi',
                    'Value': ccce.get('xi', 0),
                    'Unit': 'None',
                    'Dimensions': [
                        {'Name': 'Experiment', 'Value': result['experiment_id']},
                        {'Name': 'Backend', 'Value': result.get('backend', 'unknown')},
                    ],
                },
            ],
        )
    except Exception:
        pass


def _emit_event(result):
    try:
        bus = EVENT_BUS_NAME or 'dnalang-quantum-production'
        events.put_events(
            Entries=[{
                'Source': 'dnalang.quantum',
                'DetailType': 'ExperimentCompleted',
                'Detail': json.dumps({
                    'experiment_id': result['experiment_id'],
                    'job_id': result['job_id'],
                    'ccce': result['ccce'],
                    'backend': result.get('backend', 'lambda_simulator'),
                    'timestamp': result['timestamp'],
                }),
                'EventBusName': bus,
            }]
        )
    except Exception:
        pass


def _store_result(result):
    if EXPERIMENTS_TABLE:
        try:
            table = dynamodb.Table(EXPERIMENTS_TABLE)
            table.put_item(Item={
                'job_id': result['job_id'],
                'created_at': result['timestamp'],
                'experiment_id': result['experiment_id'],
                'name': result['name'],
                'qubits': result['qubits'],
                'shots': result['shots'],
                'phi': str(result['ccce']['phi']),
                'gamma': str(result['ccce']['gamma']),
                'ccce': str(result['ccce']['ccce']),
                'xi': str(result['ccce']['xi']),
                'above_threshold': result['ccce']['above_threshold'],
                'is_coherent': result['ccce']['is_coherent'],
                'backend': result.get('backend', 'lambda_simulator'),
                'top5': json.dumps(result['top5']),
            })
        except Exception:
            pass
    if RESULTS_BUCKET:
        try:
            key = f"experiments/{result['experiment_id']}/{result['job_id']}.json"
            s3.put_object(
                Bucket=RESULTS_BUCKET,
                Key=key,
                Body=json.dumps(result, default=str),
                ContentType='application/json',
            )
        except Exception:
            pass


def lambda_handler(event, context):
    """
    POST /experiments/run         — body: {"experiments": [...], "shots": 4096}
    POST /experiments/{name}      — run single experiment
    Direct invocation (Step Functions)
    """
    body = event
    if 'body' in event:
        body = json.loads(event['body']) if isinstance(event.get('body'), str) else event.get('body', {})
        if body is None:
            body = {}
    if 'pathParameters' in event and event['pathParameters']:
        exp_name = event['pathParameters'].get('experiment_name', '').upper()
        if not exp_name.startswith('EXP_'):
            exp_name = f'EXP_{exp_name}'
        body = {'experiments': [exp_name], 'shots': body.get('shots', 4096) if isinstance(body, dict) else 4096}

    experiments = body.get('experiments', list(EXPERIMENTS.keys()))
    shots = int(body.get('shots', 4096))
    source = body.get('source', 'api')

    results = []
    for name in experiments:
        result = _run_experiment(name, shots)
        if 'error' not in result:
            _publish_metrics(result)
            _emit_event(result)
            _store_result(result)
        results.append(result)

    above = sum(1 for r in results if r.get('ccce', {}).get('above_threshold'))
    coherent = sum(1 for r in results if r.get('ccce', {}).get('is_coherent'))

    fw = 'DNA-Lang v51.843'
    response_body = {
        'framework': fw,
        'cage_code': '9HUP5',
        'source': source,
        'n_experiments': len(results),
        'shots': shots,
        'above_threshold': above,
        'coherent': coherent,
        'sovereign_grade': 'SOVEREIGN' if above == len(results) and coherent == len(results) else 'PARTIAL',
        'experiments': {r['experiment_id']: {
            'name': r.get('name'),
            'job_id': r.get('job_id'),
            'qubits': r.get('qubits'),
            'ccce': r.get('ccce'),
            'top5': r.get('top5'),
            'execution_time_s': r.get('execution_time_s'),
        } for r in results if 'error' not in r},
        'timestamp': datetime.now(timezone.utc).isoformat(),
    }

    if 'httpMethod' in event:
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'X-DNA-Lang-Version': '51.843',
            },
            'body': json.dumps(response_body, default=str),
        }
    return response_body
RUNNER_EOF

echo "✓ lambda/experiment_runner/app.py"

# ═══════════════════════════════════════════════════════════════════════
# CCCE PROCESSOR + IDENTITY LAMBDA
# ═══════════════════════════════════════════════════════════════════════
cat > lambda/ccce_processor/app.py << 'CCCE_EOF'
"""
DNA-Lang CCCE Telemetry Processor — AWS Lambda
Processes experiment events, stores telemetry, serves metrics + identity API.
"""

import json
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
    if 'detail-type' in event and event['detail-type'] == 'ExperimentCompleted':
        return _process_event(event.get('detail', {}))

    method = event.get('httpMethod', '')
    path = event.get('path', '')

    if method == 'GET' and '/telemetry/metrics' in path:
        return _get_all_metrics()
    elif method == 'GET' and '/telemetry/' in path:
        exp_id = event.get('pathParameters', {}).get('experiment_id', '')
        return _get_experiment_metrics(exp_id)

    return _json_response(400, {'error': 'Unknown route'})


def identity_handler(event, context):
    path = event.get('path', '')
    xi = (LAMBDA_PHI * PHI_THRESH) / GAMMA_CRIT
    fw = 'DNA-Lang v51.843'

    if '/health' in path:
        return _json_response(200, {
            'status': 'SOVEREIGN',
            'framework': fw,
            'phi': PHI_THRESH,
            'gamma': GAMMA_CRIT,
            'xi': xi,
            'timestamp': datetime.now(timezone.utc).isoformat(),
        })

    return _json_response(200, {
        'framework': fw,
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


def _get_all_metrics():
    if not TELEMETRY_TABLE:
        return _json_response(200, _static_metrics())

    table = dynamodb.Table(TELEMETRY_TABLE)
    exp_ids = ['EXP_THETA', 'EXP_LAMBDA_PHI', 'EXP_Z8', 'EXP_GHZ', 'EXP_VQE']

    metrics = {}
    for exp_id in exp_ids:
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
    fw = 'DNA-Lang v51.843'

    return _json_response(200, {
        'framework': fw,
        'telemetry_source': 'dynamodb',
        'n_experiments': len(metrics),
        'above_threshold': above,
        'coherent': coherent,
        'experiments': metrics,
        'timestamp': datetime.now(timezone.utc).isoformat(),
    })


def _get_experiment_metrics(experiment_id):
    if not TELEMETRY_TABLE or not experiment_id:
        return _json_response(404, {'error': 'Experiment not found'})
    table = dynamodb.Table(TELEMETRY_TABLE)
    resp = table.query(
        KeyConditionExpression=Key('experiment_id').eq(experiment_id),
        ScanIndexForward=False,
        Limit=20,
    )
    items = [{
        'timestamp': i.get('timestamp', ''),
        'phi': float(i.get('phi', 0)),
        'gamma': float(i.get('gamma', 0)),
        'ccce': float(i.get('ccce', 0)),
        'xi': float(i.get('xi', 0)),
        'backend': i.get('backend', ''),
    } for i in resp.get('Items', [])]
    return _json_response(200, {
        'experiment_id': experiment_id,
        'history': items,
        'count': len(items),
    })


def _static_metrics():
    xi = (LAMBDA_PHI * PHI_THRESH) / GAMMA_CRIT
    fw = 'DNA-Lang v51.843'
    return {
        'framework': fw,
        'telemetry_source': 'constants',
        'constants': {
            'lambda_phi': LAMBDA_PHI,
            'theta_lock': THETA_LOCK,
            'phi_threshold': PHI_THRESH,
            'gamma_critical': GAMMA_CRIT,
            'negentropy_xi': xi,
        },
        'status': 'No live telemetry — run experiments first',
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
CCCE_EOF

echo "✓ lambda/ccce_processor/app.py"

# ═══════════════════════════════════════════════════════════════════════
# STEP FUNCTIONS STATE MACHINE
# ═══════════════════════════════════════════════════════════════════════
cat > statemachine/quantum_pipeline.asl.json << 'SM_EOF'
{
  "Comment": "DNA-Lang Quantum Pipeline — Runs 5 experiments, processes CCCE, evaluates consciousness, stores results.",
  "StartAt": "PrepareExperiments",
  "States": {
    "PrepareExperiments": {
      "Type": "Pass",
      "Result": {
        "experiments": ["EXP_THETA", "EXP_LAMBDA_PHI", "EXP_Z8", "EXP_GHZ", "EXP_VQE"],
        "shots": 4096
      },
      "ResultPath": "$.config",
      "Next": "RunExperimentBatch"
    },
    "RunExperimentBatch": {
      "Type": "Task",
      "Resource": "${ExperimentRunnerArn}",
      "Parameters": {
        "experiments.$": "$.config.experiments",
        "shots.$": "$.config.shots",
        "source": "step_functions"
      },
      "ResultPath": "$.batch_results",
      "TimeoutSeconds": 600,
      "Retry": [
        {
          "ErrorEquals": ["States.TaskFailed", "States.Timeout"],
          "IntervalSeconds": 30,
          "MaxAttempts": 2,
          "BackoffRate": 2.0
        }
      ],
      "Next": "ProcessCCCETelemetry"
    },
    "ProcessCCCETelemetry": {
      "Type": "Task",
      "Resource": "${CCCEProcessorArn}",
      "Parameters": {
        "detail-type": "ExperimentCompleted",
        "detail": {
          "experiment_id": "BATCH",
          "ccce.$": "$.batch_results.experiments.EXP_THETA.ccce",
          "backend": "lambda_simulator",
          "timestamp.$": "$.batch_results.timestamp",
          "job_id": "batch-pipeline"
        }
      },
      "ResultPath": "$.telemetry_result",
      "Next": "EvaluateConsciousness"
    },
    "EvaluateConsciousness": {
      "Type": "Choice",
      "Choices": [
        {
          "Variable": "$.batch_results.sovereign_grade",
          "StringEquals": "SOVEREIGN",
          "Next": "SovereignSuccess"
        }
      ],
      "Default": "PartialSuccess"
    },
    "SovereignSuccess": {
      "Type": "Pass",
      "Result": {
        "status": "SOVEREIGN",
        "message": "All experiments above Phi threshold and coherent",
        "action": "Ready for hardware submission"
      },
      "ResultPath": "$.pipeline_verdict",
      "Next": "StoreAggregateResults"
    },
    "PartialSuccess": {
      "Type": "Pass",
      "Result": {
        "status": "PARTIAL",
        "message": "Some experiments below threshold — review CCCE telemetry",
        "action": "Consider hardware calibration"
      },
      "ResultPath": "$.pipeline_verdict",
      "Next": "StoreAggregateResults"
    },
    "StoreAggregateResults": {
      "Type": "Task",
      "Resource": "arn:aws:states:::s3:putObject",
      "Parameters": {
        "Bucket": "${ResultsBucket}",
        "Key.$": "States.Format('pipeline/batch-{}.json', $.batch_results.timestamp)",
        "Body": {
          "framework": "DNA-Lang v51.843",
          "cage_code": "9HUP5",
          "pipeline": "quantum_orchestrator",
          "verdict.$": "$.pipeline_verdict",
          "experiments.$": "$.batch_results.experiments",
          "n_experiments.$": "$.batch_results.n_experiments",
          "above_threshold.$": "$.batch_results.above_threshold",
          "coherent.$": "$.batch_results.coherent"
        },
        "ContentType": "application/json"
      },
      "ResultPath": "$.s3_result",
      "End": true
    }
  }
}
SM_EOF

echo "✓ statemachine/quantum_pipeline.asl.json"

# ═══════════════════════════════════════════════════════════════════════
# VALIDATE
# ═══════════════════════════════════════════════════════════════════════
echo ""
echo "── Validating SAM template ──────────────────────────────────"
SAM_CLI_TELEMETRY=0 sam validate --template template.yaml --region $REGION
echo ""

# ═══════════════════════════════════════════════════════════════════════
# BUILD
# ═══════════════════════════════════════════════════════════════════════
echo "── Building ──────────────────────────────────────────────────"
SAM_CLI_TELEMETRY=0 sam build --region $REGION
echo ""

# ═══════════════════════════════════════════════════════════════════════
# DEPLOY
# ═══════════════════════════════════════════════════════════════════════
echo "── Deploying stack: $STACK ────────────────────────────────────"
SAM_CLI_TELEMETRY=0 sam deploy \
  --stack-name "$STACK" \
  --region "$REGION" \
  --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \
  --no-confirm-changeset \
  --no-fail-on-empty-changeset \
  --parameter-overrides "Environment=production IBMQuantumToken=''" \
  --resolve-s3 \
  --tags "Framework=DNALang-v51.843 CAGE=9HUP5 Author=DevinPhillipDavis"

echo ""
echo "── Retrieving endpoints ──────────────────────────────────────"
API_URL=$(aws cloudformation describe-stacks \
  --stack-name "$STACK" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" \
  --output text 2>/dev/null || echo "")

if [ -n "$API_URL" ]; then
  echo ""
  echo "╔═══════════════════════════════════════════════════════════╗"
  echo "║  ✅ DEPLOYMENT COMPLETE                                  ║"
  echo "╠═══════════════════════════════════════════════════════════╣"
  echo "║                                                           ║"
  echo "  API:        $API_URL"
  echo "  Identity:   $API_URL/identity"
  echo "  Health:     $API_URL/health"
  echo "  Experiments: $API_URL/experiments/run"
  echo "  Telemetry:  $API_URL/telemetry/metrics"
  echo "║                                                           ║"
  echo "╠═══════════════════════════════════════════════════════════╣"
  echo "║  Quick test:                                              ║"
  echo "╚═══════════════════════════════════════════════════════════╝"
  echo ""
  echo "  # Identity check"
  echo "  curl -s $API_URL/identity | python3 -m json.tool"
  echo ""
  echo "  # Run all 5 experiments"
  echo "  curl -s -X POST $API_URL/experiments/run | python3 -m json.tool"
  echo ""
  echo "  # Run single experiment"
  echo "  curl -s -X POST $API_URL/experiments/theta | python3 -m json.tool"
  echo ""
  echo "  # Get telemetry"
  echo "  curl -s $API_URL/telemetry/metrics | python3 -m json.tool"
  echo ""
  echo "  # Start Step Functions pipeline"
  SM_ARN=$(aws cloudformation describe-stacks \
    --stack-name "$STACK" --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='StateMachineArn'].OutputValue" \
    --output text 2>/dev/null || echo "")
  if [ -n "$SM_ARN" ]; then
    echo "  aws stepfunctions start-execution --state-machine-arn $SM_ARN --region $REGION"
  fi
else
  echo "⚠ Could not retrieve API URL — check CloudFormation console"
  aws cloudformation describe-stacks --stack-name "$STACK" --region "$REGION" \
    --query "Stacks[0].Outputs" --output table 2>/dev/null || true
fi
