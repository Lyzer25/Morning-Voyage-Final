"use client"

import { useActionState, useEffect, useRef } from "react"
import { submitContactForm, type FormState } from "@/app/contact-us/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, AlertTriangle, LoaderCircle } from "lucide-react"

const initialState: FormState = {
  message: "",
  success: false,
}

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Message Sent!",
        description: state.message,
        variant: "default",
        action: <CheckCircle className="text-green-500" />,
      })
      formRef.current?.reset()
    } else if (state.message && state.errors) {
      toast({
        title: "Oops! Something went wrong.",
        description: state.message,
        variant: "destructive",
        action: <AlertTriangle className="text-red-500" />,
      })
    }
  }, [state, toast])

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" placeholder="Your Name" required className="bg-white/80" />
        {state.errors?.name && <p className="text-sm text-red-500">{state.errors.name[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" name="email" type="email" placeholder="you@example.com" required className="bg-white/80" />
        {state.errors?.email && <p className="text-sm text-red-500">{state.errors.email[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Select name="subject" required>
          <SelectTrigger className="w-full bg-white/80">
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Order Question">Order Question</SelectItem>
            <SelectItem value="Product Suggestion">Product Suggestion</SelectItem>
            <SelectItem value="Collaboration Idea">Collaboration Idea</SelectItem>
            <SelectItem value="General Inquiry">General Inquiry</SelectItem>
          </SelectContent>
        </Select>
        {state.errors?.subject && <p className="text-sm text-red-500">{state.errors.subject[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Tell us what's on your mind..."
          required
          rows={6}
          className="bg-white/80"
        />
        {state.errors?.message && <p className="text-sm text-red-500">{state.errors.message[0]}</p>}
      </div>
      <div>
        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-gradient-to-r from-[#4B2E2E] via-[#6E6658] to-[#9E7C83] hover:from-[#6E6658] hover:via-[#9E7C83] hover:to-[#4B2E2E] text-white px-6 py-3 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105"
        >
          {isPending ? (
            <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Message"
          )}
        </Button>
        <p className="text-xs text-center text-[#6E6658] mt-4">
          We typically respond within 24–48 hours, Monday–Friday.
        </p>
      </div>
    </form>
  )
}
