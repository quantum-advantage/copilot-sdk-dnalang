"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, Home, Users, Settings, Menu, X, MessageSquare, FileText, Atom } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"

export function Header() {
  const { user, logout, isLoading } = useAuth()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Skip rendering header on auth pages
  if (pathname.startsWith("/auth/")) {
    return null
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center font-semibold text-lg text-blue-600">
              AGENT Platform
            </Link>

            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              <Link
                href="/dashboard"
                className={`px-3 py-2 text-sm font-medium ${
                  pathname === "/dashboard" ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Dashboard
              </Link>

              <Link
                href="/chat"
                className={`px-3 py-2 text-sm font-medium ${
                  pathname === "/chat" ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                AI Assistant
              </Link>

              <Link
                href="/beaker-reports"
                className={`px-3 py-2 text-sm font-medium ${
                  pathname === "/beaker-reports" ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Beaker Reports
              </Link>

              <Link
                href="/quantum-drug-discovery"
                className={`px-3 py-2 text-sm font-medium ${
                  pathname === "/quantum-drug-discovery" ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Quantum Discovery
              </Link>

              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className={`px-3 py-2 text-sm font-medium ${
                    pathname.startsWith("/admin") ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Admin
                </Link>
              )}

              {(user?.role === "clinician" || user?.role === "admin") && (
                <Link
                  href="/patients"
                  className={`px-3 py-2 text-sm font-medium ${
                    pathname.startsWith("/patients") ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Patients
                </Link>
              )}
            </nav>
          </div>

          <div className="hidden md:flex md:items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.name || user.email}</DropdownMenuLabel>
                  <DropdownMenuLabel className="text-xs font-normal text-gray-500">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link href="/auth/signin">Sign in</Link>
              </Button>
            )}
          </div>

          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/dashboard"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === "/dashboard"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="inline-block mr-2 h-5 w-5" />
              Dashboard
            </Link>

            <Link
              href="/chat"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === "/chat" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <MessageSquare className="inline-block mr-2 h-5 w-5" />
              AI Assistant
            </Link>

            <Link
              href="/beaker-reports"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === "/beaker-reports"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <FileText className="inline-block mr-2 h-5 w-5" />
              Beaker Reports
            </Link>

            <Link
              href="/quantum-drug-discovery"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === "/quantum-drug-discovery"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Atom className="inline-block mr-2 h-5 w-5" />
              Quantum Discovery
            </Link>

            {user?.role === "admin" && (
              <Link
                href="/admin"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname.startsWith("/admin")
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings className="inline-block mr-2 h-5 w-5" />
                Admin
              </Link>
            )}

            {(user?.role === "clinician" || user?.role === "admin") && (
              <Link
                href="/patients"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname.startsWith("/patients")
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Users className="inline-block mr-2 h-5 w-5" />
                Patients
              </Link>
            )}
          </div>

          {user && (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="px-4 flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user.name || user.email}</div>
                  <div className="text-sm font-medium text-gray-500">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <Link
                  href="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    logout()
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
