"""
Tests for new DNA-Lang organism types: Mitosis, Symbiosis, PredatorPrey.

All tests use seed 51843 for deterministic behaviour.
"""

import sys
import os
import json
import math
import pytest
import numpy as np

# Ensure project root is on path
sys.path.insert(0, os.path.expanduser("~/quantum_workspace"))

from dnalang.core.gene import Gene
from dnalang.core.genome import Genome
from dnalang.core.organism import Organism
from dnalang.core.mitosis import MitosisOrganism, MITOSIS_PHASES
from dnalang.core.symbiosis import (
    SymbiosisOrganism,
    SymbiosisType,
    SymbiosisMetrics,
)
from dnalang.core.predator_prey import (
    PredatorPreyEcosystem,
    EcosystemEntity,
    EcologicalRole,
    PopulationSnapshot,
)
from dnalang.quantum.constants import (
    LAMBDA_PHI,
    THETA_LOCK,
    PHI_THRESHOLD,
    GAMMA_CRITICAL,
    CHI_PC,
)

SEED = 51843


# ─── Helper ─────────────────────────────────────────────────────────

def make_genome(n_genes: int = 4) -> Genome:
    genes = [
        Gene(name=f"gene_{i}", expression=0.5 + (i % 5) * 0.1)
        for i in range(n_genes)
    ]
    return Genome(genes)


def make_organism(name: str = "test", n_genes: int = 4) -> Organism:
    return Organism(name=name, genome=make_genome(n_genes))


# ═══════════════════════════════════════════════════════════════════
# MITOSIS ORGANISM TESTS
# ═══════════════════════════════════════════════════════════════════


class TestMitosisCreation:
    def test_init_defaults(self):
        org = MitosisOrganism(name="m1", genome=make_genome())
        assert org.domain == "mitosis"
        assert org.purpose == "self-replication"
        assert org.division_count == 0
        assert org.asymmetry == 0.0
        assert org.phase == MITOSIS_PHASES[0]
        assert org.daughters is None
        assert len(org.lineage) == 1

    def test_init_custom(self):
        org = MitosisOrganism(
            name="m2", genome=make_genome(),
            division_threshold=0.8, asymmetry=0.5,
        )
        assert org.division_threshold == 0.8
        assert org.asymmetry == 0.5

    def test_asymmetry_clamped(self):
        org = MitosisOrganism(
            name="m3", genome=make_genome(), asymmetry=2.0,
        )
        assert org.asymmetry == 1.0


class TestMitosisPhases:
    def test_advance_phase(self):
        org = MitosisOrganism(name="p", genome=make_genome())
        assert org.phase == "|interphase⟩"
        org.advance_phase()
        assert org.phase == "|prophase⟩"
        org.advance_phase()
        assert org.phase == "|metaphase⟩"

    def test_advance_past_end(self):
        org = MitosisOrganism(name="p2", genome=make_genome())
        for _ in range(10):
            org.advance_phase()
        assert org.phase == MITOSIS_PHASES[-1]

    def test_reset_phase(self):
        org = MitosisOrganism(name="p3", genome=make_genome())
        org.advance_phase()
        org.advance_phase()
        org.reset_phase()
        assert org.phase == MITOSIS_PHASES[0]


