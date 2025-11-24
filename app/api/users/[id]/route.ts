import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import fs from "fs"
import path from "path"

const mockUsersPath = path.join(process.cwd(), "mock-users.json")

function readMockUsers() {
  try {
    if (!fs.existsSync(mockUsersPath)) {
      fs.writeFileSync(mockUsersPath, "[]", "utf-8")
    }
    const data = fs.readFileSync(mockUsersPath, "utf-8")
    return JSON.parse(data)
  } catch (error) {
    console.error("[v0] Error reading mock users:", error)
    return []
  }
}

function writeMockUsers(users: any[]) {
  try {
    if (!fs.existsSync(mockUsersPath)) {
      fs.writeFileSync(mockUsersPath, "[]", "utf-8")
    }
    fs.writeFileSync(mockUsersPath, JSON.stringify(users, null, 2), "utf-8")
  } catch (error) {
    console.error("[v0] Error writing mock users:", error)
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()

    try {
      const supabase = await createClient()
      const { data, error } = await supabase.from("users").update(updates).eq("id", params.id).select().single()

      if (!error && data) {
        return NextResponse.json({ success: true, user: data })
      }
    } catch (supabaseError) {
      console.log("[v0] Supabase not available, updating mock users")
    }

    const mockUsers = readMockUsers()
    const userIndex = mockUsers.findIndex((u: any) => u.id === params.id)
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates }
    writeMockUsers(mockUsers)
    return NextResponse.json({ success: true, user: mockUsers[userIndex] })
  } catch (error) {
    console.error("[v0] Error in PUT /api/users/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    try {
      const supabase = await createClient()
      const { error } = await supabase.from("users").delete().eq("id", params.id)

      if (!error) {
        return NextResponse.json({ success: true })
      }
    } catch (supabaseError) {
      console.log("[v0] Supabase not available, deleting from mock users")
    }

    const mockUsers = readMockUsers()
    const userIndex = mockUsers.findIndex((u: any) => u.id === params.id)
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    mockUsers.splice(userIndex, 1)
    writeMockUsers(mockUsers)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in DELETE /api/users/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
