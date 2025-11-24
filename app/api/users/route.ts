import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"
import fs from "fs"
import path from "path"

export async function GET(request: NextRequest) {
  try {
    // Try Supabase first
    try {
      const supabase = await createClient()
      const { data: users, error } = await supabase.from("users").select("*")

      if (!error && users) {
        return NextResponse.json({ users })
      }
    } catch (supabaseError) {
      console.log("[v0] Supabase not available, falling back to mock data")
    }

    // Fallback to mock data
    const mockUsersPath = path.join(process.cwd(), "mock-users.json")
    const mockUsersData = fs.readFileSync(mockUsersPath, "utf-8")
    const mockUsers = JSON.parse(mockUsersData)

    return NextResponse.json({ users: mockUsers })
  } catch (error) {
    console.error("[v0] Error in GET /api/users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, role, active } = body

    console.log("[v0] Creating user with data:", { email, password, name, role, active })

    if (!email || email.trim() === "") {
      return NextResponse.json({ error: "Missing required fields: email is required" }, { status: 400 })
    }
    if (!password || password.trim() === "") {
      return NextResponse.json({ error: "Missing required fields: password is required" }, { status: 400 })
    }
    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Missing required fields: name is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if email already exists in Supabase
    const { data: existingUsers, error: checkError } = await supabase.from("users").select("*").eq("email", email.trim())

    if (checkError) {
      console.error("[v0] Error checking existing user:", checkError)
      return NextResponse.json({ error: "Failed to check existing users" }, { status: 500 })
    }

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user in Supabase
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        email: email.trim(),
        password: hashedPassword,
        name: name.trim(),
        role: role || "user",
        active: active !== undefined ? active : true,
      })
      .select()
      .single()

    if (createError) {
      console.error("[v0] Error creating user:", createError)
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    console.log("[v0] User created successfully:", newUser)
    return NextResponse.json({ user: newUser }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error in POST /api/users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
