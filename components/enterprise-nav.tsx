"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function EnterpriseNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="enterprise-nav sticky top-0 z-50 border-b border-border">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-[#0F62FE] to-[#10b981] rounded-lg" />
            <span className="text-lg font-bold dnalang-branding">DNA::&#125;&#123;::lang</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  Products <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link href="/quantum-os">Quantum OS</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dna-lang">DNA-Lang</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/quantum-hardware">Hardware</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  Solutions <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link href="/analytics">Analytics & Monitoring</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/cli">CLI Tools</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/aura">Aura AI</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/docs">
              <Button variant="ghost" size="sm">
                Docs
              </Button>
            </Link>

            <Link href="/pricing">
              <Button variant="ghost" size="sm">
                Pricing
              </Button>
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
            <Button size="sm" className="btn-enterprise-primary">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 space-y-1 border-t border-border">
            <Link href="/quantum-os" className="block px-3 py-2.5 hover:bg-muted rounded-md transition-colors">
              Quantum OS
            </Link>
            <Link href="/dna-lang" className="block px-3 py-2.5 hover:bg-muted rounded-md transition-colors">
              DNA-Lang
            </Link>
            <Link href="/quantum-hardware" className="block px-3 py-2.5 hover:bg-muted rounded-md transition-colors">
              Hardware
            </Link>
            <Link href="/analytics" className="block px-3 py-2.5 hover:bg-muted rounded-md transition-colors">
              Analytics & Monitoring
            </Link>
            <Link href="/cli" className="block px-3 py-2.5 hover:bg-muted rounded-md transition-colors">
              CLI Tools
            </Link>
            <Link href="/aura" className="block px-3 py-2.5 hover:bg-muted rounded-md transition-colors">
              Aura AI
            </Link>
            <Link href="/docs" className="block px-3 py-2.5 hover:bg-muted rounded-md transition-colors">
              Documentation
            </Link>
            <div className="pt-3 space-y-2">
              <Button variant="outline" className="w-full bg-transparent">
                Sign In
              </Button>
              <Button className="btn-enterprise-primary w-full">Get Started</Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
