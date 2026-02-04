"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

// Mock patient data
const MOCK_PATIENTS = [
  {
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
  {
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
  {
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
]

export default function PatientsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredPatients, setFilteredPatients] = useState(MOCK_PATIENTS)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/signin?callbackUrl=/patients")
      return
    }

    // Only clinicians and admins can access the patients list
    if (!isLoading && user && user.role === "patient") {
      router.push("/dashboard")
      return
    }
  }, [isLoading, user, router])

  useEffect(() => {
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase()
      const filtered = MOCK_PATIENTS.filter(
        (patient) =>
          patient.firstName.toLowerCase().includes(lowercaseSearch) ||
          patient.lastName.toLowerCase().includes(lowercaseSearch) ||
          patient.email.toLowerCase().includes(lowercaseSearch) ||
          `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(lowercaseSearch),
      )
      setFilteredPatients(filtered)
    } else {
      setFilteredPatients(MOCK_PATIENTS)
    }
  }, [searchTerm])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user || user.role === "patient") {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Patients</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search patients..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button>Add New Patient</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">DOB</th>
                  <th className="text-left py-3 px-4">Gender</th>
                  <th className="text-left py-3 px-4">Contact</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">
                        {patient.firstName} {patient.lastName}
                      </div>
                    </td>
                    <td className="py-3 px-4">{new Date(patient.dateOfBirth).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{patient.gender}</td>
                    <td className="py-3 px-4">
                      <div>{patient.email}</div>
                      <div className="text-sm text-gray-500">{patient.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/patients/${patient.id}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
