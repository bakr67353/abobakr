"use client"

import { ProtectedRoute } from "@/components/auth-wrapper"
import { DashboardLayout } from "@/components/dashboard-layout"
import { UserManagement } from "@/components/user-management"

export default function AdminUsersPage() {
  return (
    <ProtectedRoute requireAdmin>
      <DashboardLayout>
        <UserManagement />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
