import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { type Email } from "@/lib/emails"
import { createClient } from "@/lib/supabase/server"

const mockEmailHistoryPath = path.join(process.cwd(), "mock-email-history.json")
const hasSupabaseConfig = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

type StoredEmail = Omit<Email, "sentAt"> & { sentAt: string }

function ensureMockEmailHistoryFile() {
  if (!fs.existsSync(mockEmailHistoryPath)) {
    fs.writeFileSync(mockEmailHistoryPath, "[]", "utf-8")
  }
}

function readMockEmailHistory(): StoredEmail[] {
  try {
    ensureMockEmailHistoryFile()
    const data = fs.readFileSync(mockEmailHistoryPath, "utf-8")
    return JSON.parse(data)
  } catch (error) {
    console.error("[v0] Failed to read mock email history:", error)
    return []
  }
}

function mapSupabaseRow(row: any): StoredEmail {
  return {
    id: row.id,
    from: row.from_email,
    fromName: row.from_name ?? row.from_email,
    to: row.to_email,
    subject: row.subject,
    body: row.body,
    attachments: row.attachments ?? undefined,
    sentAt: row.sent_at,
    status: row.status,
    apiProvider: row.api_provider,
    errorMessage: row.error_message ?? undefined,
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userEmail = searchParams.get("userEmail")

    if (hasSupabaseConfig) {
      try {
        const supabase = await createClient()
        let query = supabase.from("email_history").select("*").order("sent_at", { ascending: false })
        if (userEmail) {
          query = query.eq("from_email", userEmail)
        }
        const { data, error } = await query
        if (!error && data) {
          return NextResponse.json({ emails: data.map(mapSupabaseRow) })
        }
        console.error("[v0] Supabase email history fetch error:", error)
      } catch (supabaseError) {
        console.log("[v0] Supabase not available, falling back to mock email history")
      }
    }

    const emails = readMockEmailHistory()
    const filtered = userEmail ? emails.filter((email) => email.from === userEmail) : emails
    return NextResponse.json({ emails: filtered })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
