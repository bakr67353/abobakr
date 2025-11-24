import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"
import fs from "fs"
import path from "path"
import { randomUUID } from "crypto"

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

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 })
    }

    // Try Supabase first
    try {
      const supabase = await createClient()

      const { data: existingUsers, error: checkError } = await supabase.from("users").select("*").eq("email", email)

      if (!checkError && existingUsers && existingUsers.length > 0) {
        return NextResponse.json({ error: "Email already exists" }, { status: 409 })
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10)

      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          email,
          password: hashedPassword,
          name,
          role: "user",
          active: true,
        })
        .select()
        .single()

      if (!createError && newUser) {
        return NextResponse.json({
          success: true,
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            active: newUser.active,
          },
        })
      }
    } catch (supabaseError) {
      console.log("[v0] Supabase not available, falling back to mock data")
    }

    // Fallback to mock data
    const mockUsers = readMockUsers()
    const existingUser = mockUsers.find((u: any) => u.email === email)

    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = {
      id: randomUUID(),
      email,
      password: hashedPassword,
      name,
      role: "user",
      active: true,
    }

    mockUsers.push(newUser)
    writeMockUsers(mockUsers)

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        active: newUser.active,
      },
    })
  } catch (error) {
    console.error("[v0] Error in POST /api/auth/register:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
