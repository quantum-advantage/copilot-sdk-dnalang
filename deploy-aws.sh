#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
#  DNA::}{::lang v51.843 — AWS CloudShell Deployment
#  Agile Defense Systems  |  CAGE 9HUP5
#
#  Run this in AWS CloudShell:
#    git clone https://github.com/quantum-advantage/copilot-sdk-dnalang.git
#    cd copilot-sdk-dnalang && bash deploy-aws.sh
#
#  Creates: S3 buckets, DynamoDB table, ECR repo, Lambda function,
#           Braket integration, and uploads all artifacts.
# ═══════════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>/dev/null || echo "unknown")
REGION="${AWS_DEFAULT_REGION:-us-east-2}"
PROJECT="agile-defense-quantum"
FRAMEWORK="dnalang-v51843"

# S3 buckets
RESULTS_BUCKET="${PROJECT}-results-${ACCOUNT_ID}"
ARCHIVE_BUCKET="${PROJECT}-archive-${ACCOUNT_ID}"

# DynamoDB
LEDGER_TABLE="${PROJECT}-experiment-ledger"

# ECR
ECR_REPO="${PROJECT}/osiris"

# Lambda
LAMBDA_NAME="${PROJECT}-analysis"
LAMBDA_ROLE="${PROJECT}-lambda-role"

# ── Colors ────────────────────────────────────────────────────────────
R='\033[0m' G='\033[32m' Y='\033[33m' C='\033[36m' D='\033[2m' B='\033[1m'

info()  { echo -e "  ${G}✓${R} $*"; }
warn()  { echo -e "  ${Y}⚠${R} $*"; }
step()  { echo -e "\n${C}━━━ $* ━━━${R}"; }
fail()  { echo -e "  ${Y}✗${R} $*"; }

# ── Banner ────────────────────────────────────────────────────────────
echo -e "${C}"
cat << 'BANNER'
  ╔══════════════════════════════════════════════════════════════╗
  ║  DNA::}{::lang v51.843  —  AWS Sovereign Deployment        ║
  ║  Agile Defense Systems  |  CAGE 9HUP5                      ║
  ╚══════════════════════════════════════════════════════════════╝
BANNER
echo -e "${R}"
echo -e "  Account:  ${B}${ACCOUNT_ID}${R}"
echo -e "  Region:   ${B}${REGION}${R}"
echo -e "  Project:  ${B}${PROJECT}${R}"
echo ""

# ── Verify AWS credentials ───────────────────────────────────────────
step "1/7  Verifying AWS credentials"
if [ "$ACCOUNT_ID" = "unknown" ]; then
    fail "AWS credentials not configured. Run: aws configure"
    exit 1
fi
IDENTITY=$(aws sts get-caller-identity --output json 2>/dev/null)
ARN=$(echo "$IDENTITY" | python3 -c "import sys,json; print(json.load(sys.stdin)['Arn'])" 2>/dev/null || echo "unknown")
info "Authenticated as: ${ARN}"

# ── S3 Buckets ────────────────────────────────────────────────────────
step "2/7  Creating S3 buckets"

create_bucket() {
    local bucket="$1"
    local purpose="$2"
    if aws s3api head-bucket --bucket "$bucket" 2>/dev/null; then
        info "Bucket exists: ${bucket} (${purpose})"
    else
        if [ "$REGION" = "us-east-1" ]; then
            aws s3api create-bucket --bucket "$bucket" --region "$REGION" >/dev/null
        else
            aws s3api create-bucket --bucket "$bucket" --region "$REGION" \
                --create-bucket-configuration LocationConstraint="$REGION" >/dev/null
        fi
        # Enable versioning
        aws s3api put-bucket-versioning --bucket "$bucket" \
            --versioning-configuration Status=Enabled 2>/dev/null || true
        # Enable encryption
        aws s3api put-bucket-encryption --bucket "$bucket" \
            --server-side-encryption-configuration \
            '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}' 2>/dev/null || true
        # Block public access
        aws s3api put-public-access-block --bucket "$bucket" \
            --public-access-block-configuration \
            "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" 2>/dev/null || true
        info "Created bucket: ${bucket} (${purpose})"
    fi
}

create_bucket "$RESULTS_BUCKET" "experiment results"
create_bucket "$ARCHIVE_BUCKET" "long-term archive"

# Lifecycle rule: archive to Glacier after 90 days
aws s3api put-bucket-lifecycle-configuration --bucket "$ARCHIVE_BUCKET" \
    --lifecycle-configuration '{
        "Rules": [{
            "ID": "GlacierArchive",
            "Status": "Enabled",
            "Filter": {"Prefix": ""},
            "Transitions": [{"Days": 90, "StorageClass": "GLACIER"}]
        }]
    }' 2>/dev/null && info "Glacier lifecycle set on archive bucket" || true

