import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"
import { createClient } from "@/lib/supabase/client"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// AI-powered patient matching algorithm
async function matchPatientsToTrials(patientId?: string) {
  const supabase = createClient()

  // Get all active trials with genomic criteria
  const { data: trials, error: trialsError } = await supabase
    .from("clinical_trials")
    .select(`
      id, 
      title, 
      phase, 
      condition, 
      status,
      trial_genomic_criteria(gene, variant, expression, biomarker, required)
    `)
    .eq("status", "recruiting")

  if (trialsError) {
    console.error("Error fetching trials:", trialsError)
    return { error: "Failed to fetch trials" }
  }

  // Get patients with genomic profiles
  let patientsQuery = supabase
    .from("patients")
    .select(`
      id, 
      first_name,
      last_name,
      date_of_birth,
      gender,
      condition,
      patient_genomic_profiles(gene, variant, expression, biomarker, confidence)
    `)
    .eq("active", true)

  // If patientId is provided, filter for that specific patient
  if (patientId) {
    patientsQuery = patientsQuery.eq("id", patientId)
  }

  const { data: patients, error: patientsError } = await patientsQuery

  if (patientsError) {
    console.error("Error fetching patients:", patientsError)
    return { error: "Failed to fetch patients" }
  }

  // Match patients to trials using AI algorithm
  const matches = []

  for (const patient of patients) {
    const patientGenomics = patient.patient_genomic_profiles || []
    const patientMatches = []

    for (const trial of trials) {
      const trialCriteria = trial.trial_genomic_criteria || []

      // Calculate genomic match score
      const matchScore = calculateGenomicMatchScore(patientGenomics, trialCriteria)

      // Check clinical eligibility (condition match)
      const clinicalMatch =
        !trial.condition ||
        trial.condition.toLowerCase().includes(patient.condition?.toLowerCase() || "") ||
        patient.condition?.toLowerCase().includes(trial.condition.toLowerCase() || "")

      // Determine overall eligibility
      let eligibilityStatus = "ineligible"
      if (matchScore > 0.8 && clinicalMatch) {
        eligibilityStatus = "eligible"
      } else if (matchScore > 0.5 && clinicalMatch) {
        eligibilityStatus = "potentially_eligible"
      }

      // Only include if there's some level of match
      if (matchScore > 0.3) {
        patientMatches.push({
          trial_id: trial.id,
          trial_title: trial.title,
          trial_phase: trial.phase,
          match_score: matchScore,
          eligibility_status: eligibilityStatus,
          genomic_match: matchScore > 0.5,
          clinical_match: clinicalMatch,
          matched_at: new Date().toISOString(),
        })
      }
    }

    // Sort matches by score (highest first)
    patientMatches.sort((a, b) => b.match_score - a.match_score)

    matches.push({
      patient_id: patient.id,
      patient_name: `${patient.first_name} ${patient.last_name}`,
      matches: patientMatches,
    })

    // Store matches in database
    if (patientMatches.length > 0) {
      // Clear previous matches for this patient
      await supabase.from("patient_trial_matches").delete().eq("patient_id", patient.id)

      // Insert new matches
      for (const match of patientMatches) {
        await supabase.from("patient_trial_matches").insert({
          patient_id: patient.id,
          trial_id: match.trial_id,
          match_score: match.match_score,
          eligibility_status: match.eligibility_status,
          genomic_match: match.genomic_match,
          clinical_match: match.clinical_match,
        })
      }
    }
  }

  return { matches }
}

// Calculate genomic match score between patient profile and trial criteria
function calculateGenomicMatchScore(patientGenomics: any[], trialCriteria: any[]): number {
  if (!trialCriteria.length) return 1.0 // No genomic criteria means automatic match
  if (!patientGenomics.length) return 0.0 // No patient genomics means no match

  let totalScore = 0
  let requiredCriteriaCount = 0
  let requiredCriteriaMet = 0

  // Check each trial criterion
  for (const criterion of trialCriteria) {
    if (criterion.required) requiredCriteriaCount++

    // Find matching patient genomic profile for this gene
    const matchingProfiles = patientGenomics.filter((p) => p.gene === criterion.gene)

    if (matchingProfiles.length) {
      let bestProfileScore = 0

      // Check each matching profile for this gene
      for (const profile of matchingProfiles) {
        let criterionScore = 0.5 // Base score for gene match

        // Check variant match if specified
        if (criterion.variant && profile.variant) {
          if (criterion.variant === profile.variant) {
            criterionScore += 0.3
          } else {
            criterionScore -= 0.1
          }
        }

        // Check expression match if specified
        if (criterion.expression && profile.expression) {
          if (criterion.expression === profile.expression) {
            criterionScore += 0.2
          } else {
            criterionScore -= 0.1
          }
        }

        // Check biomarker match if specified
        if (criterion.biomarker && profile.biomarker) {
          if (criterion.biomarker === profile.biomarker) {
            criterionScore += 0.2
          } else {
            criterionScore -= 0.1
          }
        }

        // Apply confidence weighting if available
        if (profile.confidence) {
          criterionScore *= profile.confidence
        }

        // Keep track of best matching profile for this gene
        bestProfileScore = Math.max(bestProfileScore, criterionScore)
      }

      totalScore += bestProfileScore

      // Count required criteria that were met
      if (criterion.required && bestProfileScore > 0.5) {
        requiredCriteriaMet++
      }
    }
  }

  // Calculate average score
  const averageScore = totalScore / trialCriteria.length

  // If any required criteria weren't met, penalize the score
  if (requiredCriteriaCount > 0 && requiredCriteriaMet < requiredCriteriaCount) {
    return averageScore * (requiredCriteriaMet / requiredCriteriaCount)
  }

  return averageScore
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId") || undefined

    // Check cache first
    const cacheKey = `patient_matches:${patientId || "all"}`
    const cachedMatches = await redis.get(cacheKey)

    if (cachedMatches) {
      return NextResponse.json(cachedMatches)
    }

    // Run matching algorithm
    const result = await matchPatientsToTrials(patientId)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Cache results for 30 minutes
    await redis.setex(cacheKey, 1800, result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in patient matching:", error)
    return NextResponse.json({ error: "Failed to match patients to trials" }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Force a fresh match of all patients to all trials
    const result = await matchPatientsToTrials()

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Clear all patient match caches
    await redis.del("patient_matches:all")

    // Clear individual patient caches
    const patientCacheKeys = await redis.keys("patient_matches:*")
    for (const key of patientCacheKeys) {
      await redis.del(key)
    }

    return NextResponse.json({
      success: true,
      message: "Patient matching completed successfully",
      matchCount: result.matches?.length || 0,
    })
  } catch (error) {
    console.error("Error in patient matching:", error)
    return NextResponse.json({ error: "Failed to match patients to trials" }, { status: 500 })
  }
}
