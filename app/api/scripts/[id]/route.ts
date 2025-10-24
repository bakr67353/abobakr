import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: script, error } = await supabase.from("scripts").select("*").eq("id", params.id).single()

    if (error) {
      console.error("[v0] Error fetching script:", error)
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
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("scripts")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating script:", error)
      return NextResponse.json({ error: "Script not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, script: data })
  } catch (error) {
    console.error("[v0] Error in PUT /api/scripts/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("scripts").delete().eq("id", params.id)

    if (error) {
      console.error("[v0] Error deleting script:", error)
      return NextResponse.json({ error: "Script not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in DELETE /api/scripts/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
