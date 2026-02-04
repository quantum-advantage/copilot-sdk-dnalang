import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/client"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const patientId = params.id

    // Get patient basic info
    const { data: patient, error } = await supabase.from("patients").select("*").eq("id", patientId).single()

    if (error || !patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Get genomic data if available
    const { data: genomicData } = await supabase
      .from("patient_genomic_data")
      .select("*")
      .eq("patient_id", patientId)
      .single()

    return NextResponse.json({
      ...patient,
      genomic_data: genomicData || null,
    })
  } catch (error) {
    console.error("Error fetching patient:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
