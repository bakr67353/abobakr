import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    try {
      const supabase = await createClient()
      const { data: script, error } = await supabase.from("scripts").select("*").eq("id", params.id).single()

      if (!error && script) {
        return NextResponse.json({ script })
      }
    } catch (supabaseError) {
      console.log("[v0] Supabase not available, falling back to mock scripts")
    }

    const scripts = readMockScripts()
    const script = scripts.find((s: any) => s.id === params.id)
    if (!script) {
      return NextResponse.json({ error: "Script not found" }, { status: 404 })
    }
    return NextResponse.json({ script })
  } catch (error) {
    console.error("[v0] Error in GET /api/scripts/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()

    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from("scripts")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", params.id)
        .select()
        .single()

      if (!error && data) {
        return NextResponse.json({ success: true, script: data })
      }
    } catch (supabaseError) {
      console.log("[v0] Supabase not available, updating mock scripts")
    }

    const scripts = readMockScripts()
    const scriptIndex = scripts.findIndex((s: any) => s.id === params.id)
    if (scriptIndex === -1) {
      return NextResponse.json({ error: "Script not found" }, { status: 404 })
    }

    scripts[scriptIndex] = {
      ...scripts[scriptIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    }
    writeMockScripts(scripts)
    return NextResponse.json({ success: true, script: scripts[scriptIndex] })
  } catch (error) {
    console.error("[v0] Error in PUT /api/scripts/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    try {
      const supabase = await createClient()
      const { error } = await supabase.from("scripts").delete().eq("id", params.id)

      if (!error) {
        return NextResponse.json({ success: true })
      }
    } catch (supabaseError) {
      console.log("[v0] Supabase not available, deleting from mock scripts")
    }

    const scripts = readMockScripts()
    const scriptIndex = scripts.findIndex((s: any) => s.id === params.id)
    if (scriptIndex === -1) {
      return NextResponse.json({ error: "Script not found" }, { status: 404 })
    }

    scripts.splice(scriptIndex, 1)
    writeMockScripts(scripts)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in DELETE /api/scripts/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
