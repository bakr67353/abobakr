import { Resend } from "resend"

export interface Email {
  id: string
  from: string
  fromName: string
  to: string
  subject: string
  body: string
  sentAt: Date
  status: "sent" | "failed" | "pending"
  apiProvider: string
  errorMessage?: string
}

const sentEmails: Email[] = []

const RESEND_API_KEY = "re_cxY2DnxR_5ETecUH4PhJ8mofdqb3LMHBT"
const resend = new Resend(RESEND_API_KEY)
const FROM_EMAIL = "noreply@abobakrmohamed.store"

export async function sendEmail(
  email: Omit<Email, "id" | "sentAt" | "status" | "apiProvider" | "errorMessage">,
): Promise<Email> {
  const newEmail: Email = {
    ...email,
    id: String(Date.now()),
    sentAt: new Date(),
    status: "pending",
    apiProvider: "Resend",
  }

  console.log("[v0] Sending email using Resend:", {
    from: email.from,
    to: email.to,
    subject: email.subject,
  })

  try {
    const response = await resend.emails.send({
      from: `${email.fromName} <${FROM_EMAIL}>`,
      to: email.to,
      subject: email.subject,
      html: email.body,
    })

    if (response.error) {
      throw new Error(response.error.message)
    }

    console.log("[v0] Email sent successfully via Resend:", response.data)
    newEmail.status = "sent"
  } catch (error: any) {
    console.error("[v0] Resend error:", error.message)
    newEmail.status = "failed"
    newEmail.errorMessage = error.message || "Unknown error"
    throw new Error(newEmail.errorMessage)
  }

  sentEmails.push(newEmail)
  return newEmail
}

export function getSentEmails(userEmail: string): Email[] {
  return sentEmails.filter((e) => e.from === userEmail)
}

export function getAllSentEmails(): Email[] {
  return sentEmails
}
