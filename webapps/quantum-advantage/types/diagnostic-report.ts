export interface DiagnosticReportResult {
  patientId: string
  patientName: string
  gene: string
  mutation: string
  zygosity: string
  interpretation: string
  loincCode: string
  icdCodes: string
  diseaseStage: string
  dateOfCollection: string
}