# ── DynamoDB Table ────────────────────────────────────────────────────
step "3/7  Creating DynamoDB experiment ledger"

if aws dynamodb describe-table --table-name "$LEDGER_TABLE" --region "$REGION" >/dev/null 2>&1; then
    info "Table exists: ${LEDGER_TABLE}"
else
    aws dynamodb create-table \
        --table-name "$LEDGER_TABLE" \
        --attribute-definitions \
            AttributeName=experiment_id,AttributeType=S \
            AttributeName=timestamp,AttributeType=S \
        --key-schema \
            AttributeName=experiment_id,KeyType=HASH \
            AttributeName=timestamp,KeyType=RANGE \
        --billing-mode PAY_PER_REQUEST \
        --region "$REGION" >/dev/null 2>&1
    info "Created table: ${LEDGER_TABLE}"
    # Wait for table to become active
    aws dynamodb wait table-exists --table-name "$LEDGER_TABLE" --region "$REGION" 2>/dev/null
    info "Table active"
fi

# ── ECR Repository ────────────────────────────────────────────────────
step "4/7  Creating ECR repository"

if aws ecr describe-repositories --repository-names "$ECR_REPO" --region "$REGION" >/dev/null 2>&1; then
    info "ECR repo exists: ${ECR_REPO}"
else
    aws ecr create-repository \
        --repository-name "$ECR_REPO" \
        --image-scanning-configuration scanOnPush=true \
        --region "$REGION" >/dev/null 2>&1
    info "Created ECR repo: ${ECR_REPO}"
fi

# ── Lambda Function ───────────────────────────────────────────────────
step "5/7  Creating Lambda analysis function"

# IAM role for Lambda
ROLE_ARN=""
if aws iam get-role --role-name "$LAMBDA_ROLE" >/dev/null 2>&1; then
    ROLE_ARN=$(aws iam get-role --role-name "$LAMBDA_ROLE" --query 'Role.Arn' --output text)
    info "IAM role exists: ${LAMBDA_ROLE}"
else
    TRUST_POLICY='{
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Principal": {"Service": "lambda.amazonaws.com"},
            "Action": "sts:AssumeRole"
        }]
    }'
    ROLE_ARN=$(aws iam create-role \
        --role-name "$LAMBDA_ROLE" \
        --assume-role-policy-document "$TRUST_POLICY" \
        --query 'Role.Arn' --output text 2>/dev/null)
    # Attach policies
    aws iam attach-role-policy --role-name "$LAMBDA_ROLE" \
        --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole" 2>/dev/null || true
    # Custom policy for S3 + DynamoDB
    INLINE_POLICY="{
        \"Version\": \"2012-10-17\",
        \"Statement\": [
            {
                \"Effect\": \"Allow\",
                \"Action\": [\"s3:GetObject\", \"s3:PutObject\", \"s3:ListBucket\"],
                \"Resource\": [
                    \"arn:aws:s3:::${RESULTS_BUCKET}\",
                    \"arn:aws:s3:::${RESULTS_BUCKET}/*\",
                    \"arn:aws:s3:::${ARCHIVE_BUCKET}\",
                    \"arn:aws:s3:::${ARCHIVE_BUCKET}/*\"
                ]
            },
            {
                \"Effect\": \"Allow\",
                \"Action\": [\"dynamodb:PutItem\", \"dynamodb:Query\", \"dynamodb:Scan\"],
                \"Resource\": \"arn:aws:dynamodb:${REGION}:${ACCOUNT_ID}:table/${LEDGER_TABLE}\"
            },
            {
                \"Effect\": \"Allow\",
                \"Action\": [\"braket:*\"],
                \"Resource\": \"*\"
            }
        ]
    }"
    aws iam put-role-policy --role-name "$LAMBDA_ROLE" \
        --policy-name "${PROJECT}-access" \
        --policy-document "$INLINE_POLICY" 2>/dev/null || true
    info "Created IAM role: ${LAMBDA_ROLE}"
    # Wait for role propagation
    sleep 10
fi

# Create Lambda function (indexes JSON uploads from S3)
LAMBDA_CODE='
import json
import boto3
import os
from decimal import Decimal

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ.get("LEDGER_TABLE", "agile-defense-quantum-experiment-ledger"))
s3 = boto3.client("s3")

