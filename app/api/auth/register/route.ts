import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: existingUsers, error: checkError } = await supabase.from("users").select("*").eq("email", email)

    if (checkError) {
      console.error("[v0] Error checking existing user:", checkError)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }

    if (existingUsers && existingUsers.length > 0) {
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

    if (createError) {
      console.error("[v0] Error creating user:", createError)
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

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
