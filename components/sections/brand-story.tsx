import { Heart, Users, Leaf, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function BrandStory() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#F6F1EB]/50 via-transparent to-[#E7CFC7]/30"></div>
        <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-[#D5BFA3]/20 to-[#9E7C83]/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Left Content */}
          <div className="space-y-8 lg:pr-8">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 shadow-lg">
                <div className="w-2 h-2 bg-[#D5BFA3] rounded-full animate-pulse"></div>
                <span className="text-[#4B2E2E] text-sm font-semibold tracking-wide">OUR STORY</span>
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#4B2E2E] leading-tight tracking-tight">
                Passion Meets
                <span className="block bg-gradient-to-r from-[#9E7C83] to-[#6E6658] bg-clip-text text-transparent">
                  Perfection
                </span>
              </h2>

              <div className="space-y-4">
                <p className="text-xl text-[#6E6658] leading-relaxed font-light">
                  Morning Voyage was born from a simple belief: everyone deserves exceptional coffee. We started as
                  coffee enthusiasts who were tired of stale, mass-produced beans sitting on shelves for months.
                </p>
                <p className="text-lg text-[#6E6658] leading-relaxed font-light">
                  Today, we've expanded beyond coffee to create a lifestyle brand that celebrates quality, freshness,
                  and intentional living. Our fashion line embodies the same principles—crafted with care, made to last,
                  and designed to stand out.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  icon: Heart,
                  title: "Passion",
                  desc: "Driven by love for quality",
                  color: "from-[#4B2E2E] to-[#6E6658]",
                },
                { icon: Users, title: "Community", desc: "Building connections", color: "from-[#9E7C83] to-[#6E6658]" },
                {
                  icon: Leaf,
                  title: "Sustainability",
                  desc: "Caring for our planet",
                  color: "from-[#D5BFA3] to-[#9E7C83]",
                },
              ].map((item, index) => (
                <div key={index} className="text-center group">
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${item.color} rounded-2xl mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                  >
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-[#4B2E2E] mb-2 text-lg">{item.title}</h3>
                  <p className="text-sm text-[#6E6658] font-light">{item.desc}</p>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              variant="outline"
              className="border-2 border-[#4B2E2E] text-[#4B2E2E] hover:bg-[#4B2E2E] hover:text-white px-8 py-4 rounded-2xl backdrop-blur-sm bg-white/50 shadow-lg hover:shadow-xl transition-all duration-300 group font-semibold"
            >
              Learn More About Us
              <Heart className="ml-3 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
            </Button>
          </div>

          {/* Right Content - Modern Visual */}
          <div className="relative lg:pl-8">
            <div className="relative">
              {/* Main Visual Card */}
              <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 overflow-hidden">
                <div className="aspect-[4/5] bg-gradient-to-br from-[#4B2E2E] via-[#6E6658] to-[#9E7C83] rounded-2xl flex items-center justify-center relative overflow-hidden">
                  {/* Animated Background */}
                  <div className="absolute inset-0">
                    <div className="absolute top-4 left-4 w-16 h-16 bg-white/10 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-8 right-8 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-500"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/5 rounded-full animate-pulse delay-1000"></div>
                  </div>

                  <div className="text-center text-white relative z-10">
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full mx-auto mb-6 flex items-center justify-center">
                      <Heart className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Our Story</h3>
                    <p className="text-lg opacity-90 font-light mb-6">Crafted with passion</p>

                    {/* Play Button */}
                    <Button
                      size="icon"
                      className="w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full shadow-xl hover:scale-110 transition-all duration-300"
                    >
                      <Play className="w-5 h-5 ml-0.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-8 -right-8 w-20 h-20 bg-gradient-to-br from-[#D5BFA3] to-[#9E7C83] rounded-3xl flex items-center justify-center shadow-xl rotate-12 hover:rotate-0 transition-transform duration-500">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-br from-[#9E7C83] to-[#6E6658] rounded-3xl flex items-center justify-center shadow-xl -rotate-12 hover:rotate-0 transition-transform duration-500">
                <Leaf className="w-12 h-12 text-white" />
              </div>

              {/* Decorative Grid */}
              <div className="absolute top-8 left-8 grid grid-cols-4 gap-2 opacity-60">
                {[...Array(16)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 h-1 bg-[#D5BFA3] rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