PHI_THRESHOLD = 0.7734
GAMMA_CRITICAL = 0.3

def handler(event, context):
    for record in event.get("Records", []):
        bucket = record["s3"]["bucket"]["name"]
        key = record["s3"]["object"]["key"]
        if not key.endswith(".json"):
            continue
        obj = s3.get_object(Bucket=bucket, Key=key)
        data = json.loads(obj["Body"].read(), parse_float=Decimal)
        phi = float(data.get("phi", data.get("Phi", 0)))
        gamma = float(data.get("gamma", data.get("Gamma", 1)))
        xi = (2.176435e-8 * phi) / max(gamma, 0.001) if gamma else 0
        table.put_item(Item={
            "experiment_id": key.replace("/", "_").replace(".json", ""),
            "timestamp": record["eventTime"],
            "s3_key": key,
            "phi": Decimal(str(round(phi, 6))),
            "gamma": Decimal(str(round(gamma, 6))),
            "xi": Decimal(str(round(xi, 6))),
            "above_threshold": phi >= PHI_THRESHOLD,
            "is_coherent": gamma < GAMMA_CRITICAL,
            "framework": "dnalang-v51843",
            "cage_code": "9HUP5",
        })
    return {"statusCode": 200, "body": json.dumps({"indexed": len(event.get("Records", []))})}
'

if aws lambda get-function --function-name "$LAMBDA_NAME" --region "$REGION" >/dev/null 2>&1; then
    info "Lambda exists: ${LAMBDA_NAME}"
else
    # Package Lambda
    LAMBDA_DIR=$(mktemp -d)
    echo "$LAMBDA_CODE" > "${LAMBDA_DIR}/lambda_function.py"
    (cd "$LAMBDA_DIR" && zip -q function.zip lambda_function.py)

    if [ -n "$ROLE_ARN" ]; then
        aws lambda create-function \
            --function-name "$LAMBDA_NAME" \
            --runtime python3.11 \
            --handler lambda_function.handler \
            --role "$ROLE_ARN" \
            --zip-file "fileb://${LAMBDA_DIR}/function.zip" \
            --timeout 30 \
            --memory-size 256 \
            --environment "Variables={LEDGER_TABLE=${LEDGER_TABLE}}" \
            --region "$REGION" >/dev/null 2>&1 && \
            info "Created Lambda: ${LAMBDA_NAME}" || \
            warn "Lambda creation failed (role may need propagation time)"

        # S3 trigger: auto-index JSON uploads
        LAMBDA_ARN="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${LAMBDA_NAME}"
        aws lambda add-permission \
            --function-name "$LAMBDA_NAME" \
            --statement-id s3-trigger \
            --action lambda:InvokeFunction \
            --principal s3.amazonaws.com \
            --source-arn "arn:aws:s3:::${RESULTS_BUCKET}" \
            --region "$REGION" >/dev/null 2>&1 || true

        aws s3api put-bucket-notification-configuration --bucket "$RESULTS_BUCKET" \
            --notification-configuration "{
                \"LambdaFunctionConfigurations\": [{
                    \"LambdaFunctionArn\": \"${LAMBDA_ARN}\",
                    \"Events\": [\"s3:ObjectCreated:*\"],
                    \"Filter\": {\"Key\": {\"FilterRules\": [{\"Name\": \"suffix\", \"Value\": \".json\"}]}}
                }]
            }" 2>/dev/null && info "S3→Lambda trigger configured" || warn "S3 trigger config deferred"
    else
        warn "Skipping Lambda creation (no role ARN)"
    fi
    rm -rf "$LAMBDA_DIR"
fi

# ── Upload Artifacts ──────────────────────────────────────────────────
step "6/7  Uploading artifacts to S3"

SDK_ROOT="$(cd "$(dirname "$0")" && pwd)"

# Upload SDK Python package
if [ -d "${SDK_ROOT}/dnalang" ]; then
    TMPTAR=$(mktemp)
    tar czf "$TMPTAR" \
        --exclude='__pycache__' --exclude='*.pyc' --exclude='.pytest_cache' \
        --exclude='*.egg-info' --exclude='node_modules' --exclude='.git' \
        -C "$SDK_ROOT" dnalang/ 2>/dev/null
    aws s3 cp "$TMPTAR" "s3://${RESULTS_BUCKET}/sdk/dnalang-sdk-latest.tar.gz" --sse AES256 --quiet
    rm "$TMPTAR"
    info "Uploaded SDK package"
