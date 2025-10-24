import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: scripts, error } = await supabase.from("scripts").select("*")

    if (error) {
      console.error("[v0] Error fetching scripts:", error)
      return NextResponse.json({ error: "Failed to fetch scripts" }, { status: 500 })
    }

    return NextResponse.json({ scripts: scripts || [] })
  } catch (error) {
    console.error("[v0] Error in GET /api/scripts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, subject, body, user_id } = await request.json()

    if (!name || !subject || !body) {
      return NextResponse.json({ error: "Name, subject, and body are required" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: script, error } = await supabase
      .from("scripts")
      .insert({
        name,
        subject,
        body,
        user_id: user_id || "00000000-0000-0000-0000-000000000000", // Default for admin
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating script:", error)
      return NextResponse.json({ error: "Failed to create script" }, { status: 500 })
    }

    console.log("[v0] Script created successfully:", script)
    return NextResponse.json({ success: true, script })
  } catch (error) {
    console.error("[v0] Error in POST /api/scripts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
