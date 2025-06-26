import { NextResponse } from "next/server"
import { handleSheetWebhook } from "@/lib/google-sheets-integration"

export async function POST(request: Request) {
  try {
    const payload = await request.json()

    // Verify webhook authenticity (implement your security check)
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await handleSheetWebhook(payload)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ success: false, error: "Webhook processing failed" }, { status: 500 })
  }
}
