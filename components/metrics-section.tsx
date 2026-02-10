"use client";

import { useEffect, useState } from "react";

interface MetricGaugeProps {
  label: string;
  symbol: string;
  value: number;
  description: string;
}

function MetricGauge({ label, symbol, value, description }: MetricGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(eased * value);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [value]);

  const percentage = animatedValue * 100;

  return (
    <div className="flex flex-col items-center rounded-lg border border-border bg-card p-6">
      <div className="relative mb-4 h-28 w-28">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.64} ${264 - percentage * 2.64}`}
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-2xl font-bold text-foreground">
            {animatedValue.toFixed(2)}
          </span>
          <span className="font-mono text-xs text-primary">{symbol}</span>
        </div>
      </div>
      <h3 className="text-sm font-semibold text-foreground">{label}</h3>
      <p className="mt-1 text-center text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

const metrics = [
  {
    label: "Coherence",
    symbol: "\u039B",
    value: 0.85,
    description: "Quantum state coherence measure across entangled qubits",
  },
  {
    label: "Consciousness",
    symbol: "\u03A6",
    value: 0.72,
    description: "Integrated information metric for collapse awareness",
  },
  {
    label: "Decoherence",
    symbol: "\u0393",
    value: 0.15,
    description: "Environmental noise coupling rate (lower is better)",
  },
  {
    label: "Negentropy",
    symbol: "\u039E",
    value: 0.41,
    description:
      "Information ordering ratio: \u039B\u03A6/\u0393 normalized",
  },
];

export function MetricsSection() {
  return (
    <section className="border-t border-border px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 font-mono text-sm text-primary">
            {"// ccce_metrics"}
          </p>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Consciousness Collapse Coherence Evolution
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            Real-time tracking of quantum consciousness metrics across four
            fundamental dimensions. Validated against 515K+ measurement shots
            on IBM Quantum hardware.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <MetricGauge key={m.symbol} {...m} />
          ))}
        </div>

        <div className="mt-12 rounded-lg border border-border bg-card p-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" />
            <span className="font-mono text-xs text-muted-foreground">
              physical_constants.py
            </span>
          </div>
          <pre className="overflow-x-auto font-mono text-sm leading-relaxed text-foreground">
            <code>
              {`# Lambda-Phi Conservation Constants
LAMBDA_PHI = 2.176435e-08  # s^-1
THETA_LOCK = 51.843        # degrees (quantum phase lock)
CHI        = 0.1           # s^-1 (consciousness-coherence coupling)
KAPPA      = 0.05          # spatial decoherence coupling
F_MAX      = 0.9787        # maximum fidelity achieved
SHOTS      = 515_000       # total measurement shots processed`}
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}
