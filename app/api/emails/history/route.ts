import { type NextRequest, NextResponse } from "next/server"
import { getSentEmails, getAllSentEmails } from "@/lib/emails"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userEmail = searchParams.get("userEmail")

    if (userEmail) {
      const emails = getSentEmails(userEmail)
      return NextResponse.json({ emails })
    }

    // Return all emails (admin only in a real app)
    const emails = getAllSentEmails()
    return NextResponse.json({ emails })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
