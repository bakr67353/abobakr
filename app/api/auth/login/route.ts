import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"
import fs from "fs"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Try Supabase first
    try {
      const supabase = await createClient()

      const { data: users, error: queryError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("active", true)

      if (!queryError && users && users.length > 0) {
        const user = users[0]

        // Check password - handle both hashed and plain text for migration
        const passwordValid = user.password.startsWith('$2b$')
          ? await bcrypt.compare(password, user.password)
          : user.password === password

        if (passwordValid) {
          return NextResponse.json({
            success: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              active: user.active,
            },
          })
        }
      }
    } catch (supabaseError) {
      console.log("[v0] Supabase not available, falling back to mock data")
    }

    // Fallback to mock data
    const mockUsersPath = path.join(process.cwd(), "mock-users.json")
    const mockUsersData = fs.readFileSync(mockUsersPath, "utf-8")
    const mockUsers = JSON.parse(mockUsersData)

    const user = mockUsers.find((u: any) => u.email === email && u.active)

    if (user && (user.password === password || await bcrypt.compare(password, user.password || ""))) {
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          active: user.active,
        },
      })
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    console.error("[v0] Error in POST /api/auth/login:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
