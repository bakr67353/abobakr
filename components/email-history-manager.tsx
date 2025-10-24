"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getAllSentEmails } from "@/lib/emails"
import { Mail, Search, Clock, User, Send } from "lucide-react"

export function EmailHistoryManager() {
  const [searchTerm, setSearchTerm] = useState("")
  const allEmails = getAllSentEmails()

  const filteredEmails = allEmails.filter(
    (email) =>
      email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.fromName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email History</h1>
        <p className="text-muted-foreground mt-1">View all emails sent by all users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sent Emails ({allEmails.length})</CardTitle>
          <CardDescription>Complete history of all emails sent through the system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by sender, recipient, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {filteredEmails.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="h-16 w-16 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No emails found</p>
              <p className="text-sm">
                {allEmails.length === 0 ? "No emails have been sent yet" : "Try a different search term"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEmails
                .slice()
                .reverse()
                .map((email) => (
                  <div key={email.id} className="p-4 border border-border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <p className="font-semibold text-base">{email.subject}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            <span>
                              From: {email.fromName} ({email.from})
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Send className="h-3.5 w-3.5" />
                            <span>To: {email.to}</span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full ${
                          email.status === "sent"
                            ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                            : email.status === "failed"
                              ? "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                              : "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400"
                        }`}
                      >
                        {email.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {email.sentAt.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        via {email.apiProvider}
                      </div>
                    </div>

                    <details className="text-sm">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        View email body
                      </summary>
                      <div className="mt-2 p-3 bg-muted rounded-md whitespace-pre-wrap">{email.body}</div>
                    </details>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
