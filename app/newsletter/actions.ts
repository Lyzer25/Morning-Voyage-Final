"use server"

import { google } from "googleapis"
import { z } from "zod"

const emailSchema = z.string().email({ message: "Please enter a valid email address." })

export async function subscribeToNewsletter(
  prevState: any,
  formData: FormData,
): Promise<{ message: string; success: boolean }> {
  const email = formData.get("email")

  const validatedEmail = emailSchema.safeParse(email)

  if (!validatedEmail.success) {
    return {
      message: validatedEmail.error.errors[0].message,
      success: false,
    }
  }

  const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID
  const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY

  if (!SPREADSHEET_ID || !SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
    console.error("Google Sheets service account credentials are not configured.")
    return {
      message: "Service is currently unavailable. Please try again later.",
      success: false,
    }
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: SERVICE_ACCOUNT_EMAIL,
        // Vercel automatically handles newlines in environment variables, but this ensures it works locally too.
        private_key: PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    const range = "Sheet1!A:A"

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[validatedEmail.data]],
      },
    })

    return {
      message: "Success! You are now subscribed to our newsletter.",
      success: true,
    }
  } catch (error: any) {
    console.error("Google Sheets API Error:", error.message)
    return {
      message: "Failed to subscribe. The API returned an error. Please check server logs.",
      success: false,
    }
  }
}
