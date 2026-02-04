import { NextRequest, NextResponse } from "next/server"
import { samSynthesisOptimizer, type MethionineAnalog, type MATVariant, type MTEnzyme } from "@/lib/quantum/sam-analog-synthesis-optimizer"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, payload } = body

    switch (action) {
      case "optimize_synthesis": {
        const { targetAnalog, constraints } = payload
        const result = await samSynthesisOptimizer.optimizeSynthesisRoute(targetAnalog as MethionineAnalog, constraints)
        return NextResponse.json({ success: true, data: result })
      }

      case "design_coupled_reaction": {
        const { mat, mt, methionineAnalog, targetSubstrate } = payload
        const result = await samSynthesisOptimizer.designCoupledReaction(
          mat as MATVariant,
          mt as MTEnzyme,
          methionineAnalog as MethionineAnalog,
          targetSubstrate
        )
        return NextResponse.json({ success: true, data: result })
      }

      case "design_mat_variant": {
        const { parentEnzyme, targetSubstrate, objectives } = payload
        const result = await samSynthesisOptimizer.designMATVariant(
          parentEnzyme,
          targetSubstrate as MethionineAnalog,
          objectives
        )
        return NextResponse.json({ success: true, data: result })
      }

      case "predict_stability": {
        const { analog } = payload
        const result = await samSynthesisOptimizer.predictStability(analog as MethionineAnalog)
        return NextResponse.json({ success: true, data: result })
      }

      case "screen_analogs": {
        const { mat, analogs } = payload
        const result = await samSynthesisOptimizer.screenMethionineAnalogs(mat, analogs as MethionineAnalog[])
        return NextResponse.json({ success: true, data: result })
      }

      case "generate_library": {
        const { options } = payload
        const result = await samSynthesisOptimizer.generateSAMAnalogLibrary(options)
        return NextResponse.json({ success: true, data: result })
      }

      default:
        return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 })
    }
  } catch (error) {
    console.error("SAM synthesis optimization error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Optimization failed" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      name: "SAM Analog Synthesis Optimization API",
      version: "1.0.0",
      capabilities: [
        "optimize_synthesis - Optimize synthesis routes for SAM analogs",
        "design_coupled_reaction - Design coupled MAT-MT reactions",
        "design_mat_variant - Engineer MAT variants for improved substrate scope",
        "predict_stability - Predict SAM analog stability",
        "screen_analogs - Screen methionine analogs for MAT compatibility",
        "generate_library - Generate SAM analog libraries for alkylrandomization",
      ],
      supportedIsosteres: ["native (carboxylate)", "tetrazole", "amide", "nitrile"],
      supportedMATs: ["hMAT2A", "eMAT", "MAT_I", "MAT_II", "engineered"],
      alkylGroups: ["methyl", "ethyl", "allyl", "propargyl", "benzyl", "4-azidobutyl"],
    },
  })
}
