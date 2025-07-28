import type React from "react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { ContactForm } from "@/components/contact/contact-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Instagram, Twitter, MessageCircle } from "lucide-react"
import Link from "next/link"

// A simple component for social links to avoid repetition
const SocialLink = ({
  href,
  icon: Icon,
  handle,
}: {
  href: string
  icon: React.ElementType
  handle: string
}) => (
  <Button variant="ghost" asChild className="w-full justify-start text-left h-auto p-4 hover:bg-white/60">
    <Link href={href} target="_blank" rel="noopener noreferrer">
      <Icon className="w-6 h-6 mr-4 text-[#6E6658]" />
      <div className="flex flex-col">
        <span className="font-semibold text-[#4B2E2E]">{handle}</span>
        <span className="text-sm text-[#6E6658]">Follow us on social media</span>
      </div>
    </Link>
  </Button>
)

export default function ContactUsPage() {
  return (
    <div className="bg-[#F6F1EB] min-h-screen">
      <Header />
      <main>
        <div className="container mx-auto px-4 py-24 sm:py-32">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
            {/* Left Column: Form */}
            <div className="bg-white/50 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-white/20">
              <h1 className="text-4xl font-black text-[#4B2E2E] mb-4 tracking-tight">Got a question?</h1>
              <p className="text-[#6E6658] mb-8 text-balance">
                Whether it’s about your order, a product suggestion, or a collab idea — don’t hesitate to reach out.
                We’re a small team, but we answer everything (yep, even the “do you guys have decaf?” emails).
              </p>
              <ContactForm />
            </div>

            {/* Right Column: Info & Socials */}
            <div className="space-y-8 lg:pt-16">
              <Card className="bg-white/50 backdrop-blur-lg border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#4B2E2E] flex items-center">
                    <MessageCircle className="mr-3 text-[#9E7C83]" />
                    Social Media
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-[#6E6658] mb-4">DMs open. Always.</p>
                  <div className="space-y-2">
                    <SocialLink
                      href="https://instagram.com/MorningVoyage.co"
                      icon={Instagram}
                      handle="@MorningVoyage.co"
                    />
                    <SocialLink href="https://twitter.com/MorningVoyage.co" icon={Twitter} handle="@MorningVoyage.co" />
                    {/* Placeholder for TikTok */}
                    <Button variant="ghost" disabled className="w-full justify-start text-left h-auto p-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-6 h-6 mr-4 text-[#6E6658]"
                      >
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.04-5.36-.01-4.03-.01-8.05.02-12.07z" />
                      </svg>
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#4B2E2E]">@MorningVoyage.co</span>
                        <span className="text-sm text-[#6E6658]">Coming Soon</span>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
