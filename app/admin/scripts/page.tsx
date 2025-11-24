"use client"

import { ProtectedRoute } from "@/components/auth-wrapper"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ScriptManagement } from "@/components/script-management"

export default function AdminScriptsPage() {
  return (
    <ProtectedRoute requireAdmin>
      <DashboardLayout>
        <ScriptManagement />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
