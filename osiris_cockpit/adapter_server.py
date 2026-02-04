#!/usr/bin/env python3
"""Lightweight HTTP API for the QuEraCorrelatedAdapter.

Endpoints:
- GET  /health  -> {status: 'ok', uptime: <seconds>}
- POST /run     -> accepts JSON {atoms, rounds, seed, beam, pqlimit, per_detector_noise}
                  returns a JSON result with merged syndrome and decoder_result

This file intentionally uses only the Python standard library so it has no extra deps.
"""

import json
import logging
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

# flexible import of adapter (works when run as module or as script)
try:
    from osiris_cockpit.quera_correlated_adapter import QuEraCorrelatedAdapter
except Exception:
    try:
        from .quera_correlated_adapter import QuEraCorrelatedAdapter
    except Exception:
        import os, sys
        pkg_dir = os.path.dirname(os.path.abspath(__file__))
        repo_root = os.path.abspath(os.path.join(pkg_dir, '..'))
        if repo_root not in sys.path:
            sys.path.insert(0, repo_root)
        from osiris_cockpit.quera_correlated_adapter import QuEraCorrelatedAdapter

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
START_TS = time.time()


def normalize(o):
    """Recursively convert common non-JSON types (sets, tuples) to JSON-serializable forms."""
    if isinstance(o, (str, int, float, bool)) or o is None:
        return o
    if isinstance(o, (list, tuple)):
        return [normalize(i) for i in o]
    if isinstance(o, set):
        return sorted([normalize(i) for i in o])
    if isinstance(o, dict):
        return {str(k): normalize(v) for k, v in o.items()}
    try:
        # try to JSON-serialize directly
        json.dumps(o)
        return o
    except Exception:
        return str(o)


class AdapterHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def _send_json(self, code, data):
        body = json.dumps(data).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path.startswith('/health'):
            uptime = time.time() - START_TS
            self._send_json(200, {"status": "ok", "uptime": uptime})
        else:
            self._send_json(404, {"error": "not_found"})

    def do_POST(self):
        if self.path.startswith('/run'):
            length = int(self.headers.get('Content-Length', 0) or 0)
            raw = self.rfile.read(length) if length else b''
            try:
                payload = json.loads(raw.decode('utf-8')) if raw else {}
            except Exception:
                self._send_json(400, {"error": "invalid_json"})
                return

            atoms = payload.get('atoms')
            rounds = payload.get('rounds')
            seed = payload.get('seed')
            beam = payload.get('beam')
            pqlimit = payload.get('pqlimit')
            per_detector_noise = payload.get('per_detector_noise', 0.02)

            try:
                adapter = QuEraCorrelatedAdapter(atoms=atoms or 256, rounds=rounds or 3, seed=seed, pqlimit=pqlimit or 500000)
                S_rounds, logical_errors, S_true = adapter.generate_round_syndromes(per_detector_noise=per_detector_noise)
                merged = adapter.correlated_merge_rounds(S_rounds)
                try:
                    decode_result = adapter.decode_merged(merged, beam=beam or 64, pqlimit=pqlimit or 500000)
                except Exception as e:
                    logger.exception("Decoder failed during run")
                    decode_result = {"error": "decoder_failed", "details": str(e)}

                resp = {
                    "atoms": adapter.atoms,
                    "rounds": adapter.rounds,
                    "logical_errors": normalize(logical_errors),
                    "S_true": normalize(S_true),
                    "S_rounds": normalize(S_rounds),
                    "merged": normalize(merged),
                    "decoder_result": normalize(decode_result),
                    "timestamp": time.time(),
                }
                self._send_json(200, resp)
            except Exception as e:
                logger.exception("Run failed")
                self._send_json(500, {"error": "run_failed", "details": str(e)})
        else:
            self._send_json(404, {"error": "not_found"})


def run_server(port=8080, host='0.0.0.0'):
    server = ThreadingHTTPServer((host, port), AdapterHandler)
    logger.info(f"Starting QuEra adapter API on {host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        logger.info("Shutting down server")
        server.shutdown()


if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8080)
    parser.add_argument('--host', default='0.0.0.0')
    args = parser.parse_args()
    run_server(args.port, args.host)
