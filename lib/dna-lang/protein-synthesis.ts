/**
 * DNA-Lang Protein Synthesis
 * Data transformation using biological metaphors
 */

export type Nucleotide = "A" | "T" | "G" | "C"
export type Codon = [Nucleotide, Nucleotide, Nucleotide]
export type AminoAcid = string

// Genetic code table (simplified)
const GENETIC_CODE: Record<string, AminoAcid> = {
  AAA: "Lysine",
  AAT: "Asparagine",
  AAG: "Lysine",
  AAC: "Asparagine",
  ATA: "Isoleucine",
  ATT: "Isoleucine",
  ATG: "Methionine", // Start codon
  ATC: "Isoleucine",
  AGA: "Arginine",
  AGT: "Serine",
  AGG: "Arginine",
  AGC: "Serine",
  ACA: "Threonine",
  ACT: "Threonine",
  ACG: "Threonine",
  ACC: "Threonine",
  TAA: "STOP",
  TAT: "Tyrosine",
  TAG: "STOP",
  TAC: "Tyrosine",
  TTA: "Leucine",
  TTT: "Phenylalanine",
  TTG: "Leucine",
  TTC: "Phenylalanine",
  TGA: "STOP",
  TGT: "Cysteine",
  TGG: "Tryptophan",
  TGC: "Cysteine",
  TCA: "Serine",
  TCT: "Serine",
  TCG: "Serine",
  TCC: "Serine",
  GAA: "Glutamate",
  GAT: "Aspartate",
  GAG: "Glutamate",
  GAC: "Aspartate",
  GTA: "Valine",
  GTT: "Valine",
  GTG: "Valine",
  GTC: "Valine",
  GGA: "Glycine",
  GGT: "Glycine",
  GGG: "Glycine",
  GGC: "Glycine",
  GCA: "Alanine",
  GCT: "Alanine",
  GCG: "Alanine",
  GCC: "Alanine",
  CAA: "Glutamine",
  CAT: "Histidine",
  CAG: "Glutamine",
  CAC: "Histidine",
  CTA: "Leucine",
  CTT: "Leucine",
  CTG: "Leucine",
  CTC: "Leucine",
  CGA: "Arginine",
  CGT: "Arginine",
  CGG: "Arginine",
  CGC: "Arginine",
  CCA: "Proline",
  CCT: "Proline",
  CCG: "Proline",
  CCC: "Proline",
}

/**
 * Transcription: DNA → RNA
 */
export function transcribe(dna: string): string {
  return dna.replace(/T/g, "U")
}

/**
 * Translation: RNA → Protein (Amino Acid Sequence)
 */
export function translate(rna: string): AminoAcid[] {
  const protein: AminoAcid[] = []
  const sequence = rna.replace(/U/g, "T") // Convert back for lookup

  for (let i = 0; i < sequence.length - 2; i += 3) {
    const codon = sequence.substr(i, 3)
    const aminoAcid = GENETIC_CODE[codon]

    if (aminoAcid === "STOP") break
    if (aminoAcid) protein.push(aminoAcid)
  }

  return protein
}

/**
 * Data encoding: Convert data to DNA sequence
 */
export function encodeData<T>(data: T): string {
  const json = JSON.stringify(data)
  const binary = Array.from(json)
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
    .join("")

  // Convert binary to DNA (00=A, 01=T, 10=G, 11=C)
  const dna = binary
    .match(/.{2}/g)
    ?.map((pair) => {
      switch (pair) {
        case "00":
          return "A"
        case "01":
          return "T"
        case "10":
          return "G"
        case "11":
          return "C"
        default:
          return "A"
      }
    })
    .join("")

  return dna || ""
}

/**
 * Data decoding: Convert DNA sequence back to data
 */
export function decodeData<T>(dna: string): T | null {
  try {
    // Convert DNA to binary
    const binary = Array.from(dna)
      .map((nucleotide) => {
        switch (nucleotide) {
          case "A":
            return "00"
          case "T":
            return "01"
          case "G":
            return "10"
          case "C":
            return "11"
          default:
            return "00"
        }
      })
      .join("")

    // Convert binary to string
    const chars = binary.match(/.{8}/g)?.map((byte) => {
      return String.fromCharCode(Number.parseInt(byte, 2))
    })

    if (!chars) return null

    const json = chars.join("")
    return JSON.parse(json) as T
  } catch {
    return null
  }
}

/**
 * Protein folding simulation - data transformation
 */
export function foldProtein(aminoAcids: AminoAcid[]): {
  structure: string
  stability: number
} {
  // Simplified protein folding
  const hydrophobic = [
    "Alanine",
    "Valine",
    "Leucine",
    "Isoleucine",
    "Proline",
    "Phenylalanine",
    "Tryptophan",
    "Methionine",
  ]

  const hydrophobicCount = aminoAcids.filter((aa) => hydrophobic.includes(aa)).length

  const stability = hydrophobicCount / aminoAcids.length

  let structure = "α-helix"
  if (stability < 0.3) structure = "random-coil"
  else if (stability > 0.7) structure = "β-sheet"

  return { structure, stability }
}

/**
 * DNA-Lang data pipeline
 */
export class ProteinSynthesisPipeline<TInput, TOutput> {
  private transformations: Array<(data: any) => any> = []

  /**
   * Add transformation step (like adding amino acids)
   */
  addTransformation<TNext>(transform: (data: TInput) => TNext): ProteinSynthesisPipeline<TNext, TOutput> {
    this.transformations.push(transform)
    return this as any
  }

  /**
   * Execute pipeline (protein synthesis)
   */
  synthesize(input: TInput): TOutput {
    let result: any = input

    for (const transform of this.transformations) {
      result = transform(result)
    }

    return result as TOutput
  }

  /**
   * Encode pipeline as DNA
   */
  toDNA(): string {
    return encodeData(this.transformations.length)
  }
}
