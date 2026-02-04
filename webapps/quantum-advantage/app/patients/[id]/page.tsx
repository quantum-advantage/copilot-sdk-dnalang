"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Dna, MessageSquare, Calendar, Clock } from "lucide-react"
import Link from "next/link"

// Mock patient data
const MOCK_PATIENTS = {
  "1": {
    id: "1",
    firstName: "John",
    lastName: "Smith",
    dateOfBirth: "1980-05-12",
    gender: "Male",
    email: "john.smith@example.com",
    phone: "555-123-4567",
    address: "123 Main St",
    city: "Anytown",
    state: "CA",
    zip: "12345",
  },
  "2": {
    id: "2",
    firstName: "Sarah",
    lastName: "Johnson",
    dateOfBirth: "1975-10-23",
    gender: "Female",
    email: "sarah.johnson@example.com",
    phone: "555-987-6543",
    address: "456 Oak Ave",
    city: "Somewhere",
    state: "NY",
    zip: "67890",
  },
  "3": {
    id: "3",
    firstName: "Michael",
    lastName: "Brown",
    dateOfBirth: "1990-03-15",
    gender: "Male",
    email: "michael.brown@example.com",
    phone: "555-456-7890",
    address: "789 Pine St",
    city: "Elsewhere",
    state: "TX",
    zip: "54321",
  },
}

// Mock medical reports
const MOCK_REPORTS = [
  {
    id: "r1",
    patientId: "1",
    type: "Laboratory",
    name: "Complete Blood Count",
    date: "2023-05-10",
    status: "Final",
    provider: "Dr. Jane Smith",
  },
  {
    id: "r2",
    patientId: "1",
    type: "Radiology",
    name: "Chest X-Ray",
    date: "2023-04-15",
    status: "Final",
    provider: "Dr. Robert Johnson",
  },
  {
    id: "r3",
    patientId: "1",
    type: "Laboratory",
    name: "Comprehensive Metabolic Panel",
    date: "2023-03-22",
    status: "Final",
    provider: "Dr. Jane Smith",
  },
]

// Mock genomic reports
const MOCK_GENOMIC_REPORTS = [
  {
    id: "g1",
    patientId: "1",
    name: "Genetic Panel",
    date: "2023-04-28",
    status: "Final",
    provider: "Dr. Emily Chen",
    findings: [
      {
        gene: "BRCA1",
        variant: "c.5266dupC",
        significance: "Pathogenic",
        interpretation:
          "This variant is associated with increased risk of breast and ovarian cancer. Recommend genetic counseling.",
      },
      {
        gene: "MTHFR",
        variant: "C677T",
        significance: "Variant of Uncertain Significance",
        interpretation:
          "This variant may affect how your body processes certain B vitamins. Clinical significance is uncertain.",
      },
    ],
  },
]

// Mock appointments
const MOCK_APPOINTMENTS = [
  {
    id: "a1",
    patientId: "1",
    date: "2023-06-15",
    time: "10:00 AM",
    provider: "Dr. Jane Smith",
    department: "Primary Care",
    status: "Scheduled",
  },
  {
    id: "a2",
    patientId: "1",
    date: "2023-07-10",
    time: "2:30 PM",
    provider: "Dr. Emily Chen",
    department: "Genetics",
    status: "Scheduled",
  },
]

// Mock conversations
const MOCK_CONVERSATIONS = [
  {
    id: "c1",
    patientId: "1",
    date: "2023-05-15",
    time: "2:45 PM",
    userMessage: "What do my latest test results mean?",
    aiResponse:
      "Your recent CBC shows all values within normal ranges. Your hemoglobin is 14.2 g/dL, which is within the normal range of 13.5-17.5 g/dL for adult males.",
  },
  {
    id: "c2",
    patientId: "1",
    date: "2023-05-10",
    time: "11:30 AM",
    userMessage: "Can you explain my genetic test results?",
    aiResponse:
      "Your genetic panel identified a variant in the BRCA1 gene, which is associated with increased risk of breast and ovarian cancer. This doesn't mean you will definitely develop cancer, but it suggests you may benefit from increased screening and preventive measures.",
  },
]

