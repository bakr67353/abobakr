import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { randomUUID } from "crypto"
import { createClient } from "@/lib/supabase/server"

const mockScriptsPath = path.join(process.cwd(), "mock-scripts.json")

function readMockScripts() {
  try {
    if (!fs.existsSync(mockScriptsPath)) {
      fs.writeFileSync(mockScriptsPath, "[]", "utf-8")
    }
    const data = fs.readFileSync(mockScriptsPath, "utf-8")
    return JSON.parse(data)
  } catch (error) {
    console.error("[v0] Error reading mock scripts:", error)
    return []
  }
}

function writeMockScripts(scripts: any[]) {
  try {
    if (!fs.existsSync(mockScriptsPath)) {
      fs.writeFileSync(mockScriptsPath, "[]", "utf-8")
    }
    fs.writeFileSync(mockScriptsPath, JSON.stringify(scripts, null, 2), "utf-8")
  } catch (error) {
    console.error("[v0] Error writing mock scripts:", error)
  }
}

export async function GET(request: NextRequest) {
  try {
    try {
      const supabase = await createClient()
      const { data: scripts, error } = await supabase.from("scripts").select("*")
      if (!error && scripts) {
        return NextResponse.json({ scripts })
      }
    } catch (supabaseError) {
      console.log("[v0] Supabase not available, falling back to mock scripts")
    }
    const scripts = readMockScripts()
    return NextResponse.json({ scripts })
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

    try {
      const supabase = await createClient()
      const { data: script, error } = await supabase
        .from("scripts")
        .insert({
          name,
          subject,
          body,
          user_id: user_id || null,
        })
        .select()
        .single()
      if (!error && script) {
        console.log("[v0] Script created successfully:", script)
        return NextResponse.json({ success: true, script })
      }
    } catch (supabaseError) {
      console.log("[v0] Supabase not available, writing to mock scripts")
    }

    const scripts = readMockScripts()
    const newScript = {
      id: randomUUID(),
      name,
      subject,
      body,
      user_id: user_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    scripts.push(newScript)
    writeMockScripts(scripts)
    return NextResponse.json({ success: true, script: newScript })
  } catch (error) {
    console.error("[v0] Error in POST /api/scripts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
