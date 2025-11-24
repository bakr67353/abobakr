import nodemailer from "nodemailer"

export interface Email {
  id: string
  from: string
  fromName: string
  to: string
  subject: string
  body: string
  attachments?: EmailAttachment[]
  sentAt: Date
  status: "sent" | "failed" | "pending"
  apiProvider: string
  errorMessage?: string
}

export interface EmailAttachment {
  filename: string
  content: string // base64 encoded
  type: string
}

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "bakrwork67350@gmail.com",
    pass: "imhtzmovwebqizfs",
  },
})

export async function sendEmail(
  email: Omit<Email, "id" | "sentAt" | "status" | "apiProvider" | "errorMessage">,
): Promise<Email> {
  const newEmail: Email = {
    ...email,
    id: String(Date.now()),
    sentAt: new Date(),
    status: "pending",
    apiProvider: "SMTP",
  }

  console.log("[v0] Sending email using SMTP:", {
    from: email.from,
    to: email.to,
    subject: email.subject,
    attachments: email.attachments?.length || 0,
  })

  try {
    const mailOptions: any = {
      from: `"${email.fromName}" <bakrwork67350@gmail.com>`,
      to: email.to,
      subject: email.subject,
      html: email.body,
    }

    // Add attachments if provided
    if (email.attachments && email.attachments.length > 0) {
      mailOptions.attachments = email.attachments.map(attachment => ({
        filename: attachment.filename,
        content: Buffer.from(attachment.content, 'base64'),
        type: attachment.type,
      }))
    }

    const info = await transporter.sendMail(mailOptions)

    console.log("[v0] Email sent successfully via SMTP:", info.messageId)
    newEmail.status = "sent"
  } catch (error: any) {
    console.error("[v0] SMTP error:", error.message)
    newEmail.status = "failed"
    newEmail.errorMessage = error.message || "Unknown error"
    throw new Error(newEmail.errorMessage)
  }

  return newEmail
}
