"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LabPanel } from "@/components/reports/lab-panel"
import { ImageGallery } from "@/components/reports/image-gallery"
import { getMockReport } from "@/lib/mock-data/medical-reports"
import { ArrowLeft, Printer, Share2, Download } from "lucide-react"
import Link from "next/link"
import type { MedicalReport } from "@/types/medical-reports"

export default function ReportViewerPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const reportId = params.id as string
  const [report, setReport] = useState<MedicalReport | null>(null)
  const [isPageLoading, setIsPageLoading] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push(`/auth/signin?callbackUrl=/reports/${reportId}`)
        return
      }

      // Load report data
      const reportData = getMockReport(reportId)
      if (reportData) {
        setReport(reportData)
      }
      setIsPageLoading(false)
    }
  }, [isLoading, user, reportId, router])

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // In a real app, this would generate a PDF
    alert("In a real application, this would download the report as a PDF.")
  }

  const handleShare = () => {
    // In a real app, this would open a sharing dialog
    alert("In a real application, this would open options to share the report.")
  }

  if (isLoading || isPageLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Report not found or you don't have access to this report.
        </div>
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 print:py-2">
      {/* Back button and actions - hidden when printing */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 print:hidden">
        <Button asChild variant="outline" className="mb-4 sm:mb-0">
          <Link href={`/patients/${report.patientId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patient
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Report Header */}
      <Card className="mb-6">
        <CardHeader className="bg-gray-50 print:bg-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-2xl">{report.name}</CardTitle>
              <p className="text-gray-500">
                {new Date(report.date).toLocaleDateString()} | Provider: {report.provider}
              </p>
            </div>
            <div className="mt-2 md:mt-0">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  report.status === "final"
                    ? "bg-green-100 text-green-800"
                    : report.status === "preliminary"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Report Content */}
      {report.type === "laboratory" && (
        <Card>
          <CardContent className="pt-6">
            {report.panels?.map((panel, index) => (
              <LabPanel key={index} panel={panel} />
            ))}

            {report.conclusion && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg print:bg-white print:border print:border-gray-200">
                <h3 className="text-lg font-semibold mb-2">Conclusion</h3>
                <p>{report.conclusion}</p>
              </div>
            )}

            {report.notes && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Notes</h3>
                <p className="text-gray-700">{report.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {report.type === "radiology" && (
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="findings" className="mb-6">
              <TabsList className="mb-4">
                <TabsTrigger value="findings">Findings</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="findings">
                <div className="space-y-6">
                  {report.findings && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Findings</h3>
                      <p className="text-gray-700">{report.findings}</p>
                    </div>
                  )}

                  {report.impression && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Impression</h3>
                      <p className="text-gray-700">{report.impression}</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="images">
                {report.images && report.images.length > 0 ? (
                  <ImageGallery images={report.images} />
                ) : (
                  <p className="text-gray-500">No images available for this report.</p>
                )}
              </TabsContent>

              <TabsContent value="details">
                <div className="space-y-6">
                  {report.clinicalInformation && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Clinical Information</h3>
                      <p className="text-gray-700">{report.clinicalInformation}</p>
                    </div>
                  )}

                  {report.technique && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Technique</h3>
                      <p className="text-gray-700">{report.technique}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {report.type === "pathology" && (
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="findings" className="mb-6">
              <TabsList className="mb-4">
                <TabsTrigger value="findings">Findings</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="findings">
                <div className="space-y-6">
                  {report.findings && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Findings</h3>
                      <p className="text-gray-700">{report.findings}</p>
                    </div>
                  )}

                  {report.impression && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Impression</h3>
                      <p className="text-gray-700">{report.impression}</p>
                    </div>
                  )}

                  {report.conclusion && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Conclusion</h3>
                      <p className="text-gray-700">{report.conclusion}</p>
                    </div>
                  )}

                  {report.recommendations && (
                    <div className="p-4 bg-blue-50 rounded-lg print:bg-white print:border print:border-gray-200">
                      <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
                      <p>{report.recommendations}</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="images">
                {report.images && report.images.length > 0 ? (
                  <ImageGallery images={report.images} />
                ) : (
                  <p className="text-gray-500">No images available for this report.</p>
                )}
              </TabsContent>

              <TabsContent value="details">
                <div className="space-y-6">
                  {report.clinicalInformation && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Clinical Information</h3>
                      <p className="text-gray-700">{report.clinicalInformation}</p>
                    </div>
                  )}

                  {report.specimens && report.specimens.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Specimens</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="bg-gray-50 border-b">
                              <th className="text-left py-3 px-4">Type</th>
                              <th className="text-left py-3 px-4">Site</th>
                              <th className="text-left py-3 px-4">Collection Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {report.specimens.map((specimen, index) => (
                              <tr key={index} className="border-b">
                                <td className="py-3 px-4">{specimen.type}</td>
                                <td className="py-3 px-4">{specimen.site}</td>
                                <td className="py-3 px-4">{new Date(specimen.collectionDate).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
