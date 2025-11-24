import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { sendEmail } from "@/lib/smtp"
import { replaceTemplateVariables } from "@/lib/email-scripts"
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

function writeMockEmailHistory(emails: StoredEmail[]) {
  try {
    ensureMockEmailHistoryFile()
    fs.writeFileSync(mockEmailHistoryPath, JSON.stringify(emails, null, 2), "utf-8")
  } catch (error) {
    console.error("[v0] Failed to write mock email history:", error)
  }
}

function serializeEmail(email: Email): StoredEmail {
  return {
    ...email,
    sentAt: email.sentAt.toISOString(),
  }
}

async function persistEmail(email: Email) {
  if (hasSupabaseConfig) {
    try {
      const supabase = await createClient()
      const payload = {
        id: email.id,
        from_email: email.from,
        from_name: email.fromName,
        to_email: email.to,
        subject: email.subject,
        body: email.body,
        attachments: email.attachments ?? null,
        sent_at: email.sentAt.toISOString(),
        status: email.status,
        api_provider: email.apiProvider,
        error_message: email.errorMessage ?? null,
      }

      const { error } = await supabase.from("email_history").insert(payload)
      if (!error) {
        return
      }
      console.error("[v0] Supabase email history insert error:", error)
    } catch (supabaseError) {
      console.log("[v0] Supabase not available, storing email history locally")
    }
  }

  const history = readMockEmailHistory()
  history.push(serializeEmail(email))
  writeMockEmailHistory(history)
}

export async function POST(request: NextRequest) {
  try {
    const { from, fromName, to, subject, body, variables, attachments } = await request.json()

    if (!from || !to || !subject || !body) {
      return NextResponse.json({ error: "From, to, subject, and body are required" }, { status: 400 })
    }

    // Replace template variables if provided
    const finalSubject = variables ? replaceTemplateVariables(subject, variables) : subject
    const finalBody = variables ? replaceTemplateVariables(body, variables) : body

    const email = await sendEmail({
      from,
      fromName: fromName || from,
      to,
      subject: finalSubject,
      body: finalBody,
      attachments,
    })

    await persistEmail(email)

    return NextResponse.json({
      success: email.status === "sent",
      email: {
        id: email.id,
        status: email.status,
        sentAt: email.sentAt,
        errorMessage: email.errorMessage,
      },
    })
  } catch (error) {
    console.error("[v0] Error in send email route:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 },
    )
  }
}
