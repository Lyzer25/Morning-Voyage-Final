"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link" // Ensure Link is imported

export default function BrandStory() {
  return (
    <section className="py-16 md:py-24 bg-[#F5F0EB]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content - Image/Visual */}
          <div className="relative">
            <img
              src="/placeholder.svg?height=600&width=800"
              alt="Coffee roasting process"
              className="rounded-3xl shadow-xl w-full h-auto object-cover"
            />
            <div className="absolute -bottom-8 -right-8 bg-[#D5BFA3] p-6 rounded-full shadow-lg">
              <span className="text-4xl font-bold text-[#4B2E2E]">☕</span>
            </div>
          </div>

          {/* Right Content - Text */}
          <div className="space-y-8 lg:pl-8">
            <h2 className="text-4xl sm:text-5xl font-black text-[#4B2E2E] leading-tight">
              Our Story: More Than Just a Cup
            </h2>
            <p className="text-xl text-[#6E6658] leading-relaxed font-light">
              At Morning Voyage, we believe coffee is an experience, not just a drink. It's the quiet moment before the
              day begins, the shared laughter with friends, the fuel for your next big idea. Our journey started with a
              simple passion: to bring exceptional, freshly roasted coffee directly to your home.
            </p>
            <p className="text-xl text-[#6E6658] leading-relaxed font-light">
              We meticulously source beans from sustainable farms, ensuring every sip tells a story of quality and care.
              Our commitment to freshness means your coffee is roasted only after you order, preserving its peak flavor
              and aroma.
            </p>
            <Link href="/about-us">
              {" "}
              {/* Updated href to /about-us */}
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-[#4B2E2E] text-[#4B2E2E] hover:bg-[#4B2E2E] hover:text-white px-8 py-6 text-lg rounded-2xl backdrop-blur-sm bg-white/50 shadow-lg hover:shadow-xl transition-all duration-300 group font-semibold"
              >
                Learn More About Us
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
