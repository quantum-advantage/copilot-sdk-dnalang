#!/usr/bin/env python3
"""
QuEra Correlated Decoder Adapter

Integrates the Tesseract A* decoder (from tesseract_resonator.py) into a simple
correlated-decoder wrapper and runs a 256-atom dry-run. This is a minimal, dependency-free
adapter for dry-run and PR purposes.
"""

import argparse
import json
import random
import time

# Import the lightweight Tesseract decoder implemented in this repo
from tesseract_resonator import TesseractDecoderOrganism, TesseractResonatorOrganism


class QuEraCorrelatedAdapter:
    def __init__(self, atoms=256, rounds=3, beam_width=20, pqlimit=100000, forbidden_mode='at_most_two', seed=None):
        self.atoms = int(atoms)
        self.rounds = int(rounds)
        self.seed = seed
        if seed is not None:
            random.seed(seed)
        self.error_map = self.build_error_map()
        self.decoder = TesseractDecoderOrganism(
            detectors=list(range(self.atoms)),
            error_map=self.error_map,
            beam_width=beam_width,
            pqlimit=pqlimit,
            forbidden_mode=forbidden_mode,
        )

    def build_error_map(self):
        """Construct a simple local error_map for N detectors.
        Each error touches two neighboring detectors (ring topology).
        """
        N = self.atoms
        emap = {}
        for i in range(N):
            emap[i] = {i, (i + 1) % N}
        return emap

    def inject_logical_errors(self, k=3):
        k = min(self.atoms, max(1, int(k)))
        return set(random.sample(range(self.atoms), k))

    def generate_round_syndromes(self, logical_errors=None, per_detector_noise=0.02):
        """Generate `rounds` noisy syndrome rounds from an underlying logical error set.
        Returns: (rounds_list, logical_errors, S_true)
        """
        if logical_errors is None:
            logical_errors = self.inject_logical_errors(k=max(1, self.atoms // 128))
        S_true = self.decoder.D(logical_errors)
        rounds = []
        for r in range(self.rounds):
            S = set(S_true)
            # flip each detector with small probability to simulate measurement noise
            for d in range(self.atoms):
                if random.random() < per_detector_noise:
                    if d in S:
                        S.remove(d)
                    else:
                        S.add(d)
            rounds.append(S)
        return rounds, logical_errors, S_true

    def correlated_merge_rounds(self, S_rounds, threshold=None):
        """Simple majority-vote merge across rounds to produce a single merged syndrome."""
        R = len(S_rounds)
        if R == 0:
            return set()
        counts = [0] * self.atoms
        for S in S_rounds:
            for d in S:
                counts[d] += 1
        if threshold is None:
            threshold = (R // 2) + 1
        merged = {i for i, c in enumerate(counts) if c >= threshold}
        return merged

    def decode_merged(self, merged_syndrome, beam=None, pqlimit=None):
        return self.decoder.decode(merged_syndrome, beam=beam, pqlimit=pqlimit)


def main():
    parser = argparse.ArgumentParser(description='QuEra correlated decoder adapter dry-run')
    parser.add_argument('--atoms', type=int, default=256)
    parser.add_argument('--rounds', type=int, default=3)
    parser.add_argument('--seed', type=int, default=42)
    parser.add_argument('--out', default='quera_256_dryrun.json')
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()

    adapter = QuEraCorrelatedAdapter(atoms=args.atoms, rounds=args.rounds, seed=args.seed)
    S_rounds, logical_errors, S_true = adapter.generate_round_syndromes(per_detector_noise=0.02)
    merged = adapter.correlated_merge_rounds(S_rounds)

    # decode with moderate resource limits for a dry-run
    decode_result = adapter.decode_merged(merged, beam=20, pqlimit=100000)

    out = {
        'atoms': args.atoms,
        'rounds': args.rounds,
        'seed': args.seed,
        'logical_errors': sorted(list(logical_errors)),
        'S_true': sorted(list(S_true)),
        'S_rounds': [sorted(list(s)) for s in S_rounds],
        'merged': sorted(list(merged)),
        'decoder_result': decode_result,
        'timestamp': time.time(),
    }

    with open(args.out, 'w') as fh:
        json.dump(out, fh, indent=2)

    print(f"Wrote dry-run output to {args.out}")
    print('Decoder summary:', json.dumps(decode_result))


if __name__ == '__main__':
    main()
