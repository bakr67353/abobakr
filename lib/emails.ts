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

