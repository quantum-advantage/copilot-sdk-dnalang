import { TrialMatchDetails } from "@/components/research/trial-match-details"

interface MatchDetailsPageProps {
  params: {
    patientId: string
    trialId: string
  }
}

export default function MatchDetailsPage({ params }: MatchDetailsPageProps) {
  const { patientId, trialId } = params

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Match Details</h1>
      <TrialMatchDetails patientId={patientId} trialId={trialId} />
    </div>
  )
}
