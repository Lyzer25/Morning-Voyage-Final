"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Coffee, Loader2 } from "lucide-react"

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)

  useEffect(() => {
    setIsLoading(true)

    // Scroll to top immediately when route changes
    window.scrollTo({ top: 0, behavior: "smooth" })

    const timer = setTimeout(() => {
      setDisplayChildren(children)
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [pathname, children])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-[#4B2E2E] to-[#6E6658] rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl">
              <Coffee className="w-10 h-10 text-white" />
            </div>

            {/* Spinning loader around the coffee icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-24 h-24 text-[#D5BFA3] animate-spin" />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[#4B2E2E] font-bold text-lg">Loading...</p>
            <p className="text-[#6E6658] font-light">Brewing your experience</p>
          </div>

          {/* Animated dots */}
          <div className="flex justify-center space-x-1 mt-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-[#D5BFA3] rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return <div className="animate-in fade-in duration-300">{displayChildren}</div>
}
