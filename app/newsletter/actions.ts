"use server"

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
  const API_KEY = process.env.GOOGLE_SHEETS_API_KEY
  const SHEET_NAME = "Sheet1" // Default sheet name for gid=0

  if (!SPREADSHEET_ID || !API_KEY) {
    console.error("Google Sheets API credentials are not configured in environment variables.")
    return {
      message: "Service is currently unavailable. Please try again later.",
      success: false,
    }
  }

  const range = `${SHEET_NAME}!A:A`
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED&key=${API_KEY}`

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: [[validatedEmail.data]],
      }),
      cache: "no-store",
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Google Sheets API Error:", data?.error?.message)
      return {
        message: `Failed to subscribe. ${data?.error?.message || "Please try again."}`,
        success: false,
      }
    }

    return {
      message: "Success! You are now subscribed to our newsletter.",
      success: true,
    }
  } catch (error) {
    console.error("Error subscribing to newsletter:", error)
    return {
      message: "An unexpected error occurred. Please try again.",
      success: false,
    }
  }
}