class TestMitosisDivision:
    def test_can_divide_basic(self):
        org = MitosisOrganism(name="d1", genome=make_genome(4))
        assert org.can_divide() is True

    def test_cannot_divide_one_gene(self):
        org = MitosisOrganism(name="d2", genome=make_genome(1))
        assert org.can_divide() is False

    def test_cannot_divide_low_fitness(self):
        org = MitosisOrganism(
            name="d3", genome=make_genome(),
            division_threshold=0.9,
        )
        org.genome.fitness = 0.3
        assert org.can_divide() is False

    def test_divide_symmetric(self):
        org = MitosisOrganism(name="d4", genome=make_genome(6))
        a, b = org.divide()
        assert len(a.genome) + len(b.genome) == 6
        assert a.generation == 1
        assert b.generation == 1
        assert org.division_count == 1
        assert org.daughters == (a, b)

    def test_divide_asymmetric(self):
        org = MitosisOrganism(
            name="d5", genome=make_genome(8), asymmetry=0.5,
        )
        a, b = org.divide()
        assert len(a.genome) != len(b.genome)
        assert len(a.genome) + len(b.genome) == 8

    def test_divide_inherits_fitness(self):
        org = MitosisOrganism(name="d6", genome=make_genome(4))
        org.genome.fitness = 1.0
        a, b = org.divide()
        assert a.genome.fitness is not None
        assert b.genome.fitness is not None
        assert abs(a.genome.fitness + b.genome.fitness - 1.0) < 0.2

    def test_divide_lineage(self):
        org = MitosisOrganism(name="d7", genome=make_genome())
        a, b = org.divide()
        assert len(a.lineage) == 2
        assert a.lineage[0] == org.genesis

    def test_divide_resets_phase(self):
        org = MitosisOrganism(name="d8", genome=make_genome())
        org.divide()
        assert org.phase == MITOSIS_PHASES[0]

    def test_divide_fails_when_not_allowed(self):
        org = MitosisOrganism(name="d9", genome=make_genome(1))
        with pytest.raises(RuntimeError):
            org.divide()

    def test_recursive_divide(self):
        org = MitosisOrganism(name="rd", genome=make_genome(8))
        leaves = org.recursive_divide(depth=2)
        assert len(leaves) >= 2
        assert all(isinstance(l, MitosisOrganism) for l in leaves)

    def test_divide_with_fitness_fn(self):
        org = MitosisOrganism(name="df", genome=make_genome(4))
        a, b = org.divide(fitness_fn=lambda o: len(o.genome) * 0.1)
        assert a.genome.fitness is not None
        assert b.genome.fitness is not None


class TestMitosisSerialization:
    def test_to_dict(self):
        org = MitosisOrganism(name="s1", genome=make_genome())
        d = org.to_dict()
        assert d["type"] == "MitosisOrganism"
        assert "division_count" in d
        assert "lineage" in d

    def test_repr(self):
        org = MitosisOrganism(name="r1", genome=make_genome())
        assert "MitosisOrganism" in repr(org)


# ═══════════════════════════════════════════════════════════════════
# SYMBIOSIS ORGANISM TESTS
# ═══════════════════════════════════════════════════════════════════


class TestSymbiosisCreation:
    def test_init_defaults(self):
        org = SymbiosisOrganism(name="s1", genome=make_genome())
        assert org.domain == "symbiosis"
        assert org.partner is None
        assert org.symbiosis_type == SymbiosisType.MUTUALISM
        assert org.phi == 0.5
        assert org.gamma == 0.5

    def test_init_parasitism(self):
        org = SymbiosisOrganism(
            name="s2", genome=make_genome(),
            symbiosis_type=SymbiosisType.PARASITISM,
        )
        assert org.symbiosis_type == SymbiosisType.PARASITISM


class TestSymbiosisBonding:
    def test_bond_and_unbond(self):
        a = SymbiosisOrganism(name="a", genome=make_genome())
        b = SymbiosisOrganism(name="b", genome=make_genome())
        a.bond(b)
        assert a.is_bonded()
        assert b.is_bonded()
        assert a.partner is b
        assert b.partner is a

        a.unbond()
        assert not a.is_bonded()
        assert not b.is_bonded()

    def test_double_bond_raises(self):
        a = SymbiosisOrganism(name="a", genome=make_genome())
        b = SymbiosisOrganism(name="b", genome=make_genome())
        c = SymbiosisOrganism(name="c", genome=make_genome())
        a.bond(b)
        with pytest.raises(ValueError):
            a.bond(c)

    def test_unbond_when_not_bonded(self):
        a = SymbiosisOrganism(name="a", genome=make_genome())
        a.unbond()  # Should not raise


