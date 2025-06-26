"use client"

import { Coffee, Gift, Calendar, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"

const benefits = [
  {
    icon: Coffee,
    title: "Always Fresh",
    description: "Roasted after you order",
    gradient: "from-[#4B2E2E] to-[#6E6658]",
  },
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On all subscriptions",
    gradient: "from-[#6E6658] to-[#9E7C83]",
  },
  {
    icon: Calendar,
    title: "Flexible Schedule",
    description: "Skip, pause, or cancel anytime",
    gradient: "from-[#9E7C83] to-[#D5BFA3]",
  },
]

export default function SubscriptionHero() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-[#D5BFA3]/20 to-[#9E7C83]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-br from-[#4B2E2E]/10 to-[#6E6658]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 shadow-lg mb-6">
            <Gift className="w-4 h-4 text-[#D5BFA3]" />
            <span className="text-[#4B2E2E] text-sm font-semibold tracking-wide">NEVER RUN OUT</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#4B2E2E] mb-6 tracking-tight">
            Coffee
            <span className="block bg-gradient-to-r from-[#9E7C83] to-[#6E6658] bg-clip-text text-transparent">
              Subscriptions
            </span>
          </h1>

          <p className="text-xl text-[#6E6658] max-w-3xl mx-auto font-light leading-relaxed mb-12">
            Get freshly roasted coffee delivered to your door on your schedule. Save money, never run out, and discover
            new favorites with our flexible subscription plans.
          </p>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            {benefits.map((benefit, index) => (
              <div
                key={benefit.title}
                className="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                {/* Gradient Background on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                ></div>

                <div className="relative z-10 text-center">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${benefit.gradient} rounded-2xl mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                  >
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-[#4B2E2E] mb-2 group-hover:text-[#6E6658] transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-[#6E6658] text-sm font-light">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#4B2E2E] to-[#6E6658] hover:from-[#6E6658] hover:to-[#4B2E2E] text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group font-semibold"
            >
              <Coffee className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
              Start Subscription
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-[#4B2E2E] text-[#4B2E2E] hover:bg-[#4B2E2E] hover:text-white px-8 py-4 rounded-2xl backdrop-blur-sm bg-white/50 shadow-lg hover:shadow-xl transition-all duration-300 group font-semibold"
            >
              <Gift className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              Gift Subscriptions
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
