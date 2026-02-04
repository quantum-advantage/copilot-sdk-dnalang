#!/usr/bin/env bash
set -euo pipefail

# publish_to_zenodo.sh
# Usage: export ZENODO_TOKEN="<your token>"; bash publish_to_zenodo.sh

if [ -z "${ZENODO_TOKEN:-}" ]; then
  echo "Error: Set ZENODO_TOKEN environment variable to your Zenodo access token (production) and rerun."
  exit 1
fi
TOKEN="$ZENODO_TOKEN"

cat > /tmp/zenodo_metadata.json <<'JSON'
{"metadata": {"title": "PROTOCOL TITAN: Hardware-Anchored Quantum Organism Survival on IBM Heron", "upload_type": "publication", "publication_date": "2026-02-04", "description": "PROTOCOL TITAN: six-day stress-test of DNA-Lang v52.x executed on IBM Heron and Fez backends. Includes Abstract+Introduction and Visual Abstract for submission and reproducibility materials.", "creators": [{"name": "Davis, Devin P.", "affiliation": "Agile Defense Systems LLC (CAGE: 9HUP5)"}], "keywords": ["DNA-Lang","PROTOCOL TITAN","quantum","IBM Heron","reproducibility","titan"], "license": "apache-2.0", "access_right": "open"}}
JSON

echo "Creating deposition..."
RESP=$(curl -s -H "Content-Type: application/json" -X POST "https://zenodo.org/api/deposit/depositions?access_token=${TOKEN}" -d @/tmp/zenodo_metadata.json)
DEPID=$(python3 - <<'PY'
import sys,json
obj=json.load(sys.stdin)
print(obj.get('id',''))
PY
<<<"$RESP")

if [ -z "$DEPID" ]; then
  echo "Failed to create deposition; response:";
  echo "$RESP";
  exit 1;
fi

echo "Deposition id: $DEPID"

echo "Uploading files..."
curl -s --fail -X POST "https://zenodo.org/api/deposit/depositions/${DEPID}/files?access_token=${TOKEN}" -F "file=@/home/devinpd/osiris_cockpit/PROTOCOL_TITAN_Abstract_Introduction.md" -F "file=@/home/devinpd/osiris_cockpit/PROTOCOL_TITAN_Visual_Abstract.md"

# Optionally upload evidence bundle if present
if [ -f /home/devinpd/osiris_cockpit/evidence_bundle_titan_v52.tar.gz ]; then
  echo "Uploading evidence bundle..."
  curl -s --fail -X POST "https://zenodo.org/api/deposit/depositions/${DEPID}/files?access_token=${TOKEN}" -F "file=@/home/devinpd/osiris_cockpit/evidence_bundle_titan_v52.tar.gz"
fi

echo "Publishing deposition..."
PUBLISH_RESP=$(curl -s -X POST "https://zenodo.org/api/deposit/depositions/${DEPID}/actions/publish?access_token=${TOKEN}")
echo "$PUBLISH_RESP"

DOI=$(python3 - <<'PY'
import sys,json
obj=json.load(sys.stdin)
print(obj.get('doi',''))
PY
<<<"$PUBLISH_RESP")

if [ -n "$DOI" ]; then
  echo "Published DOI: $DOI"
  echo "Record URL: https://doi.org/$DOI"
else
  echo "Publish may have failed; inspect response above."
fi
