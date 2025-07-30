"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Gift, Sparkles } from "lucide-react"
import { useState } from "react"

export default function Newsletter() {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter signup
    console.log("Newsletter signup:", email)
    setEmail("")
  }

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#4B2E2E] via-[#6E6658] to-[#9E7C83]"></div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-8 shadow-2xl">
            <Gift className="w-10 h-10 text-white" />
          </div>

          {/* Heading */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
            SUBSCRIBE NOW
            <span className="block bg-gradient-to-r from-[#D5BFA3] to-[#E7CFC7] bg-clip-text text-transparent">
              Explore the Depths of Morning Brew
            </span>
          </h2>

          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Subscribe to our newsletter and receive exclusive offers, brewing tips, and be the first to know about new
            coffee releases and fashion drops.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6E6658]" />
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 bg-white/95 backdrop-blur-sm border-0 text-[#4B2E2E] placeholder:text-[#6E6658] rounded-2xl shadow-lg font-medium text-lg"
                  required
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="bg-white hover:bg-white/90 text-[#4B2E2E] font-bold h-14 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group"
              >
                <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                Subscribe & Save
              </Button>
            </div>
          </form>

          {/* Benefits */}
          <div className="grid sm:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
            {[
              { icon: "✨", text: "New Release Alerts" },
              { icon: "☕", text: "Exclusive Coffee Tips" },
              { icon: "👕", text: "Early Fashion Access" },
            ].map((benefit, index) => (
              <div key={index} className="flex items-center justify-center space-x-2 text-white/90">
                <span className="text-2xl">{benefit.icon}</span>
                <span className="font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-white/70 font-light">
            No spam, unsubscribe at any time. By subscribing, you agree to our privacy policy.
          </p>
        </div>
      </div>
    </section>
  )
}
