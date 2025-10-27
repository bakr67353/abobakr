"use client"

import { ProtectedRoute } from "@/components/auth-wrapper"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Mail, FileText } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  return (
    <ProtectedRoute requireAdmin>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, scripts, and email history</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/users">
                <Button className="w-full">Manage Users</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Script Management
              </CardTitle>
              <CardDescription>View and manage email scripts</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/scripts">
                <Button className="w-full">Manage Scripts</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email History
              </CardTitle>
              <CardDescription>View sent email history</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/email-history">
                <Button className="w-full">View History</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
