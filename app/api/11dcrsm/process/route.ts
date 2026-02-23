import { NextResponse } from 'next/server'
import {
  processIntentInterstitial,
  applyQuantumResonance,
  calculateGeodesicDeviation,
  calculateShapiroDelay,
  checkDecoherenceThreshold,
  LAMBDA_PHI_INVARIANT,
  PHI_THRESHOLD,
  GAMMA_BASELINE
} from '@/lib/11dcrsm'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'processIntent': {
        const { dnaString } = data
        if (!dnaString) {
          return NextResponse.json(
            { error: 'dnaString is required' },
            { status: 400 }
          )
        }
        
        const intent = processIntentInterstitial(dnaString)
        
        // Apply quantum resonance
        const resonance = await applyQuantumResonance({
          vector: intent.lambda,
          teleology: intent.omega,
          anchor: data.anchor || 'ibm_torino_40q'
        })
        
        return NextResponse.json({
          success: true,
          intent,
          resonance,
          timestamp: Date.now()
        })
      }

      case 'verifyResonance': {
        const { vector, teleology, anchor } = data
        if (!vector || !teleology) {
          return NextResponse.json(
            { error: 'vector and teleology are required' },
            { status: 400 }
          )
        }
        
        const resonance = await applyQuantumResonance({
          vector,
          teleology,
          anchor: anchor || 'ibm_torino_40q'
        })
        
        return NextResponse.json({
          success: true,
          resonance,
          timestamp: Date.now()
        })
      }

      case 'calculateGeodesic': {
        const { origin, destination } = data
        if (!origin || !destination) {
          return NextResponse.json(
            { error: 'origin and destination manifold vectors are required' },
            { status: 400 }
          )
        }
        
        const geodesic = calculateGeodesicDeviation(origin, destination)
        
        return NextResponse.json({
          success: true,
          geodesic,
          timestamp: Date.now()
        })
      }

      case 'shapiroDelay': {
        const { intent, gravitationalPotential } = data
        if (!intent) {
          return NextResponse.json(
            { error: 'intent vector is required' },
            { status: 400 }
          )
        }
        
        const shapiro = calculateShapiroDelay(intent, gravitationalPotential)
        
        return NextResponse.json({
          success: true,
          shapiro,
          timestamp: Date.now()
        })
      }

      case 'checkDecoherence': {
        const { gamma, zIndex } = data
        if (gamma === undefined || zIndex === undefined) {
          return NextResponse.json(
            { error: 'gamma and zIndex are required' },
            { status: 400 }
          )
        }
        
        const check = checkDecoherenceThreshold(gamma, zIndex)
        
        return NextResponse.json({
          success: true,
          check,
          timestamp: Date.now()
        })
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('[11D-CRSM API Error]', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    service: '11D-CRSM Processing API',
    version: '4.0',
    constants: {
      LAMBDA_PHI_INVARIANT,
      PHI_THRESHOLD,
      GAMMA_BASELINE
    },
    endpoints: {
      processIntent: 'Process DNA::}{::lang intent string',
      verifyResonance: 'Verify quantum resonance with hardware anchor',
      calculateGeodesic: 'Calculate geodesic path between manifold points',
      shapiroDelay: 'Calculate negative Shapiro delay for pre-rendering',
      checkDecoherence: 'Check decoherence threshold for component'
    },
    timestamp: Date.now()
  })
}
