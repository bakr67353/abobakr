"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { getAllScripts, createScript, updateScript, deleteScript, type EmailScript } from "@/lib/email-scripts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileText, Plus, Edit, Trash2, Calendar } from "lucide-react"

export function ScriptManagement() {
  const { user } = useAuth()
  const [scripts, setScripts] = useState<EmailScript[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingScript, setEditingScript] = useState<EmailScript | null>(null)
  const [form, setForm] = useState({ name: "", subject: "", body: "" })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadScripts()
  }, [])

  const loadScripts = async () => {
    setLoading(true)
    const fetchedScripts = await getAllScripts()
    setScripts(fetchedScripts)
    setLoading(false)
  }

  const handleCreate = async () => {
    if (form.name && form.subject && form.body && user?.id) {
      const newScript = await createScript({
        ...form,
        user_id: user.id,
      })
      if (newScript) {
        await loadScripts()
        setForm({ name: "", subject: "", body: "" })
        setIsCreateOpen(false)
      }
    }
  }

  const handleEdit = (script: EmailScript) => {
    setEditingScript(script)
    setForm({
      name: script.name,
      subject: script.subject,
      body: script.body,
    })
  }

  const handleSaveEdit = async () => {
    if (editingScript && form.name && form.subject && form.body) {
      const success = await updateScript(editingScript.id, form)
      if (success) {
        await loadScripts()
        setEditingScript(null)
        setForm({ name: "", subject: "", body: "" })
      }
    }
  }

  const handleDelete = async (scriptId: string) => {
    if (confirm("Are you sure you want to delete this script?")) {
      const success = await deleteScript(scriptId)
      if (success) {
        await loadScripts()
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Scripts</h1>
          <p className="text-muted-foreground mt-1">Manage email templates and scripts</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Script
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Email Script</DialogTitle>
              <DialogDescription>
                Create a new email template with variables like {`{{name}}`}, {`{{company}}`}, etc.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">Script Name</Label>
                <Input
                  id="create-name"
                  placeholder="e.g., Welcome Email"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-subject">Subject</Label>
                <Input
                  id="create-subject"
                  placeholder="e.g., Welcome to {{company}}!"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-body">Body</Label>
                <Textarea
                  id="create-body"
                  placeholder="Email body with {{variables}}"
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  rows={10}
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                Create Script
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {scripts.map((script) => (
          <Card key={script.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{script.name}</CardTitle>
                  <CardDescription className="mt-1">{script.subject}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(script)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Edit Email Script</DialogTitle>
                        <DialogDescription>Update the email template</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-name">Script Name</Label>
                          <Input
                            id="edit-name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-subject">Subject</Label>
                          <Input
                            id="edit-subject"
                            value={form.subject}
                            onChange={(e) => setForm({ ...form, subject: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-body">Body</Label>
                          <Textarea
                            id="edit-body"
                            value={form.body}
                            onChange={(e) => setForm({ ...form, body: e.target.value })}
                            rows={10}
                          />
                        </div>
                        <Button onClick={handleSaveEdit} className="w-full">
                          Save Changes
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" size="sm" onClick={() => handleDelete(script.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-mono whitespace-pre-wrap">
                  {script.body.substring(0, 150)}
                  {script.body.length > 150 ? "..." : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Updated {script.updated_at ? new Date(script.updated_at).toLocaleDateString() : "Recently"}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {scripts.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No email scripts yet</p>
              <p className="text-sm mt-1">Create your first script to get started</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
