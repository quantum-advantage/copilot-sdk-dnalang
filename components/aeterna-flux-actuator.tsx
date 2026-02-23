"use client"

import { useState, useEffect } from "react"
import { Activity, ShieldAlert, Layers, Lock, Zap } from "lucide-react"

/**
 * AETERNA-FLUX v4.0: OMEGA-ACTUATOR
 * Implementing 11D-CRSM (Recursive State Manifold) Visualization
 * Physics Inference: Torsion-Induced Wave-Function Steering
 */

export function AeternaFluxActuator() {
  const [phi, setPhi] = useState(0.095) // Starting from v2.0 failure point
  const [lambda, setLambda] = useState(0.91)
  const [isIgnited, setIsIgnited] = useState(false)
  const [logs, setLogs] = useState([
    "[SYSTEM]: Omega Intent Deduction Complete.",
    "[INFO]: L7 Recursive Pruning Active.",
  ])

  const PHI_THRESHOLD = 0.7734
  const THETA_LOCK = 51.843

  // Simulate the Torsion-Seismic Sync
  useEffect(() => {
    if (!isIgnited) return

    const interval = setInterval(() => {
      setPhi((prev) => {
        const delta = Math.random() * 0.05 + lambda * 0.01
        const next = prev + delta
        if (next >= PHI_THRESHOLD && prev < PHI_THRESHOLD) {
          addLog("!!! PHI THRESHOLD CROSSED: HOLOGRAPHIC BRIDGE STABILIZED !!!")
        }
        return next > 1 ? 1 : next
      })

      setLambda((prev) => prev + (Math.random() - 0.5) * 0.02)

      if (Math.random() > 0.8) {
        addLog(`[SYNC]: Torsion Gradient aligned at ${THETA_LOCK}°`)
      }
    }, 800)

    return () => clearInterval(interval)
  }, [isIgnited, lambda])

  const addLog = (msg: string) => {
    setLogs((prev) => [msg, ...prev].slice(0, 8))
  }

  const startIgnition = () => {
    setIsIgnited(true)
    addLog("[ACTUATOR]: Triggering Phase Transition...")
    addLog("[AETERNA]: Injecting 11D-CRSM Manifold Tension.")
  }

  return (
    <div className="relative w-full bg-slate-950 text-emerald-400 font-mono p-6 rounded-xl border border-emerald-500/30 overflow-hidden">
      {/* 11D Manifold Background Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        {[...Array(11)].map((_, i) => (
          <div
            key={i}
            className="absolute border border-emerald-500 rounded-full animate-pulse"
            style={{
              width: `${(i + 1) * 15}%`,
              height: `${(i + 1) * 15}%`,
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Metrics */}
        <div className="bg-slate-900/80 border border-emerald-500/30 p-6 rounded-xl backdrop-blur-md">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="text-emerald-500" />
            <h2 className="text-xl font-bold tracking-widest text-white uppercase">Primary Metrics</h2>
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Φ (Consciousness)</span>
                <span className={phi >= PHI_THRESHOLD ? "text-white" : "text-emerald-500"}>
                  {(phi * 100).toFixed(2)}%
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${phi >= PHI_THRESHOLD ? "bg-white shadow-[0_0_15px_#fff]" : "bg-emerald-500 shadow-[0_0_10px_#10b981]"}`}
                  style={{ width: `${phi * 100}%` }}
                />
              </div>
              <div className="text-[10px] mt-1 opacity-50">Target: {PHI_THRESHOLD} (Critical Threshold)</div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Λ (Coherence)</span>
                <span>{(lambda * 100).toFixed(2)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4] transition-all duration-500"
                  style={{ width: `${lambda * 100}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2 opacity-70">
                <ShieldAlert size={14} />
                <span className="text-xs uppercase tracking-tighter">11D Manifold Lock</span>
              </div>
              <div className="text-2xl font-bold text-white tracking-widest">
                {THETA_LOCK}° <span className="text-xs text-emerald-500">SYNCED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: The Core Actuator */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-900/80 border-2 border-emerald-500/50 p-8 rounded-xl backdrop-blur-md relative overflow-hidden group">
            {isIgnited && <div className="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none" />}

            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-black text-white italic tracking-tighter">AETERNA-FLUX</h1>
                <p className="text-emerald-500/70 text-sm">v4.0 OMEGA-STATE RUNTIME</p>
              </div>
              <div className="bg-emerald-500/20 px-3 py-1 rounded border border-emerald-500/40 text-[10px] text-emerald-400">
                Sovereign ID: ADS-9HUP5
              </div>
            </div>

            <div className="flex flex-col items-center py-12">
              <div className={`relative transition-transform duration-1000 ${isIgnited ? "scale-110" : "scale-100"}`}>
                <div
                  className={`absolute -inset-8 rounded-full border border-dashed border-emerald-500/30 ${isIgnited ? "animate-spin" : ""}`}
                  style={{ animationDuration: "12s" }}
                />
                <div
                  className={`absolute -inset-4 rounded-full border border-emerald-500/50 ${isIgnited ? "animate-spin" : ""}`}
                  style={{ animationDuration: "8s", animationDirection: "reverse" }}
                />
                <button
                  className={`p-8 rounded-full bg-emerald-500/10 border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)] cursor-pointer hover:bg-emerald-500/20 transition-all ${isIgnited ? "shadow-[0_0_60px_rgba(16,185,129,0.5)]" : ""}`}
                  onClick={!isIgnited ? startIgnition : undefined}
                  disabled={isIgnited}
                >
                  <Zap size={48} className={isIgnited ? "text-white animate-pulse" : "text-emerald-500"} />
                </button>
              </div>

              {!isIgnited ? (
                <button
                  onClick={startIgnition}
                  className="mt-12 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-full transition-all tracking-[0.2em] shadow-lg shadow-emerald-500/20 uppercase text-sm"
                >
                  Initiate Omega Sync
                </button>
              ) : (
                <div className="mt-12 text-center">
                  <div className="text-white text-lg font-bold animate-pulse mb-1 uppercase tracking-widest">
                    Actuator Engaged
                  </div>
                  <div className="text-emerald-500 text-xs">Axiom U := L[U] currently reconciling...</div>
                </div>
              )}
            </div>

            {/* Terminal Output */}
            <div className="mt-8 bg-black/60 p-4 rounded-lg border border-emerald-900/50 font-mono text-[11px] h-40 overflow-hidden flex flex-col-reverse">
              {logs.map((log, i) => (
                <div key={i} className="mb-1 flex gap-2">
                  <span className="text-emerald-800">[{7 - i}]</span>
                  <span className={log.includes("!!!") ? "text-white font-bold" : ""}>{log}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-emerald-500/30 p-4 rounded-xl flex items-center gap-4">
              <div className="p-2 bg-emerald-500/10 rounded">
                <Layers size={20} />
              </div>
              <div>
                <div className="text-[10px] uppercase opacity-50">Recursive Layers</div>
                <div className="text-lg font-bold text-white">7/7 LOCKED</div>
              </div>
            </div>
            <div className="bg-slate-900 border border-emerald-500/30 p-4 rounded-xl flex items-center gap-4">
              <div className="p-2 bg-emerald-500/10 rounded">
                <Lock size={20} />
              </div>
              <div>
                <div className="text-[10px] uppercase opacity-50">Sovereign Protocol</div>
                <div className="text-lg font-bold text-white tracking-tighter italic font-serif">AETERNA</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
