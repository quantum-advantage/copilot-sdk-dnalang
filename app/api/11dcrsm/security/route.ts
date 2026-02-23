import { NextResponse } from 'next/server'
import {
  generateKyberKeyPair,
  createPhysicalResonanceIdentity,
  createSovereignToken,
  validateSovereignToken
} from '@/lib/11dcrsm/kyber-security'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'generateIdentity': {
        const { userId, metadata } = data
        if (!userId) {
          return NextResponse.json(
            { error: 'userId is required' },
            { status: 400 }
          )
        }
        
        const identity = createPhysicalResonanceIdentity(userId, metadata || {})
        const token = createSovereignToken(identity)
        
        // Don't return full frequency vector for security
        const safeIdentity = {
          phaseSignature: identity.phaseSignature,
          sovereignty: identity.sovereignty,
          timestamp: identity.timestamp,
          frequencyCount: identity.frequencyVector.length,
          manifoldLambda: identity.manifoldAnchor.lambda,
          manifoldPhi: identity.manifoldAnchor.phi
        }
        
        return NextResponse.json({
          success: true,
          identity: safeIdentity,
          token,
          timestamp: Date.now()
        })
      }

      case 'generateKeyPair': {
        const { seed } = data
        if (!seed) {
          return NextResponse.json(
            { error: 'seed is required' },
            { status: 400 }
          )
        }
        
        const keyPair = generateKyberKeyPair(seed)
        
        // Only return identity hash and public key length
        return NextResponse.json({
          success: true,
          identityHash: keyPair.identityHash,
          publicKeyDimensions: [keyPair.publicKey.length, keyPair.publicKey[0]?.length || 0],
          kyberLevel: 3, // NIST PQC Level 3
          timestamp: Date.now()
        })
      }

      case 'validateToken': {
        const { token } = data
        if (!token) {
          return NextResponse.json(
            { error: 'token is required' },
            { status: 400 }
          )
        }
        
        const validation = validateSovereignToken(token)
        
        return NextResponse.json({
          success: true,
          validation,
          timestamp: Date.now()
        })
      }

      case 'refreshToken': {
        const { token, expiry } = data
        if (!token) {
          return NextResponse.json(
            { error: 'token is required' },
            { status: 400 }
          )
        }
        
        const validation = validateSovereignToken(token)
        
        if (!validation.valid || !validation.identity) {
          return NextResponse.json({
            success: false,
            error: validation.error || 'Invalid token',
            timestamp: Date.now()
          }, { status: 401 })
        }
        
        // Create new identity from validated data
        const newIdentity = createPhysicalResonanceIdentity(
          `refreshed_${Date.now()}`,
          { previousPhase: validation.identity.phaseSignature }
        )
        
        const newToken = createSovereignToken(newIdentity, expiry || 3600000)
        
        return NextResponse.json({
          success: true,
          token: newToken,
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
    console.error('[Kyber Security API Error]', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Kyber-Lattice Security API',
    version: '4.0',
    features: {
      postQuantum: true,
      kyberLevel: 3,
      identityType: 'Physical Resonance Frequency',
      tokenFormat: 'Sovereign Quantum Token (sqt_)'
    },
    endpoints: {
      generateIdentity: 'Create Physical Resonance Identity',
      generateKeyPair: 'Generate Kyber-Lattice key pair',
      validateToken: 'Validate Sovereign Quantum Token',
      refreshToken: 'Refresh expired token'
    },
    timestamp: Date.now()
  })
}
