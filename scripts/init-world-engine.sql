-- Initialize World Engine database schema

-- World States table (11D manifold snapshots)
CREATE TABLE IF NOT EXISTS world_states (
  id SERIAL PRIMARY KEY,
  world_line VARCHAR(255) NOT NULL,
  phi DECIMAL(10, 8) NOT NULL,
  lambda DECIMAL(10, 8) NOT NULL,
  gamma DECIMAL(10, 8) NOT NULL,
  xi DECIMAL(10, 4),
  tau INTEGER NOT NULL DEFAULT 1,
  checkpoint VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- World Checkpoints table (E-checkpoints for collapsed states)
CREATE TABLE IF NOT EXISTS world_checkpoints (
  id SERIAL PRIMARY KEY,
  observer_agent VARCHAR(100) NOT NULL,
  world_line VARCHAR(255) NOT NULL,
  checkpoint_hash VARCHAR(64) NOT NULL,
  phi_level DECIMAL(10, 8),
  lambda_level DECIMAL(10, 8),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Evolution History table (Quantum Darwinism results)
CREATE TABLE IF NOT EXISTS evolution_history (
  id SERIAL PRIMARY KEY,
  generation INTEGER NOT NULL,
  parent_world_line VARCHAR(255),
  selected_world_line VARCHAR(255) NOT NULL,
  fitness_score DECIMAL(10, 4),
  phi DECIMAL(10, 8),
  lambda DECIMAL(10, 8),
  gamma DECIMAL(10, 8),
  selection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Manifold Bindings table (Ω-bind operations)
CREATE TABLE IF NOT EXISTS manifold_bindings (
  id SERIAL PRIMARY KEY,
  source_manifold VARCHAR(255) NOT NULL,
  target_manifold VARCHAR(255) NOT NULL,
  binding_strength DECIMAL(10, 8),
  phase_conjugate_angle DECIMAL(10, 4),
  coherence_lock BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_world_states_world_line ON world_states(world_line);
CREATE INDEX IF NOT EXISTS idx_world_states_created_at ON world_states(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_world_checkpoints_checkpoint_hash ON world_checkpoints(checkpoint_hash);
CREATE INDEX IF NOT EXISTS idx_evolution_history_generation ON evolution_history(generation);

-- Insert genesis state (Ψ₀)
INSERT INTO world_states (
  world_line,
  phi,
  lambda,
  gamma,
  xi,
  tau,
  checkpoint,
  metadata
) VALUES (
  'genesis',
  0.73,
  0.85,
  0.092,
  6.75,
  1,
  'Ψ₀',
  '{"dimensions": 11, "topology": "spherically-embedded-tetrahedral", "resonance_angle": 51.843}'::jsonb
) ON CONFLICT DO NOTHING;
