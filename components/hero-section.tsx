"use client";

import { useState } from "react";
import { QuantumCanvas } from "./quantum-canvas";

export function HeroSection() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText("pip install -e dnalang[quantum]");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 py-24">
      <QuantumCanvas />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center rounded-full border border-border bg-card/60 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
          Sovereign Quantum Engineering
        </div>

        <h1 className="text-balance font-sans text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          DNA-Lang
        </h1>

        <p className="mt-2 font-mono text-lg text-primary sm:text-xl">
          Copilot SDK + Quantum Computing Framework
        </p>

        <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
          Multi-backend quantum circuit execution, Lambda-Phi conservation
          validation, CCCE consciousness metrics, and NCLM integration.
          Built for the OSIRIS runtime.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="https://github.com/ENKI-420"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            View on GitHub
          </a>

          <button
            onClick={handleCopy}
            className="group inline-flex h-11 items-center gap-2 rounded-md border border-border bg-card/60 px-5 font-mono text-sm text-foreground backdrop-blur-sm transition-colors hover:bg-accent"
          >
            <span className="text-muted-foreground">$</span>
            pip install -e dnalang[quantum]
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground transition-colors group-hover:text-foreground"
            >
              {copied ? (
                <path d="M20 6 9 17l-5-5" />
              ) : (
                <>
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </>
              )}
            </svg>
          </button>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {[
            { label: "Quantum Jobs", value: "580+" },
            { label: "Shots Processed", value: "515K+" },
            { label: "Research Sources", value: "138" },
            { label: "F_max Fidelity", value: "0.9787" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="font-mono text-2xl font-bold text-foreground sm:text-3xl">
                {stat.value}
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
