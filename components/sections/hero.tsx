"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Coffee, Sparkles, Play } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-[#D5BFA3]/20 to-[#9E7C83]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-[#4B2E2E]/10 to-[#6E6658]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-br from-[#E7CFC7]/30 to-[#D5BFA3]/30 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 lg:pr-8">
            <div className="inline-flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 shadow-lg">
              <div className="w-2 h-2 bg-[#D5BFA3] rounded-full animate-pulse"></div>
              <span className="text-[#4B2E2E] text-sm font-semibold tracking-wide">FRESHLY ROASTED DAILY</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-[#4B2E2E] leading-[0.9] tracking-tight">
                Freshly
                <span className="block bg-gradient-to-r from-[#9E7C83] to-[#6E6658] bg-clip-text text-transparent">
                  Roasted,
                </span>
                <span className="block text-4xl sm:text-5xl lg:text-6xl font-light text-[#6E6658]">Just for You</span>
              </h1>

              <p className="text-xl text-[#6E6658] max-w-xl leading-relaxed font-light">
                We don't believe in shelf-sitters. Every bag of coffee is{" "}
                <span className="font-semibold text-[#4B2E2E]">roasted after you order</span>—never before. Peak
                freshness, bold flavor, uncompromising quality.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#4B2E2E] to-[#6E6658] hover:from-[#6E6658] hover:to-[#4B2E2E] text-white px-8 py-6 text-lg rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 group font-semibold"
              >
                Shop Coffee
                <Coffee className="ml-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-[#4B2E2E] text-[#4B2E2E] hover:bg-[#4B2E2E] hover:text-white px-8 py-6 text-lg rounded-2xl backdrop-blur-sm bg-white/50 shadow-lg hover:shadow-xl transition-all duration-300 group font-semibold"
              >
                Explore Fashion
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>

            {/* Modern Stats */}
            <div className="grid grid-cols-3 gap-8 pt-12">
              {[
                { value: "24hrs", label: "Fresh Roasted", icon: "⚡" },
                { value: "50+", label: "Coffee Blends", icon: "☕" },
                { value: "10k+", label: "Happy Customers", icon: "❤️" },
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold text-[#4B2E2E] group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </div>
                  <div className="text-sm text-[#6E6658] font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Modern Coffee Showcase */}
          <div className="relative lg:pl-8">
            <div className="relative">
              {/* Main Card */}
              <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                <div className="aspect-square bg-gradient-to-br from-[#4B2E2E] via-[#6E6658] to-[#9E7C83] rounded-2xl flex items-center justify-center relative overflow-hidden">
                  {/* Animated Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>

                  <div className="text-center text-white relative z-10">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mx-auto mb-6 flex items-center justify-center">
                      <Coffee className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Premium Coffee</h3>
                    <p className="text-lg opacity-90 font-light">Artisan roasted to perfection</p>
                  </div>
                </div>

                {/* Floating Action Button */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                  <Button
                    size="icon"
                    className="w-12 h-12 bg-white text-[#4B2E2E] rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300"
                  >
                    <Play className="w-5 h-5 ml-0.5" />
                  </Button>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-br from-[#D5BFA3] to-[#9E7C83] rounded-2xl flex items-center justify-center shadow-xl rotate-12 hover:rotate-0 transition-transform duration-500">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-br from-[#9E7C83] to-[#6E6658] rounded-2xl flex items-center justify-center shadow-xl -rotate-12 hover:rotate-0 transition-transform duration-500">
                <Coffee className="w-10 h-10 text-white" />
              </div>

              {/* Decorative Dots */}
              <div className="absolute top-4 left-4 grid grid-cols-3 gap-2">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-[#D5BFA3] rounded-full opacity-60"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        
      </div>
    </section>
  )
}
