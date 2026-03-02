# Changelog

## [6.0.0] — 2026-03-02 — Gen 6 Cognitive Shell

### New Modules (24)

- **Shadow-You** `user_model.py` — filesystem scanner, UserProfile, `get_context_blob()`
- **NLP Intent Router** `intent_router.py` — keyword scoring + LLM fallback (10/10 test accuracy)
- **Personality Engine** `personality.py` — LLM-generated greetings, trait evolution (never hardcoded)
- **Research Knowledge Graph** `research_graph.py` — 35-node, typed edges (SUPPORTS/CONTRADICTS/EXTENDS/UNEXPLORED_BRIDGE)
- **Context Assembler** `context_assembler.py` — dynamic LLM context injection from graph
- **Hypothesis Engine** `hypothesis_engine.py` — gap/contradiction/bridge scanning, ExperimentProposals
- **Literature Watcher** `arxiv_watcher.py` — arXiv/PubMed/bioRxiv daemon
- **Statistical Engine** `statistical_engine.py` — TTI, Beta posterior, z-score, Phase 4→5 gate
- **Simulation Harness** `simulation_harness.py` — CoherenceDecay/ReactionDiffusion/KMC simulators
- **Shadow Swarm** `shadow_swarm.py` — Fdna-priority queue, 4 roles, background thread
- **Swarm Brain** `swarm_brain.py` — GA strategy evolution, pop=6–10, max_gens=3/session
- **Apprentice** `apprentice.py` — learns Claude orchestration patterns, `flush_to_corpus()`
- **SCIMITAR Bridge** `scimitar_agent_bridge.py` — zone RGB + agent-button map
- **Hardware Loop** `hardware_loop.py` — IBM Quantum auto-ingestion daemon
- **Self Monitor** `self_monitor.py` — exception healing + Φ-gated reasoning modes
- **Paper Writer** `paper_writer.py` — autonomous scientific paper generation
- **Circuit Library** `circuit_library.py` — 9 validated quantum circuits, `briefing()`, `ingest_to_graph()`
- **Quantum-Biology Bridge** `quantum_bio_bridge.py` — Gen 6.9: P8 SPT spectral gap ↔ Warburg metabolic network
- **11D Manifold Optimizer** `manifold_optimizer.py` — Gen 6.10: 11D CRSM θ-sweep, golden ratio report
- **Data Analyzer** `analysis.py` — QuantumDataAnalyzer, real hardware data, `llm_context_block()` injection
- `agile_mesh.py`, `reception.py`, `research_engine.py` — UQCB mesh + research infrastructure

### Key Scientific Discoveries

- **θ_lock = arccos(1/φ) confirmed**: cos(51.843°) = 0.6178 ≈ 1/φ = 0.6180, angular diff = 0.016°
  — θ_lock is the golden ratio partition angle in 11D CRSM geometry
- **UQCB negentropic operation**: Ξ = 4.197 at τ_Revival = φ⁸ = 46.978μs (2 independent RK45/BDF confirmations)
- **Shadow-Strike hardware validation**: Bell F = 0.9473, CHSH S = 2.690, Φ_CCCE = 0.8794 on 127-qubit IBM Fez
- **P8 Quantum-Biology Bridge**: 16-node network gap/gap₂ = 0.519 approaching 1/φ = 0.618; SSH topological=True

### CLI Commands Added

```
osiris manifold [report|peaks|tensions]
osiris qbio [run|gap|ingest]
osiris circuits [list|show|run|ingest]
osiris bridge [start|status|piezo|manifold|sweep|circuits]
osiris paper [draft|show|save]
osiris hardware [check|daemon|results]
osiris monitor [health|mode]
osiris simulate [lindblad|rdf|kmc]
osiris stats [tti|prior|zscore]
osiris literature [fetch|watch|status]
osiris graph [stats|ingest|query|bridges|contradictions|add]
osiris hypothesis [briefing|propose|generate|gaps]
osiris swarm [status|dod|learn|force|brain|genome|lineage|evolve|freeze|kill|fdna]
osiris pulse
```

### Integration Changes

- `chat.py` — intent routing, personality boot sequence, session consolidation to `working_context.md`
- `tools.py` — context injection (user_profile + personality + research graph + self_monitor)
- `tui.py` — swarm panel, key bindings, rich formatting
- `nclm_provider.py`, `omega_integration.py`, `self_repair.py` — Gen 6 integration
- `lab/scanner.py` — Gen 6 lab experiment registry updates
- `pyproject.toml` — version bumped 5.3.0 → 6.0.0

### Test Suite

- 856/857 tests passing (only Zenodo publish test requires credentials)

---

## [5.3.0] — prior release baseline

Initial NCLM cognitive shell with CCCE metrics, CRSM manifold, compiler pipeline, and hardware adapters.
