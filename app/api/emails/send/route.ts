import { type NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/emails"
import { replaceTemplateVariables } from "@/lib/email-scripts"

export async function POST(request: NextRequest) {
  try {
    const { from, fromName, to, subject, body, variables } = await request.json()

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
    })

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
