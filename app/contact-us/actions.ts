"use server"

import { z } from "zod"

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  subject: z.string().min(1, { message: "Please select a subject." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
})

export type FormState = {
  message: string
  errors?: {
    name?: string[]
    email?: string[]
    subject?: string[]
    message?: string[]
  }
  success: boolean
}

export async function submitContactForm(prevState: FormState, formData: FormData): Promise<FormState> {
  console.log("Server Action: Received form data", formData)

  const validatedFields = contactFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  })

  if (!validatedFields.success) {
    console.log("Server Action: Validation failed", validatedFields.error.flatten().fieldErrors)
    return {
      message: "Validation failed. Please check the form for errors.",
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    }
  }

  const { name, email, subject, message } = validatedFields.data

  // Here you would integrate with an email service like Resend, Nodemailer, or Formspree.
  // For this example, we'll simulate a successful submission.
  console.log("---- New Contact Form Submission ----")
  console.log(`From: ${name} <${email}>`)
  console.log(`Subject: ${subject}`)
  console.log(`Message: ${message}`)
  console.log("---- End of Submission ----")
  console.log("Simulating email to Morningvoyagebusiness@gmail.com")

  // Simulate a network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    message: "Thanks for reaching out — we’ll get back to you soon!",
    success: true,
  }
}
