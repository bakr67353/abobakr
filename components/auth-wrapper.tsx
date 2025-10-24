"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Providers } from "@/app/providers"

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode
  requireAdmin?: boolean
}) {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    } else if (requireAdmin && user?.role !== "admin") {
      router.push("/dashboard")
    }
  }, [isAuthenticated, user, requireAdmin, router])

  if (!isAuthenticated || (requireAdmin && user?.role !== "admin")) {
    return null
  }

  return <>{children}</>
}