export default function PatientDetailPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const patientId = params.id as string
  const [patient, setPatient] = useState<any>(null)
  const [reports, setReports] = useState<any[]>([])
  const [genomicReports, setGenomicReports] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [conversations, setConversations] = useState<any[]>([])
  const [isPageLoading, setIsPageLoading] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/auth/signin?callbackUrl=/patients/" + patientId)
        return
      }

      // Check if user has access to this patient
      if (user.role === "patient" && user.id !== patientId) {
        router.push("/dashboard")
        return
      }

      // Load patient data
      setPatient(MOCK_PATIENTS[patientId as keyof typeof MOCK_PATIENTS])
      setReports(MOCK_REPORTS.filter((r) => r.patientId === patientId))
      setGenomicReports(MOCK_GENOMIC_REPORTS.filter((r) => r.patientId === patientId))
      setAppointments(MOCK_APPOINTMENTS.filter((a) => a.patientId === patientId))
      setConversations(MOCK_CONVERSATIONS.filter((c) => c.patientId === patientId))
      setIsPageLoading(false)
    }
  }, [isLoading, user, patientId, router])

  if (isLoading || isPageLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Patient not found or you don't have access to this patient.
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Patient Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-gray-600">
              DOB: {new Date(patient.dateOfBirth).toLocaleDateString()} | Gender: {patient.gender}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button variant="outline" className="mr-2">
              Edit Patient
            </Button>
            <Button>Schedule Appointment</Button>
          </div>
        </div>
      </div>

      {/* Patient Information Tabs */}
      <Tabs defaultValue="overview" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">Medical Reports</TabsTrigger>
          <TabsTrigger value="genomic">Genomic Data</TabsTrigger>
          <TabsTrigger value="genetic-timeline">Genetic Timeline</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="conversations">AI Conversations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Patient Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Contact Information</h3>
                    <p className="text-sm">
                      <span className="text-gray-500">Email:</span> {patient.email}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Phone:</span> {patient.phone}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Address:</span> {patient.address}, {patient.city}, {patient.state}{" "}
                      {patient.zip}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Recent Activity</h3>
                    <ul className="space-y-2">
                      {reports.slice(0, 2).map((report) => (
                        <li key={report.id} className="text-sm flex items-start">
                          <FileText className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                          <div>
                            <p>{report.name}</p>
                            <p className="text-gray-500">{new Date(report.date).toLocaleDateString()}</p>
                          </div>
                        </li>
                      ))}
                      {genomicReports.slice(0, 1).map((report) => (
                        <li key={report.id} className="text-sm flex items-start">
                          <Dna className="h-4 w-4 text-purple-500 mr-2 mt-0.5" />
                          <div>
                            <p>{report.name}</p>
                            <p className="text-gray-500">{new Date(report.date).toLocaleDateString()}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length > 0 ? (
                  <ul className="space-y-3">
                    {appointments.map((appointment) => (
                      <li key={appointment.id} className="border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                        <div className="flex items-start">
                          <Calendar className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          <div>
                            <p className="font-medium">{appointment.provider}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                            </p>
                            <p className="text-xs text-gray-400">{appointment.department}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No upcoming appointments.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Medical Reports Tab */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Medical Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {reports.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Report Name</th>
                        <th className="text-left py-2 px-4">Type</th>
                        <th className="text-left py-2 px-4">Date</th>
                        <th className="text-left py-2 px-4">Provider</th>
                        <th className="text-left py-2 px-4">Status</th>
                        <th className="text-left py-2 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report) => (
                        <tr key={report.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-4">{report.name}</td>
                          <td className="py-2 px-4">{report.type}</td>
                          <td className="py-2 px-4">{new Date(report.date).toLocaleDateString()}</td>
                          <td className="py-2 px-4">{report.provider}</td>
                          <td className="py-2 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                report.status === "Final"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {report.status}
                            </span>
                          </td>
                          <td className="py-2 px-4">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/reports/${report.id}`}>View</Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No medical reports available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Genomic Data Tab */}
        <TabsContent value="genomic">
          <Card>
            <CardHeader>
              <CardTitle>Genomic Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {genomicReports.length > 0 ? (
                <div className="space-y-6">
                  {genomicReports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{report.name}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(report.date).toLocaleDateString()} | {report.provider}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            report.status === "Final" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>

                      <h4 className="font-medium mb-2">Findings</h4>
                      <div className="space-y-4">
                        {report.findings.map((finding: any, index: number) => (
                          <div key={index} className="bg-gray-50 p-3 rounded">
                            <div className="flex flex-wrap gap-2 mb-2">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                Gene: {finding.gene}
                              </span>
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                                Variant: {finding.variant}
                              </span>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  finding.significance === "Pathogenic"
                                    ? "bg-red-100 text-red-800"
                                    : finding.significance === "Benign"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {finding.significance}
                              </span>
                            </div>
                            <p className="text-sm">{finding.interpretation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No genomic reports available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="genetic-timeline">
          <Card>
            <CardHeader>
              <CardTitle>Genetic Timeline</CardTitle>
              <p className="text-sm text-gray-500">Chronological view of genetic findings and interpretations</p>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <Dna className="mx-auto h-16 w-16 text-blue-500 opacity-50" />
                <h3 className="mt-4 text-lg font-medium">Track Genetic Findings Over Time</h3>
                <p className="mt-2 text-gray-500">
                  View a chronological timeline of all genetic findings, interpretations, and clinical recommendations.
                </p>
                <Button asChild className="mt-6">
                  <Link href="/genetic-timeline">View Genetic Timeline</Link>
                </Button>
                <Link href="/conflict-evolution" className="text-blue-600 hover:underline flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  View Conflict Resolution Evolution
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Appointments</CardTitle>
              <Button>Schedule New</Button>
            </CardHeader>
            <CardContent>
              {appointments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Date</th>
                        <th className="text-left py-2 px-4">Time</th>
                        <th className="text-left py-2 px-4">Provider</th>
                        <th className="text-left py-2 px-4">Department</th>
                        <th className="text-left py-2 px-4">Status</th>
                        <th className="text-left py-2 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appointment) => (
                        <tr key={appointment.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-4">{new Date(appointment.date).toLocaleDateString()}</td>
                          <td className="py-2 px-4">{appointment.time}</td>
                          <td className="py-2 px-4">{appointment.provider}</td>
                          <td className="py-2 px-4">{appointment.department}</td>
                          <td className="py-2 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                appointment.status === "Scheduled"
                                  ? "bg-blue-100 text-blue-800"
                                  : appointment.status === "Completed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {appointment.status}
                            </span>
                          </td>
                          <td className="py-2 px-4">
                            <Button variant="outline" size="sm">
                              Reschedule
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No appointments scheduled.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Conversations Tab */}
        <TabsContent value="conversations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>AI Conversations</CardTitle>
              <Button asChild>
                <a href="/chat">New Conversation</a>
              </Button>
            </CardHeader>
            <CardContent>
              {conversations.length > 0 ? (
                <div className="space-y-4">
                  {conversations.map((conversation) => (
                    <div key={conversation.id} className="border rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <MessageSquare className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-sm text-gray-500">
                          {new Date(`${conversation.date} ${conversation.time}`).toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg mb-2">
                        <p className="font-medium text-sm">You asked:</p>
                        <p>{conversation.userMessage}</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="font-medium text-sm">AI response:</p>
                        <p>{conversation.aiResponse}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No AI conversations available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
