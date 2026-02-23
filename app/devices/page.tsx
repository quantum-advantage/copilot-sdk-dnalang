"use client"

import { ScimitarDeviceArchitecture } from "@/components/scimitar-device-architecture"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function DevicesPage() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Device Architecture</h1>
            <p className="text-sm text-muted-foreground">
              Scimitar Elite Wireless SE & WIRELESS-REPEATER Bifurcated System
            </p>
          </div>
        </div>

        {/* Device Architecture Component */}
        <ScimitarDeviceArchitecture />
      </div>
    </div>
  )
}
