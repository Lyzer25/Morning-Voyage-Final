"use client"

import { useActionState, useEffect, useRef } from "react"
import { subscribeToNewsletter } from "@/app/newsletter/actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ArrowRight } from "lucide-react"

export function Newsletter() {
  const [state, formAction, isPending] = useActionState(subscribeToNewsletter, {
    message: "",
    success: false,
  })
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message)
        formRef.current?.reset()
      } else {
        toast.error(state.message)
      }
    }
  }, [state])

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-[#D7CCC8] text-[#5D4037]">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 items-center">
          <div className="flex flex-col justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-[#5D4037] font-serif">
                Join Our Coffee Club
              </h2>
              <p className="max-w-[600px] mx-auto md:text-xl">
                Stay up to date with our latest brews, offers, and coffee stories. Subscribe to our newsletter.
              </p>
            </div>
            <div className="w-full max-w-sm mx-auto space-y-2">
              <form ref={formRef} action={formAction} className="flex space-x-2">
                <Input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="max-w-lg flex-1 bg-white/80 placeholder:text-[#8D6E63] border-[#8D6E63] focus:ring-[#5D4037]"
                  required
                  disabled={isPending}
                />
                <Button
                  type="submit"
                  className="bg-[#5D4037] text-white hover:bg-[#4E342E] disabled:bg-gray-400"
                  disabled={isPending}
                >
                  {isPending ? "Subscribing..." : "Subscribe"}
                  {!isPending && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
