#!/usr/bin/env python3
"""
QuEra Swarm Simulation Integration

Runs a multi-node dry simulation using QuEraCorrelatedAdapter and the
NCLMSwarmOrchestrator to validate end-to-end decoding behavior and collect
simple CRSM metrics across nodes.
"""

import argparse
import json
import time
import logging
import math

from quera_correlated_adapter import QuEraCorrelatedAdapter
from nclm_swarm_orchestrator import NCLMSwarmOrchestrator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("quera_swarm_sim")


def simulate(n_nodes=7, atoms=256, rounds=3, beam_width=64, pqlimit=500000, cycles=10, seed=42, per_noise=0.02, forbidden_mode='at_most_two', out_path='/tmp/quera_swarm_sim.json'):
    # Instantiate orchestrator and per-node adapters
    orch = NCLMSwarmOrchestrator(n_nodes=n_nodes, atoms=atoms, rounds=rounds, beam_width=beam_width, pqlimit=pqlimit, seed=seed)
    adapters = [QuEraCorrelatedAdapter(atoms=atoms, rounds=rounds, seed=(seed + i if seed is not None else None), pqlimit=pqlimit, beam_width=beam_width, forbidden_mode=forbidden_mode) for i in range(n_nodes)]

    history = []
    for cycle in range(int(cycles)):
        logger.info(f"Starting cycle {cycle}")
        cycle_record = {'cycle': cycle, 'nodes': []}
        for idx, (node_id, node) in enumerate(list(orch.nodes.items())):
            adapter = adapters[idx % len(adapters)]
            try:
                S_rounds, logical_errors, S_true = adapter.generate_round_syndromes(per_detector_noise=per_noise)
                merged = adapter.correlated_merge_rounds(S_rounds)
                decode_result = adapter.decode_merged(merged, beam=beam_width, pqlimit=pqlimit)
            except Exception:
                logger.exception('Adapter/decoder failed for node %s', node_id)
                S_rounds, logical_errors, S_true, merged, decode_result = [], set(), set(), set(), {'correction': None, 'nodes_explored': 0, 'best_cost': None}

            # Normalize best_cost
            if isinstance(decode_result.get('best_cost', None), float) and math.isinf(decode_result['best_cost']):
                decode_result['best_cost'] = None

            success = bool(decode_result.get('correction'))

            # Simple CRSM metric updates
            if success:
                node.phi = min(1.0, node.phi + 0.05)
                node.gamma = max(0.0, node.gamma - 0.02)
                node.ccce = min(1.0, node.ccce + 0.02)
                node.fitness += 1.0
            else:
                node.phi = max(0.0, node.phi - 0.03)
                node.gamma = min(1.0, node.gamma + 0.02)
                node.ccce = max(0.0, node.ccce - 0.01)
                node.fitness = max(0.0, node.fitness - 0.2)

            ascended = False
            try:
                ascended = node.crsm.ascend()
            except Exception:
                # Non-critical if ascend fails
                pass

            cycle_record['nodes'].append({
                'node_id': node_id,
                'phi': node.phi,
                'gamma': node.gamma,
                'ccce': node.ccce,
                'fitness': node.fitness,
                'success': success,
                'decode_result': decode_result,
                'logical_errors': sorted(list(logical_errors)) if logical_errors else [],
                'merged': sorted(list(merged)) if merged else [],
                'ascended': ascended
            })

        history.append(cycle_record)

    result = {
        'config': {
            'n_nodes': n_nodes,
            'atoms': atoms,
            'rounds': rounds,
            'beam_width': beam_width,
            'pqlimit': pqlimit,
            'cycles': cycles,
            'seed': seed,
            'per_detector_noise': per_noise,
        },
        'final_nodes': {nid: {'phi': n.phi, 'gamma': n.gamma, 'ccce': n.ccce, 'fitness': n.fitness} for nid, n in orch.nodes.items()},
        'history': history,
        'timestamp': time.time()
    }

    try:
        with open(out_path, 'w') as fh:
            json.dump(result, fh, indent=2)
        logger.info('Wrote simulation output to %s', out_path)
    except Exception:
        logger.exception('Failed to write output file')

    return result


if __name__ == '__main__':
    p = argparse.ArgumentParser(description='Run QuEra swarm simulation')
    p.add_argument('--nodes', type=int, default=7)
    p.add_argument('--atoms', type=int, default=256)
    p.add_argument('--rounds', type=int, default=3)
    p.add_argument('--beam', type=int, default=64)
    p.add_argument('--pqlimit', type=int, default=500000)
    p.add_argument('--cycles', type=int, default=10)
    p.add_argument('--seed', type=int, default=42)
    p.add_argument('--noise', type=float, default=0.02)
    p.add_argument('--out', default='/tmp/quera_swarm_sim.json')
    p.add_argument('--forbidden-mode', default='at_most_two', choices=['at_most_two','precedence'])
    args = p.parse_args()

    simulate(n_nodes=args.nodes, atoms=args.atoms, rounds=args.rounds, beam_width=args.beam, pqlimit=args.pqlimit, cycles=args.cycles, seed=args.seed, per_noise=args.noise, forbidden_mode=args.forbidden_mode, out_path=args.out)
