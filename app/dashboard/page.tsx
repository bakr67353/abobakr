"use client"

import { ProtectedRoute } from "@/components/auth-wrapper"
import { DashboardLayout } from "@/components/dashboard-layout"
import { UserDashboard } from "@/components/user-dashboard"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <UserDashboard />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
