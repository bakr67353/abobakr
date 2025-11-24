"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, Mail, Clock, Paperclip, X } from "lucide-react"
import { getAllScripts, type EmailScript } from "@/lib/email-scripts"
import { type EmailAttachment, type Email } from "@/lib/emails"

export function UserDashboard() {
  const { user } = useAuth()
  const [scripts, setScripts] = useState<EmailScript[]>([])
  const [scriptsLoading, setScriptsLoading] = useState(true)
  const [selectedScript, setSelectedScript] = useState("")
  const [to, setTo] = useState("") // Removed locked email, now accepts any email
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [attachments, setAttachments] = useState<EmailAttachment[]>([])
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  // Handle paste events for images
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type.indexOf('image') !== -1) {
          event.preventDefault()
          const file = item.getAsFile()
          if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
              const content = e.target?.result as string
              const base64Content = content.split(',')[1] // Remove data:image/jpeg;base64, prefix

              const attachment: EmailAttachment = {
                filename: `pasted-image-${Date.now()}.${file.type.split('/')[1]}`,
                content: base64Content,
                type: file.type,
              }

              setAttachments(prev => [...prev, attachment])
            }
            reader.readAsDataURL(file)
          }
        }
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [])

  const [sentEmails, setSentEmails] = useState<Email[]>([])

  const normalizeEmails = (emails: any[]): Email[] =>
    emails.map((email) => ({
      ...email,
      sentAt: new Date(email.sentAt),
    }))

  useEffect(() => {
    const fetchSentEmails = async () => {
      try {
        const response = await fetch(`/api/emails/history?userEmail=${user?.email || ""}`)
        const data = await response.json()
        setSentEmails(normalizeEmails(data.emails || []))
      } catch (error) {
        console.error('Failed to fetch sent emails:', error)
      }
    }

    if (user?.email) {
      fetchSentEmails()
    }
  }, [user?.email])

  useEffect(() => {
    loadScripts()
  }, [])

  const loadScripts = async () => {
    setScriptsLoading(true)
    try {
      const fetchedScripts = await getAllScripts()
      setScripts(fetchedScripts)
    } catch (error) {
      console.error('Failed to load scripts:', error)
    } finally {
      setScriptsLoading(false)
    }
  }

  const handleScriptChange = (scriptId: string) => {
    setSelectedScript(scriptId)
    const script = scripts.find((s) => s.id === scriptId)
    if (script) {
      setSubject(script.subject)
      setBody(script.body)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const base64Content = content.split(',')[1] // Remove data:image/jpeg;base64, prefix

        const attachment: EmailAttachment = {
          filename: file.name,
          content: base64Content,
          type: file.type,
        }

        setAttachments(prev => [...prev, attachment])
      }
      reader.readAsDataURL(file)
    })

    // Reset input
    event.target.value = ''
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleSend = async () => {
    setSending(true)
    setSuccess(false)
    setError("")

    try {
      const response = await fetch("/api/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: user?.email || "",
          fromName: user?.name || "",
          to,
          subject,
          body,
          attachments: attachments.length > 0 ? attachments : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to send email")
      }

      setTo("")
      setSubject("")
      setBody("")
      setSelectedScript("")
      setAttachments([])
      setSuccess(true)

      // Refresh the sent emails list after sending
      const fetchSentEmails = async () => {
        try {
          const response = await fetch(`/api/emails/history?userEmail=${user?.email || ""}`)
          const data = await response.json()
          setSentEmails(normalizeEmails(data.emails || []))
        } catch (error) {
          console.error('Failed to fetch sent emails:', error)
        }
      }
      fetchSentEmails()

      setTimeout(() => {
        setSuccess(false)
      }, 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send email"
      setError(errorMessage)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Send Email</h1>
        <p className="text-muted-foreground mt-1">Compose and send emails using templates</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Compose Email</CardTitle>
            <CardDescription>Select a template or write your own message</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template">Email Template</Label>
              <Select value={selectedScript} onValueChange={handleScriptChange}>
                <SelectTrigger id="template">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {scripts.map((script) => (
                    <SelectItem key={script.id} value={script.id}>
                      {script.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                type="email"
                placeholder="recipient@example.com"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                placeholder="Email body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachments">Attachments</Label>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  You can paste images directly (Ctrl+V) or select files
                </div>
                <Input
                  id="attachments"
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
                {attachments.length > 0 && (
                  <div className="space-y-1">
                    {attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm flex-1 truncate">{attachment.filename}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {success && (
              <div className="text-sm text-green-600 bg-green-50 dark:bg-green-950/20 p-3 rounded-md">
                Email sent successfully!
              </div>
            )}

            {error && <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/20 p-3 rounded-md">{error}</div>}

            <Button onClick={handleSend} disabled={!to || !subject || !body || sending} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              {sending ? "Sending..." : "Send Email"}
              {attachments.length > 0 && ` (${attachments.length} attachment${attachments.length > 1 ? 's' : ''})`}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Emails</CardTitle>
            <CardDescription>Your recently sent emails</CardDescription>
          </CardHeader>
          <CardContent>
            {sentEmails.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No emails sent yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sentEmails
                  .slice(-5)
                  .reverse()
                  .map((email) => (
                    <div key={email.id} className="p-3 border border-border rounded-md space-y-1">
                      <div className="flex items-start justify-between">
                        <p className="font-medium text-sm">{email.subject}</p>
                        <span className="text-xs text-green-600 bg-green-50 dark:bg-green-950/20 px-2 py-1 rounded">
                          {email.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">To: {email.to}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {email.sentAt.toLocaleString()}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
