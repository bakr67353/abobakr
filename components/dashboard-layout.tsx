"use client"

import type React from "react"

import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { LogOut, Mail, Users, FileText, LayoutDashboard } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const isAdmin = user?.role === "admin"

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Mail className="h-6 w-6" />
            <h1 className="text-xl font-bold">EmailHub</h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard">
            <Button variant={pathname === "/dashboard" ? "secondary" : "ghost"} className="w-full justify-start">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>

          {isAdmin && (
            <>
              <Link href="/admin/users">
                <Button variant={pathname === "/admin/users" ? "secondary" : "ghost"} className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/admin/scripts">
                <Button
                  variant={pathname === "/admin/scripts" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Email Scripts
                </Button>
              </Link>
              <Link href="/admin/email-history">
                <Button
                  variant={pathname === "/admin/email-history" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Email History
                </Button>
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="mb-4 p-3 bg-muted rounded-md">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground mt-1 capitalize">Role: {user?.role}</p>
          </div>
          <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
