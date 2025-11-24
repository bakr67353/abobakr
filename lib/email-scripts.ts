export interface EmailScript {
  id: string
  name: string
  subject: string
  body: string
  user_id?: string
  created_at?: string
  updated_at?: string
  createdAt?: Date
  updatedAt?: Date
}

export async function getAllScripts(): Promise<EmailScript[]> {
  try {
    const response = await fetch('/api/scripts')
    if (!response.ok) {
      throw new Error('Failed to fetch scripts')
    }
    const data = await response.json()
    return data.scripts || []
  } catch (error) {
    console.error('[v0] Error fetching scripts:', error)
    return []
  }
}

export async function getScriptById(id: string): Promise<EmailScript | undefined> {
  try {
    const scripts = await getAllScripts()
    return scripts.find((s) => s.id === id)
  } catch (error) {
    console.error('[v0] Error fetching script by id:', error)
    return undefined
  }
}

export async function createScript(script: Omit<EmailScript, "id" | "created_at" | "updated_at" | "createdAt" | "updatedAt">): Promise<EmailScript | null> {
  try {
    const response = await fetch('/api/scripts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(script),
    })
    if (!response.ok) {
      throw new Error('Failed to create script')
    }
    const data = await response.json()
    return data.script || null
  } catch (error) {
    console.error('[v0] Error creating script:', error)
    return null
  }
}

export async function updateScript(id: string, updates: Partial<Omit<EmailScript, "id" | "created_at" | "updated_at" | "createdAt" | "updatedAt">>): Promise<boolean> {
  try {
    const response = await fetch(`/api/scripts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    return response.ok
  } catch (error) {
    console.error('[v0] Error updating script:', error)
    return false
  }
}

export async function deleteScript(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/scripts/${id}`, {
      method: 'DELETE',
    })
    return response.ok
  } catch (error) {
    console.error('[v0] Error deleting script:', error)
    return false
  }
}

// Helper function to replace template variables
export function replaceTemplateVariables(template: string, variables: Record<string, string>): string {
  let result = template
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, "g"), value)
  })
  return result
}
