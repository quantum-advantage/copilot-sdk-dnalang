import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Assistant - DNA::}{::lang",
  description: "Quantum-enhanced AI assistant for DNA-Lang development with non-local language model integration",
}

export default function AIAssistantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
