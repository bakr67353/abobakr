import { AuthWrapper } from "@/components/auth-wrapper"
import { EmailHistoryManager } from "@/components/email-history-manager"

export default function EmailHistoryPage() {
  return (
    <AuthWrapper requireAdmin>
      <EmailHistoryManager />
    </AuthWrapper>
  )
}
