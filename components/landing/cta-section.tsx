"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play, BookOpen, Github } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-secondary/5 to-transparent pointer-events-none" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      <div className="max-w-[800px] mx-auto text-center relative">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-balance">
          Ready to{" "}
          <span className="dnalang-gradient">{"DNA::}{::lang"}</span> your stack?
        </h2>
        <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl mx-auto text-pretty">
          Join the next generation of quantum-classical computing. Deploy distributed workloads,
          orchestrate multi-agent pipelines, and ship production-grade quantum applications.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/ide-platform">
            <Button 
              size="lg" 
              className="w-full sm:w-auto text-base h-14 px-10 gap-2 shadow-lg shadow-primary/25"
            >
              <Play className="h-5 w-5" />
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/ide-platform/docs">
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto text-base h-14 px-10 gap-2 bg-transparent"
            >
              <BookOpen className="h-5 w-5" />
              Read Documentation
            </Button>
          </Link>
        </div>

        {/* Trusted by section */}
        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-6">
            Validated on quantum hardware from
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            <span className="text-lg font-semibold text-muted-foreground">IBM Quantum</span>
            <span className="text-lg font-semibold text-muted-foreground">QuEra</span>
            <span className="text-lg font-semibold text-muted-foreground">Zenodo</span>
            <span className="text-lg font-semibold text-muted-foreground">AWS Braket</span>
          </div>
        </div>
      </div>
    </section>
  )
}
