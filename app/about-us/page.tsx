import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Footer from "@/components/layout/footer"
import Header from "@/components/layout/header"
import { Coffee, Gem, BrainCircuit, Calendar, ArrowRight } from "lucide-react"

const teamMembers = [
  {
    name: "Treavon",
    role: "Founder & CEO",
    description:
      "The brain behind the brew. Treavon took a love for great coffee and turned it into a brand with a fresh kick. From taste-testing every roast to sweating the small stuff (like how the box opens), they’re the reason your mornings are a little less chaotic and a lot more caffeinated.",
    favoriteBrew: "Medium roast with oat milk — smooth, bold, and slightly over-caffeinated.",
    morningMood: "Somewhere between “let’s crush it” and “where’s my mug?”",
    quote: "“Built this brand like I build my coffee — strong, hot, and slightly chaotic.”",
    avatar: "/placeholder-user.jpg",
    initials: "T",
  },
  {
    name: "Barr",
    role: "Co-Owner & Head of Technology",
    description:
      "The wizard behind the screen. Barr handles all things back end and front end — from keeping our website running smoothly to integrating subscription systems and optimizing your shopping experience. Basically, if it runs like clockwork, thank them.",
    favoriteBrew: "Iced espresso, hold the nonsense.",
    morningMood: "Caffeine first, code second.",
    quote: "“If it’s digital, I’m behind it.”",
    avatar: "/placeholder-user.jpg",
    initials: "B",
  },
]

const brandPillars = [
  {
    icon: Coffee,
    title: "Freshly Roasted, Always",
    description: "Your coffee is never pre-packed or warehouse-aged. We roast when you order.",
  },
  {
    icon: Gem,
    title: "Quality in Every Detail",
    description: "From sourcing to roast level, every decision is made with flavor in mind.",
  },
  {
    icon: BrainCircuit,
    title: "Crafted for Clarity",
    description: "Smooth, rich, and clean-tasting blends that help you start clear and stay focused.",
  },
  {
    icon: Calendar,
    title: "Built for Your Routine",
    description: "Whether it’s 5 AM hustle or slow Sunday mornings, our coffee fits your flow.",
  },
]

export default function AboutUsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF8]">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 sm:py-32 bg-gradient-to-b from-white to-[#FDFBF8]">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#4B2E2E] leading-tight tracking-tight">
              A Story Brewed with
              <span className="block bg-gradient-to-r from-[#9E7C83] to-[#6E6658] bg-clip-text text-transparent mt-2">
                Passion and Purpose
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-[#6E6658] leading-relaxed">
              We're more than just a coffee company. We're a team of creators, thinkers, and coffee lovers dedicated to
              perfecting your daily ritual.
            </p>
          </div>
        </section>

        {/* Meet the Team Section */}
        <section className="py-20 sm:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-[#4B2E2E] mb-16">
              Meet the Team Behind the Brew
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto">
              {teamMembers.map((member) => (
                <Card key={member.name} className="bg-white/50 border-gray-200/50 shadow-lg overflow-hidden">
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <Avatar className="w-24 h-24 mb-4 border-4 border-white shadow-md">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                      <AvatarFallback className="text-3xl bg-[#D5BFA3] text-white">{member.initials}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-2xl font-bold text-[#4B2E2E]">{member.name}</h3>
                    <p className="text-sm font-semibold text-[#9E7C83] mb-4">{member.role}</p>
                    <p className="text-[#6E6658] mb-6">{member.description}</p>
                    <div className="text-left space-y-3 text-sm w-full">
                      <p>
                        <strong className="text-[#4B2E2E]">Favorite Brew:</strong>{" "}
                        <span className="text-[#6E6658]">{member.favoriteBrew}</span>
                      </p>
                      <p>
                        <strong className="text-[#4B2E2E]">Morning Mood:</strong>{" "}
                        <span className="text-[#6E6658]">{member.morningMood}</span>
                      </p>
                      <p className="italic">
                        <strong className="text-[#4B2E2E]">Quote:</strong>{" "}
                        <span className="text-[#6E6658]">{member.quote}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why We Exist Section */}
        <section className="py-20 sm:py-24 bg-white">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#4B2E2E] mb-6">Why We Exist</h2>
            <div className="space-y-4 text-lg text-[#6E6658] leading-relaxed">
              <p>
                Morning Voyage Coffee was created because we were tired of the ordinary. Coffee that sat on shelves too
                long. Brews that felt more like routine than ritual.
              </p>
              <p>
                So we decided to do it differently — with a relentless focus on freshness, quality, and consistency.
              </p>
              <p className="font-semibold text-[#4B2E2E]">
                Our beans are roasted to order in small batches, giving you a cup that’s full of life, not leftovers.
                Because the right coffee doesn’t just wake you up — it elevates you.
              </p>
            </div>
          </div>
        </section>

        {/* What We're All About Section */}
        <section className="py-20 sm:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-[#4B2E2E] mb-16">What We’re All About</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {brandPillars.map((pillar) => (
                <div key={pillar.title} className="text-center p-6">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D5BFA3]/50 to-[#9E7C83]/50 flex items-center justify-center">
                      <pillar.icon className="w-8 h-8 text-[#4B2E2E]" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[#4B2E2E] mb-2">{pillar.title}</h3>
                  <p className="text-[#6E6658]">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The Voyage Ahead Section */}
        <section className="py-20 sm:py-24 bg-white">
          <div className="container mx-auto px-4">
            <Card className="bg-gradient-to-r from-[#4B2E2E] to-[#6E6658] text-white border-none">
              <CardContent className="p-10 sm:p-16 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">🧭 The Voyage Ahead</h2>
                <div className="max-w-3xl mx-auto space-y-4 text-lg text-gray-200 leading-relaxed">
                  <p>
                    Morning Voyage Coffee is more than a brand — it’s a mindset. We’re building something lasting: a
                    daily ritual rooted in quality, intention, and care.
                  </p>
                  <p>
                    As we grow, so will our lineup of roasts, offerings, and ways to support your routine — but one
                    thing stays the same: <strong className="text-white">We never compromise on the coffee.</strong>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 sm:py-32">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#4B2E2E] mb-4">Take Off With Us</h2>
            <p className="text-lg text-[#6E6658] mb-2">Start strong. Stay steady.</p>
            <p className="text-lg text-[#6E6658] mb-8">Your voyage begins here — one fresh cup at a time.</p>
            <Button
              size="lg"
              className="bg-[#4B2E2E] hover:bg-[#3a2323] text-white px-8 py-6 rounded-xl text-base font-semibold"
            >
              Shop Our Coffee
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