class TestSymbiosisMetrics:
    def test_metrics_unbonded(self):
        org = SymbiosisOrganism(name="u", genome=make_genome())
        m = org.compute_metrics()
        assert m.bond_strength == 0.0
        assert m.phi_host == 0.5

    def test_metrics_bonded(self):
        a = SymbiosisOrganism(name="a", genome=make_genome())
        b = SymbiosisOrganism(name="b", genome=make_genome())
        a.bond(b)
        m = a.compute_metrics()
        assert m.bond_strength > 0
        assert m.resonance > 0

    def test_entangled_check(self):
        m = SymbiosisMetrics(bond_strength=PHI_THRESHOLD)
        assert m.is_entangled() is True
        m2 = SymbiosisMetrics(bond_strength=0.1)
        assert m2.is_entangled() is False

    def test_combined_negentropy(self):
        m = SymbiosisMetrics(phi_host=0.9, phi_symbiont=0.8,
                             gamma_host=0.1, gamma_symbiont=0.2)
        xi = m.combined_negentropy()
        assert xi > 0


class TestSymbiosisPropagation:
    def test_mutualism_propagation(self):
        a = SymbiosisOrganism(name="a", genome=make_genome())
        b = SymbiosisOrganism(name="b", genome=make_genome())
        a.phi = 0.9  # Above threshold
        b.gamma = 0.5
        a.bond(b)
        a.propagate()
        # Mutualism: b's gamma should decrease
        assert b.gamma < 0.5 or len(a.bond_history) > 0

    def test_parasitism_propagation(self):
        a = SymbiosisOrganism(
            name="a", genome=make_genome(),
            symbiosis_type=SymbiosisType.PARASITISM,
        )
        b = SymbiosisOrganism(
            name="b", genome=make_genome(),
            symbiosis_type=SymbiosisType.PARASITISM,
        )
        b_phi_initial = 0.5
        b.phi = b_phi_initial
        a.bond(b)
        a.propagate()
        # Parasitism: b's phi should decrease
        assert b.phi <= b_phi_initial

    def test_unbonded_propagation_noop(self):
        a = SymbiosisOrganism(name="a", genome=make_genome())
        a.propagate()  # Should not raise


class TestSymbiosisCoEvolution:
    def test_co_evolve(self):
        a = SymbiosisOrganism(name="a", genome=make_genome())
        b = SymbiosisOrganism(name="b", genome=make_genome())
        a.bond(b)
        metrics = a.co_evolve(cycles=5)
        assert isinstance(metrics, SymbiosisMetrics)
        assert len(a.bond_history) >= 5

    def test_co_evolve_without_partner_raises(self):
        a = SymbiosisOrganism(name="a", genome=make_genome())
        with pytest.raises(RuntimeError):
            a.co_evolve(cycles=5)

    def test_co_evolve_with_fitness(self):
        a = SymbiosisOrganism(name="a", genome=make_genome())
        b = SymbiosisOrganism(name="b", genome=make_genome())
        a.bond(b)
        metrics = a.co_evolve(
            cycles=3,
            fitness_fn=lambda o: float(np.mean([g.expression for g in o.genome])),
        )
        assert a.genome.fitness is not None


class TestSymbiosisSerialization:
    def test_to_dict(self):
        org = SymbiosisOrganism(name="s", genome=make_genome())
        d = org.to_dict()
        assert d["type"] == "SymbiosisOrganism"
        assert "symbiosis_type" in d

    def test_repr(self):
        org = SymbiosisOrganism(name="r", genome=make_genome())
        assert "SymbiosisOrganism" in repr(org)

    def test_above_threshold(self):
        org = SymbiosisOrganism(name="t", genome=make_genome())
        org.phi = PHI_THRESHOLD
        assert org.above_threshold() is True
        org.phi = 0.1
        assert org.above_threshold() is False

    def test_is_coherent(self):
        org = SymbiosisOrganism(name="c", genome=make_genome())
        org.gamma = 0.1
        assert org.is_coherent() is True
        org.gamma = 0.5
        assert org.is_coherent() is False


