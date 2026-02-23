"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dna, ArrowRight, Sparkles } from "lucide-react"
import { encodeData, decodeData, translate, transcribe, foldProtein } from "@/lib/dna-lang/protein-synthesis"

/**
 * DNA Data Transformer - Protein synthesis for data transformation
 */
export function DNADataTransformer() {
  const [inputData, setInputData] = useState("")
  const [dnaSequence, setDnaSequence] = useState("")
  const [rnaSequence, setRnaSequence] = useState("")
  const [protein, setProtein] = useState<string[]>([])
  const [proteinStructure, setProteinStructure] = useState<{
    structure: string
    stability: number
  } | null>(null)

  const handleEncode = () => {
    try {
      const data = JSON.parse(inputData)
      const dna = encodeData(data)
      setDnaSequence(dna)

      // Transcription
      const rna = transcribe(dna)
      setRnaSequence(rna)

      // Translation
      const aminoAcids = translate(rna)
      setProtein(aminoAcids)

      // Folding
      if (aminoAcids.length > 0) {
        const folded = foldProtein(aminoAcids)
        setProteinStructure(folded)
      }
    } catch (error) {
      console.error("Encoding error:", error)
    }
  }

  const handleDecode = () => {
    if (dnaSequence) {
      const decoded = decodeData(dnaSequence)
      if (decoded) {
        setInputData(JSON.stringify(decoded, null, 2))
      }
    }
  }

  return (
    <Card className="p-6 glass-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-[#10b981]/20 rounded-md">
          <Dna className="h-5 w-5 text-[#10b981]" />
        </div>
        <h3 className="text-lg font-semibold">Protein Synthesis Pipeline</h3>
        <Badge variant="outline" className="ml-auto">
          <Sparkles className="h-3 w-3 mr-1" />
          Biological Transform
        </Badge>
      </div>

      {/* Input */}
      <div className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Input Data (JSON)</label>
          <Input
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            placeholder='{"message": "Hello DNA-Lang"}'
            className="font-mono text-sm"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleEncode} size="sm" className="flex-1">
            <ArrowRight className="h-4 w-4 mr-2" />
            Synthesize
          </Button>
          <Button onClick={handleDecode} size="sm" variant="outline" className="flex-1 bg-transparent">
            Decode DNA
          </Button>
        </div>

        {/* DNA Sequence */}
        {dnaSequence && (
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">DNA Sequence</span>
              <Badge variant="secondary" className="text-xs">
                {dnaSequence.length} bp
              </Badge>
            </div>
            <div className="font-mono text-xs break-all">
              {dnaSequence.split("").map((nucleotide, i) => (
                <span
                  key={i}
                  className={cn(
                    nucleotide === "A" && "text-[#3b82f6]",
                    nucleotide === "T" && "text-[#10b981]",
                    nucleotide === "G" && "text-[#8b5cf6]",
                    nucleotide === "C" && "text-[#d97706]",
                  )}
                >
                  {nucleotide}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* RNA Sequence */}
        {rnaSequence && (
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">RNA (Transcribed)</span>
              <Badge variant="secondary" className="text-xs">
                {rnaSequence.length} nt
              </Badge>
            </div>
            <div className="font-mono text-xs break-all text-[#10b981]">
              {rnaSequence.substring(0, 100)}
              {rnaSequence.length > 100 && "..."}
            </div>
          </div>
        )}

        {/* Protein */}
        {protein.length > 0 && (
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Protein (Translated)</span>
              <Badge variant="secondary" className="text-xs">
                {protein.length} amino acids
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1">
              {protein.slice(0, 20).map((aa, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {aa}
                </Badge>
              ))}
              {protein.length > 20 && (
                <Badge variant="outline" className="text-xs">
                  +{protein.length - 20} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Protein Structure */}
        {proteinStructure && (
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <div className="text-xs text-muted-foreground mb-2">Protein Folding</div>
            <div className="flex items-center justify-between">
              <Badge className="text-sm">{proteinStructure.structure}</Badge>
              <div className="text-sm">
                Stability:{" "}
                <span className="font-mono text-[#10b981]">{(proteinStructure.stability * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
