"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function HomePage() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-4" variant="outline">
            Quantum-Enhanced Precision Medicine
          </Badge>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AGENT Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Adaptive Genomic Evidence Network for Trials - Revolutionizing precision medicine through AI-powered genomic
            analysis, real-time collaboration, and intelligent clinical decision support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/dashboard">View Dashboard</Link>
            </Button>
          </div>
          <p className="mt-8 text-gray-500">Counter: {count}</p>
          <Button onClick={() => setCount(count + 1)} className="mt-2">
            Increment
          </Button>
        </div>
      </section>

      <section className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Genomic Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">AI-powered genomic variant analysis with CPIC guidelines integration</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Patient Matching</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Intelligent patient-trial matching based on genomic profiles</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quantum Drug Discovery</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Quantum-enhanced molecular simulation and SAM analog synthesis</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
