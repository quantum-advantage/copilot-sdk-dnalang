import type React from "react"
import type { Metadata, Viewport } from "next"
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { MobileNav } from "@/components/mobile-nav"
import { QuantumMetricsBar } from "@/components/quantum-metrics-bar"
import { SkipLink } from "@/components/ui/skip-link"
import { ToastProvider } from "@/components/ui/toast-provider"

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
})

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
})

export const metadata: Metadata = {
  title: "DNA::}{::lang — Sovereign Quantum SDK | Agile Defense Systems",
  description:
    "5 validated breakthroughs. 27+ IBM Quantum experiments. 256-atom QuEra decoding. Multi-agent OSIRIS runtime with zero-token sovereignty. Built by Agile Defense Systems (CAGE 9HUP5).",
  generator: "OSIRIS Gen 5.2",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0a",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} font-sans antialiased`}>
        <SkipLink />
        <ToastProvider>
          <Navigation />
          <QuantumMetricsBar />
          <main id="main-content" tabIndex={-1} className="focus:outline-none pb-20 md:pb-0">
            {children}
          </main>
          <MobileNav />
        </ToastProvider>
      </body>
    </html>
  )
}
