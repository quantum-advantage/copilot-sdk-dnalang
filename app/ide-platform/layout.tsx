import type React from "react"
import type { Metadata } from "next"
import { IDESidebar } from "@/components/ide-sidebar"

export const metadata: Metadata = {
  title: "IDE Platform - DNA::}{::lang",
  description: "Build your own biological IDE with DNA-Lang's quantum computing paradigms",
}

export default function IDEPlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <IDESidebar />
      <main className="flex-1 md:ml-14 lg:ml-56 transition-all duration-300 pb-20 md:pb-0">{children}</main>
    </div>
  )
}