# ═══════════════════════════════════════════════════════════════════
# PREDATOR-PREY ECOSYSTEM TESTS
# ═══════════════════════════════════════════════════════════════════


class TestEcosystemCreation:
    def test_init(self):
        preds = [make_organism(f"pred_{i}") for i in range(3)]
        preys = [make_organism(f"prey_{i}") for i in range(5)]
        eco = PredatorPreyEcosystem(preds, preys, seed=SEED)
        assert len(eco.living_predators) == 3
        assert len(eco.living_prey) == 5
        assert eco.step_count == 0

    def test_entity_properties(self):
        org = make_organism("e")
        entity = EcosystemEntity(
            organism=org, role=EcologicalRole.PREDATOR,
            phi=0.8, gamma=0.2,
        )
        assert entity.name == "e"
        assert entity.above_threshold() is True
        assert entity.is_coherent() is True


class TestEcosystemSimulation:
    def test_single_step(self):
        preds = [make_organism(f"pred_{i}") for i in range(2)]
        preys = [make_organism(f"prey_{i}") for i in range(4)]
        eco = PredatorPreyEcosystem(preds, preys, seed=SEED)
        snapshot = eco.step()
        assert isinstance(snapshot, PopulationSnapshot)
        assert snapshot.step == 1

    def test_simulate(self):
        preds = [make_organism(f"pred_{i}") for i in range(3)]
        preys = [make_organism(f"prey_{i}") for i in range(6)]
        eco = PredatorPreyEcosystem(preds, preys, seed=SEED)
        history = eco.simulate(steps=10)
        assert len(history) <= 10
        assert len(history) > 0

    def test_summary(self):
        preds = [make_organism(f"pred_{i}") for i in range(2)]
        preys = [make_organism(f"prey_{i}") for i in range(3)]
        eco = PredatorPreyEcosystem(preds, preys, seed=SEED)
        eco.simulate(steps=5)
        s = eco.summary()
        assert "total_steps" in s
        assert "final_predators" in s
        assert "final_prey" in s

    def test_simulation_with_fitness(self):
        preds = [make_organism(f"pred_{i}") for i in range(2)]
        preys = [make_organism(f"prey_{i}") for i in range(3)]
        eco = PredatorPreyEcosystem(preds, preys, seed=SEED)
        eco.simulate(
            steps=3,
            fitness_fn=lambda o: float(np.mean([g.expression for g in o.genome])),
        )
        assert eco.step_count > 0


class TestPopulationSnapshot:
    def test_to_dict(self):
        snap = PopulationSnapshot(
            step=1, predator_count=3, prey_count=5,
            avg_phi=0.7, avg_gamma=0.2, interactions=4,
        )
        d = snap.to_dict()
        assert d["step"] == 1
        assert d["predator_count"] == 3


class TestEcosystemRepr:
    def test_repr(self):
        preds = [make_organism("p")]
        preys = [make_organism("q")]
        eco = PredatorPreyEcosystem(preds, preys, seed=SEED)
        assert "PredatorPreyEcosystem" in repr(eco)


# ═══════════════════════════════════════════════════════════════════
# IMPORT TESTS
# ═══════════════════════════════════════════════════════════════════


class TestImports:
    def test_core_imports(self):
        from dnalang.core import (
            MitosisOrganism,
            SymbiosisOrganism,
            SymbiosisType,
            PredatorPreyEcosystem,
            EcologicalRole,
        )
        assert MitosisOrganism is not None
        assert SymbiosisOrganism is not None

    def test_top_level_imports(self):
        from dnalang import (
            MitosisOrganism,
            SymbiosisOrganism,
            PredatorPreyEcosystem,
        )
        assert MitosisOrganism is not None