fi

# Upload Braket examples
for example in braket_live_demo.py braket_phi_threshold.py braket_qpu_deploy.py; do
    if [ -f "${SDK_ROOT}/dnalang/examples/${example}" ]; then
        aws s3 cp "${SDK_ROOT}/dnalang/examples/${example}" \
            "s3://${RESULTS_BUCKET}/braket-examples/${example}" --sse AES256 --quiet
        info "Uploaded ${example}"
    fi
done

# Upload Braket adapter
if [ -f "${SDK_ROOT}/dnalang/src/dnalang_sdk/adapters/braket_adapter.py" ]; then
    aws s3 cp "${SDK_ROOT}/dnalang/src/dnalang_sdk/adapters/braket_adapter.py" \
        "s3://${RESULTS_BUCKET}/sdk/braket_adapter.py" --sse AES256 --quiet
    info "Uploaded Braket adapter"
fi

# Upload any experiment results from home dir (when running on dev machine)
for f in \
    chi_pc_bell_entanglement_results.json \
    dna_circuit_comparison.json \
    resolution_results.json \
    world_record_results.json \
    world_record_results_hardware.json \
    theta_lock_fine_scan_results.json \
    sovereign_deploy_v3_results.json; do
    if [ -f "${HOME}/${f}" ]; then
        aws s3 cp "${HOME}/${f}" "s3://${RESULTS_BUCKET}/experiments/${f}" --sse AES256 --quiet
        info "Uploaded ${f}"
    fi
done

# ── Braket Integration Test ──────────────────────────────────────────
step "7/7  Verifying Braket access"

# Check if Braket SDK is available
if python3 -c "import amazon.braket" 2>/dev/null; then
    info "amazon-braket-sdk available"
    # List available devices
    DEVICES=$(python3 -c "
import boto3, json
client = boto3.client('braket', region_name='us-east-1')
try:
    resp = client.search_devices(filters=[{'name': 'deviceType', 'values': ['QPU']}])
    for d in resp.get('devices', []):
        print(f'  {d[\"deviceName\"]:20s} {d[\"deviceArn\"]}')
except Exception as e:
    print(f'  (Braket device query: {e})')
" 2>/dev/null)
    if [ -n "$DEVICES" ]; then
        info "Braket QPU devices:"
        echo "$DEVICES"
    fi
else
    warn "amazon-braket-sdk not installed. Install with: pip install amazon-braket-sdk"
    info "You can still use the Braket adapter in dry-run mode"
fi

# ── Summary ───────────────────────────────────────────────────────────
echo ""
echo -e "${C}═══════════════════════════════════════════════════════════════${R}"
echo -e "${B}  Deployment Complete — DNA::}{::lang v51.843${R}"
echo -e "${C}═══════════════════════════════════════════════════════════════${R}"
echo ""
echo -e "  ${B}Infrastructure:${R}"
echo -e "    S3 Results:   ${G}${RESULTS_BUCKET}${R}"
echo -e "    S3 Archive:   ${G}${ARCHIVE_BUCKET}${R}"
echo -e "    DynamoDB:     ${G}${LEDGER_TABLE}${R}"
echo -e "    ECR:          ${G}${ECR_REPO}${R}"
echo -e "    Lambda:       ${G}${LAMBDA_NAME}${R}"
echo ""
echo -e "  ${B}Braket Quick Start:${R}"
echo -e "    pip install amazon-braket-sdk boto3"
echo -e "    python3 dnalang/examples/braket_live_demo.py          ${D}# local sim${R}"
echo -e "    python3 dnalang/examples/braket_qpu_deploy.py --cost  ${D}# cost estimate${R}"
echo -e "    python3 dnalang/examples/braket_phi_threshold.py      ${D}# Φ circuits${R}"
echo ""
echo -e "  ${B}Upload Results:${R}"
echo -e "    aws s3 cp results.json s3://${RESULTS_BUCKET}/experiments/ --sse AES256"
echo -e "    ${D}# Auto-indexed by Lambda → DynamoDB ledger${R}"
echo ""
echo -e "  ${B}Query Ledger:${R}"
echo -e "    aws dynamodb scan --table-name ${LEDGER_TABLE} \\"
echo -e "      --filter-expression 'above_threshold = :t' \\"
echo -e "      --expression-attribute-values '{\":t\":{\"BOOL\":true}}'"
echo ""
echo -e "  ${D}Framework: DNA::}{::lang v51.843 | CAGE 9HUP5 | Agile Defense Systems${R}"
echo ""
