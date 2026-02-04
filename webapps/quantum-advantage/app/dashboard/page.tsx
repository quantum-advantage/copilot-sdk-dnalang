"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FileText, Dna, MessageSquare, Clock, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth/auth-context"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/signin?callbackUrl=/dashboard")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Patients</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-gray-500">{user.role === "patient" ? "Your profile" : "Total patients"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reports</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-gray-500">Medical reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Genomic Reports</CardTitle>
            <Dna className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-gray-500">Genomic test results</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">AI Interactions</CardTitle>
            <MessageSquare className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-gray-500">AI assistant conversations</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center text-amber-800">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
              High-Risk Variants
            </CardTitle>
            <CardDescription className="text-amber-700">
              3 variants with high reclassification probability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-700 mb-4">
              Specific recommendations available for variants with high likelihood of reclassification in the near
              future.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100">
              <Link href="/variant-recommendations">View Recommendations</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Conflict Resolution Evolution</CardTitle>
            <CardDescription>Track how variant classification approaches have evolved over time</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Understand how conflict resolution methodologies have improved and their impact on classification
              reliability.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/conflict-evolution" className="text-blue-600 hover:underline flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              View Evolution Tracker
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg font-medium">
              <Dna className="mr-2 h-5 w-5 text-blue-600" />
              Genetic Timeline
            </CardTitle>
            <p className="text-sm text-gray-500">Chronological view of genetic findings</p>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="text-2xl font-bold">20 Findings</div>
              <div className="text-sm text-gray-500">Across 4 test reports</div>
            </div>
            <Button variant="outline" asChild className="w-full">
              <Link href="/genetic-timeline">View Genetic Timeline</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Patients</CardTitle>
            <p className="text-sm text-gray-500">{user.role === "patient" ? "Your profile" : "Recent patients"}</p>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-gray-200">
              <li className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">John Smith</p>
                  <p className="text-sm text-gray-500">DOB: 05/12/1980</p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/patients/1">View</Link>
                </Button>
              </li>
              <li className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">Sarah Johnson</p>
                  <p className="text-sm text-gray-500">DOB: 10/23/1975</p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/patients/2">View</Link>
                </Button>
              </li>
              <li className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">Michael Brown</p>
                  <p className="text-sm text-gray-500">DOB: 03/15/1990</p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/patients/3">View</Link>
                </Button>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <p className="text-sm text-gray-500">Latest reports and conversations</p>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-gray-200">
              <li className="py-3 flex items-start">
                <div className="mr-4 mt-1">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">New medical report</p>
                  <p className="text-sm text-gray-500">Complete Blood Count - 05/10/2023</p>
                </div>
              </li>
              <li className="py-3 flex items-start">
                <div className="mr-4 mt-1">
                  <Dna className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium">New genomic report</p>
                  <p className="text-sm text-gray-500">Genetic Panel - 04/28/2023</p>
                </div>
              </li>
              <li className="py-3 flex items-start">
                <div className="mr-4 mt-1">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">AI Conversation</p>
                  <p className="text-sm text-gray-500 truncate">Q: What do my latest test results mean?</p>
                  <p className="text-xs text-gray-400">05/15/2023, 2:45 PM</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
