#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# DNA::}{::lang — AWS Deployment Script
# Agile Defense Systems | CAGE 9HUP5
#
# Deploys the quantum orchestration platform to AWS using SAM.
# Requirements: aws-cli, aws-sam-cli, configured AWS credentials
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

STACK_NAME="${STACK_NAME:-dnalang-quantum-platform}"
REGION="${AWS_DEFAULT_REGION:-us-east-2}"
ENVIRONMENT="${ENVIRONMENT:-production}"
IBM_TOKEN="${IBM_QUANTUM_TOKEN:-}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "═══════════════════════════════════════════════════════════"
echo "  DNA::}{::lang  AWS Deployment"
echo "  Stack:  $STACK_NAME"
echo "  Region: $REGION"
echo "  Env:    $ENVIRONMENT"
echo "═══════════════════════════════════════════════════════════"

# Pre-flight checks
command -v aws >/dev/null 2>&1 || { echo "❌ aws-cli not found. Install: pip install awscli"; exit 1; }
command -v sam >/dev/null 2>&1 || { echo "❌ sam-cli not found. Install: pip install aws-sam-cli"; exit 1; }

echo ""
echo "⚡ Validating template..."
sam validate --template template.yaml --region "$REGION"

echo ""
echo "⚡ Building Lambda functions..."
sam build --template template.yaml --use-container 2>/dev/null || sam build --template template.yaml

echo ""
echo "⚡ Deploying to AWS..."
sam deploy \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    "Environment=$ENVIRONMENT" \
    "IBMQuantumToken=$IBM_TOKEN" \
  --no-confirm-changeset \
  --no-fail-on-empty-changeset \
  --resolve-s3

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  ✓ Deployment complete"
echo "═══════════════════════════════════════════════════════════"

# Show outputs
echo ""
echo "⚡ Stack outputs:"
aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
  --output table 2>/dev/null || echo "(query outputs manually with: aws cloudformation describe-stacks --stack-name $STACK_NAME)"

echo ""
echo "Quick test:"
API_URL=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text 2>/dev/null || echo "")

if [ -n "$API_URL" ]; then
  echo "  curl $API_URL/identity"
  echo "  curl $API_URL/health"
  echo "  curl -X POST $API_URL/experiments/run"
  echo "  curl $API_URL/telemetry/metrics"
else
  echo "  (retrieve API URL from stack outputs above)"
fi

echo ""
echo "∮ Sovereignty deployed ∮"
